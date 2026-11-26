// PROD-3455: the sync lock, atomic writes, and repair of an already-damaged cache.
// No network: the Fetch API is faked (see _fakeFetch.js).

import chai from 'chai'
import fs from 'fs'
import path from 'path'
import { spawn } from 'child_process'
import store from '../src/store-interface-filesystem'
import {
	LIST_REF,
	createStubbedSyncClient,
	defaultChanges,
	expectedList,
	findCorruptFiles,
	makeTmpRoot,
	seedCache,
	seedItems,
} from './_fakeFetch'

const assert = chai.assert
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const readJson = (...parts) => JSON.parse(fs.readFileSync(path.join(...parts), 'utf8'))
const listSignature = (list) => list.map((i) => `${i.contentID}:${i.fields.title.length}`).join(',')

describe('sync lock and cache repair (PROD-3455, unit):', function () {
	this.timeout('60s')

	let roots = []
	const newRoot = () => {
		const r = makeTmpRoot()
		roots.push(r)
		return r
	}
	afterEach(function () {
		for (const r of roots) fs.rmSync(r, { recursive: true, force: true })
		roots = []
	})

	describe('repairing a damaged cache:', function () {
		it('a list file with trailing bytes is moved aside and rebuilt, and the sync completes', async function () {
			const rootPath = newRoot()
			const seed = seedItems()
			const changes = defaultChanges()
			seedCache(rootPath, seed)

			// exactly what Havas found: valid JSON followed by leftover bytes
			const listFile = path.join(rootPath, 'en-us', 'list', `${LIST_REF}.json`)
			fs.appendFileSync(listFile, '"}],"x":1}')

			const feed = [...seed, ...changes]
			await createStubbedSyncClient(rootPath, feed).runSync()

			assert.deepEqual(findCorruptFiles(rootPath), [])
			assert.strictEqual(listSignature(readJson(listFile)), listSignature(expectedList(seed, changes)))
			assert.strictEqual(readJson(rootPath, 'en-us', 'state', 'sync.json').itemToken, feed.length)

			const quarantined = fs.readdirSync(path.dirname(listFile)).filter((f) => f.includes('.corrupt-'))
			assert.lengthOf(quarantined, 1, 'the damaged file is kept aside for diagnosis')
		})

		it('a damaged sync state file triggers a full re-sync instead of failing', async function () {
			const rootPath = newRoot()
			const seed = seedItems()
			const changes = defaultChanges()
			seedCache(rootPath, seed)
			fs.writeFileSync(path.join(rootPath, 'en-us', 'state', 'sync.json'), '{"itemToken":36,"pageTo')

			const feed = [...seed, ...changes]
			await createStubbedSyncClient(rootPath, feed).runSync()

			assert.deepEqual(findCorruptFiles(rootPath), [])
			assert.strictEqual(readJson(rootPath, 'en-us', 'state', 'sync.json').itemToken, feed.length)
			const list = readJson(rootPath, 'en-us', 'list', `${LIST_REF}.json`)
			assert.strictEqual(listSignature(list), listSignature(expectedList(seed, changes)))
		})

		it('many damaged files are all repaired with one full re-sync, including files the sync never reads', async function () {
			const rootPath = newRoot()
			const seed = seedItems()
			const changes = defaultChanges()
			seedCache(rootPath, seed)

			const lang = path.join(rootPath, 'en-us')
			// the list, two items, a page and a sitemap; the sync itself only ever reads the list
			fs.mkdirSync(path.join(lang, 'page'), { recursive: true })
			fs.mkdirSync(path.join(lang, 'sitemap'), { recursive: true })
			fs.writeFileSync(path.join(lang, 'page', '9.json'), '{"pageID":9,"zon')
			fs.writeFileSync(path.join(lang, 'sitemap', 'website.json'), '{"/a":1}xx')
			fs.appendFileSync(path.join(lang, 'list', `${LIST_REF}.json`), '"}]')
			fs.appendFileSync(path.join(lang, 'item', '20.json'), 'garbage')
			fs.appendFileSync(path.join(lang, 'item', '21.json'), '}')

			const feed = [...seed, ...changes]
			const client = createStubbedSyncClient(rootPath, feed)
			let fullPasses = 0
			const original = client.agilityClient.getSyncContent
			client.agilityClient.getSyncContent = async (args) => {
				if (args.syncToken === 0) fullPasses++
				return original(args)
			}
			await client.runSync()

			assert.strictEqual(fullPasses, 1, 'one full re-sync, not one per damaged file')
			assert.deepEqual(findCorruptFiles(rootPath), [])
			assert.strictEqual(listSignature(readJson(lang, 'list', `${LIST_REF}.json`)), listSignature(expectedList(seed, changes)))
			assert.strictEqual(readJson(lang, 'item', '20.json').contentID, 20, 'item rebuilt by the full sync')
			const corruptCount = (dir) => fs.readdirSync(path.join(lang, dir)).filter((f) => f.includes('.corrupt-')).length
			assert.strictEqual(corruptCount('page') + corruptCount('sitemap'), 2, 'page and sitemap moved aside too')
		})

		it('stops at once when the store did not move anything, instead of re-syncing for nothing', async function () {
			const rootPath = newRoot()
			const seed = seedItems(3)
			seedCache(rootPath, seed)

			// a custom store whose getItem reports a damaged state file it can't say where to find
			let stateReads = 0
			const customStore = {
				...store,
				getItem: async (args) => {
					if (args.itemType === 'state') {
						stateReads++
						const err = new Error('state is damaged')
						err.code = 'AGILITY_SYNC_CORRUPT_FILE'
						throw err
					}
					return store.getItem(args)
				},
			}
			const client = createStubbedSyncClient(rootPath, seed, { store: { interface: customStore, options: { rootPath: newRoot() } } })

			let message = null
			try {
				await client.runSync()
			} catch (err) {
				message = err.message
			}
			assert.strictEqual(message, 'state is damaged')
			assert.strictEqual(stateReads, 1, 'no re-sync rounds when nothing was moved')
		})

		it('other errors are not swallowed, and the lock is released after them', async function () {
			const rootPath = newRoot()
			const seed = seedItems()
			seedCache(rootPath, seed)

			const failing = createStubbedSyncClient(rootPath, seed, { failSyncItems: new Error('network down') })
			let message = null
			try {
				await failing.runSync()
			} catch (err) {
				message = err.message
			}
			assert.strictEqual(message, 'network down')

			// if the lock leaked, this would wait for the full lock timeout
			const started = Date.now()
			await createStubbedSyncClient(rootPath, [...seed, ...defaultChanges()]).runSync()
			assert.isBelow(Date.now() - started, 5000)
		})
	})

	describe('atomic writes:', function () {
		it('a reader never sees a half-written file while the same file is rewritten', async function () {
			const rootPath = newRoot()
			const options = { rootPath }
			const long = { v: 'x'.repeat(50000) }
			const short = { v: 'y' }
			await store.saveItem({ options, item: long, itemType: 'list', languageCode: 'en-us', itemID: 'busy' })

			let writing = true
			const writer = (async () => {
				for (let i = 0; i < 300; i++) {
					await store.saveItem({ options, item: i % 2 ? short : long, itemType: 'list', languageCode: 'en-us', itemID: 'busy' })
				}
				writing = false
			})()

			let reads = 0
			let failures = 0
			while (writing) {
				try {
					await store.getItem({ options, itemType: 'list', languageCode: 'en-us', itemID: 'busy' })
				} catch (err) {
					failures++
				}
				reads++
			}
			await writer

			assert.isAbove(reads, 10)
			assert.strictEqual(failures, 0, `${failures}/${reads} reads failed`)
			const leftovers = fs.readdirSync(path.join(rootPath, 'en-us', 'list')).filter((f) => f.endsWith('.tmp'))
			assert.deepEqual(leftovers, [], 'no temp files left behind')
		})
	})

	describe('the lock:', function () {
		it('runSync holds it: a second runSync on the same folder waits for the first', async function () {
			const rootPath = newRoot()
			const seed = seedItems(5)
			seedCache(rootPath, seed)
			const feed = [...seed, ...defaultChanges()]

			const events = []
			const slow = createStubbedSyncClient(rootPath, feed, { syncItemsDelayMs: 100 })
			const fast = createStubbedSyncClient(rootPath, feed)
			const wrap = (name, client) => {
				const original = client.agilityClient.getSyncContent
				client.agilityClient.getSyncContent = async (args) => {
					events.push(name)
					return original(args)
				}
				return client
			}

			const first = wrap('slow', slow).runSync()
			await sleep(20)
			const second = wrap('fast', fast).runSync()
			await Promise.all([first, second])

			// all of slow's calls happen before any of fast's (fast is then throttled by the 1s rule)
			const firstFast = events.indexOf('fast')
			assert.isTrue(firstFast === -1 || events.slice(firstFast).every((e) => e === 'fast'), events.join(','))
		})

		it('waits as long as a long sync takes, instead of giving up after a fixed number of tries', async function () {
			const rootPath = newRoot()
			const release = await store.mutexLock({ options: { rootPath } })
			setTimeout(() => release(), 3000)

			const started = Date.now()
			const release2 = await store.mutexLock({ options: { rootPath } })
			const waited = Date.now() - started
			await release2()
			assert.isAtLeast(waited, 2900)
		})

		it('gives up with a clear error once its wait limit passes', async function () {
			const rootPath = newRoot()
			const release = await store.mutexLock({ options: { rootPath } })
			try {
				let message = null
				try {
					await store.mutexLock({ options: { rootPath, lockWaitMs: 300 } })
				} catch (err) {
					message = err.message
				}
				assert.match(message || '', /Timed out after 300 ms/)
			} finally {
				await release()
			}

			// the timed-out waiter must not have broken the queue
			const again = await store.mutexLock({ options: { rootPath, lockWaitMs: 1000 } })
			await again()
		})

		it('clearSync waits for a running sync instead of deleting the cache under it', async function () {
			const rootPath = newRoot()
			const seed = seedItems(3)
			seedCache(rootPath, seed)
			const client = createStubbedSyncClient(rootPath, seed)

			const release = await store.mutexLock({ options: { rootPath } })
			let cleared = false
			const clearing = client.clearSync().then(() => (cleared = true))
			await sleep(300)
			assert.isFalse(cleared, 'clearSync must wait for the lock')
			assert.isTrue(fs.existsSync(path.join(rootPath, 'en-us')), 'cache untouched while the lock is held')

			await release()
			await clearing
			assert.isFalse(fs.existsSync(rootPath), 'cache cleared once the lock was free')
		})

		it('different folders (live and preview) do not wait for each other', async function () {
			const live = await store.mutexLock({ options: { rootPath: newRoot() } })
			try {
				const started = Date.now()
				const preview = await store.mutexLock({ options: { rootPath: newRoot(), lockWaitMs: 1000 } })
				await preview()
				assert.isBelow(Date.now() - started, 500)
			} finally {
				await live()
			}
		})

		it('separate processes on the same folder take turns', async function () {
			const rootPath = newRoot()
			const logFile = path.join(rootPath, 'lock.log')
			const child = path.join(__dirname, '_lockChild.js')

			const runChild = () =>
				new Promise((resolve, reject) => {
					const p = spawn(process.execPath, ['-r', '@babel/register', child, rootPath, logFile, '300'], {
						cwd: path.join(__dirname, '..'),
						stdio: ['ignore', 'ignore', 'pipe'],
					})
					let stderr = ''
					// a broken lock can leave a child waiting forever; don't let it hang the suite
					const killer = setTimeout(() => p.kill(), 20000)
					p.stderr.on('data', (d) => (stderr += d))
					p.on('exit', (code, signal) => {
						clearTimeout(killer)
						if (code === 0) resolve()
						else reject(new Error(`child exited ${code || signal}: ${stderr}`))
					})
				})

			await Promise.all([runChild(), runChild(), runChild()])

			const events = fs
				.readFileSync(logFile, 'utf8')
				.trim()
				.split('\n')
				.map((line) => line.split(' '))
			assert.lengthOf(events, 6)
			// strictly alternating start/end means no two processes held the lock at once
			events.forEach(([, kind], i) => assert.strictEqual(kind, i % 2 === 0 ? 'start' : 'end', JSON.stringify(events)))
		})
	})
})
