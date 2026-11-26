// PROD-3455: overlapping runSync() calls in one process must not corrupt the cache.
// No network: the Fetch API is faked (see _fakeFetch.js), so this runs anywhere, CI included.

import chai from 'chai'
import fs from 'fs'
import path from 'path'
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

const TRIALS = parseInt(process.env.SYNC_RACE_TRIALS || '40', 10)
const CONCURRENT = 10

describe('concurrent runSync (PROD-3455, unit):', function () {
	this.timeout('300s')

	it(`${CONCURRENT} overlapping runSync() calls leave every cache file valid and the list correct (${TRIALS} trials)`, async function () {
		const failures = []

		for (let trial = 0; trial < TRIALS; trial++) {
			const rootPath = makeTmpRoot()
			try {
				const seed = seedItems()
				const changes = defaultChanges()
				seedCache(rootPath, seed)

				// One client per "request", all on the same folder, as @agility/nextjs 0.x does.
				const clients = []
				for (let i = 0; i < CONCURRENT; i++) clients.push(createStubbedSyncClient(rootPath, [...seed, ...changes]))

				const results = await Promise.allSettled(clients.map((c) => c.runSync()))
				const rejected = results.filter((r) => r.status === 'rejected').map((r) => r.reason && r.reason.message)

				// the sitemap saves are not awaited on 1.2.5; give them a moment so we check what they leave
				await new Promise((resolve) => setTimeout(resolve, 50))

				const corrupt = findCorruptFiles(rootPath)
				let listProblem = null
				if (corrupt.length === 0) {
					const list = JSON.parse(fs.readFileSync(path.join(rootPath, 'en-us', 'list', `${LIST_REF}.json`), 'utf8'))
					const want = expectedList(seed, changes)
					const got = list.map((i) => `${i.contentID}:${i.fields.title.length}`).join(',')
					const exp = want.map((i) => `${i.contentID}:${i.fields.title.length}`).join(',')
					if (got !== exp) listProblem = `list differs from expected (got ${list.length} items, want ${want.length})`
				}

				if (rejected.length || corrupt.length || listProblem) {
					failures.push({ trial, rejected: rejected.slice(0, 2), corrupt, listProblem })
				}
			} finally {
				fs.rmSync(rootPath, { recursive: true, force: true })
			}
		}

		if (failures.length) {
			const sample = JSON.stringify(failures.slice(0, 3), null, 2)
			assert.fail(`${failures.length}/${TRIALS} trials failed. First failures:\n${sample}`)
		}
	})
})
