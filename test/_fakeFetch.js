// A stand-in for the Fetch API client that runSync uses, so sync tests need no network or keys.
//
// It holds an ordered change feed for one list. Each /sync/items call returns at most one item,
// after a small random delay, so overlapping runSync() calls interleave their file writes the way
// concurrent page requests do in production.

import fs from 'fs'
import os from 'os'
import path from 'path'
import * as agilitySync from '../src/sync-client'
import storeInterfaceFileSystem from '../src/store-interface-filesystem'

export const LIST_REF = 'offers'
export const DEF_NAME = 'Offer'

const randomDelay = (maxMs) => new Promise((resolve) => setTimeout(resolve, Math.floor(Math.random() * maxMs)))

export const makeItem = (contentID, text, state = 2) => ({
	contentID,
	properties: { state, definitionName: DEF_NAME, referenceName: LIST_REF, versionID: contentID },
	fields: { title: text },
})

// The changes the fake Fetch API hands out after the seeded state. Lengths go up and down on
// purpose: a shorter list written over a longer one is what leaves trailing bytes behind.
export const defaultChanges = () => [
	makeItem(5, 'x'.repeat(400)),
	makeItem(7, '', 3),
	makeItem(5, 'short'),
	makeItem(100, 'new item ' + 'y'.repeat(300)),
	makeItem(12, '', 3),
	makeItem(100, 'n'),
	makeItem(101, 'z'.repeat(250)),
	makeItem(3, '', 3),
]

export const seedItems = (count = 36) => {
	const items = []
	for (let i = 1; i <= count; i++) items.push(makeItem(i, `offer ${i} ` + 'o'.repeat(20 + (i % 7) * 10)))
	return items
}

// The list we expect once every change has been applied in order.
export const expectedList = (seed, changes) => {
	const list = seed.map((i) => i)
	for (const change of changes) {
		const idx = list.findIndex((i) => i.contentID === change.contentID)
		if (change.properties.state === 3) {
			if (idx >= 0) list.splice(idx, 1)
		} else if (idx >= 0) {
			list[idx] = change
		} else {
			list.push(change)
		}
	}
	return list
}

export const makeTmpRoot = () => fs.mkdtempSync(path.join(os.tmpdir(), 'agility-sync-test-'))

// Write the cache as a previous, finished sync would have left it: every seed item, the list, and a
// sync state old enough that the 1-second throttle lets the next sync through. Its token is
// seed.length: the feed (see stubFetch) hands out the seed first, then the changes.
export const seedCache = (rootPath, seed, languageCode = 'en-us') => {
	const write = (type, id, data) => {
		const dir = path.join(rootPath, languageCode, type)
		fs.mkdirSync(dir, { recursive: true })
		fs.writeFileSync(path.join(dir, `${id}.json`), JSON.stringify(data))
	}
	for (const item of seed) write('item', item.contentID, item)
	write('list', LIST_REF, seed)
	write('state', 'sync', { itemToken: seed.length, pageToken: 0, lastSyncDate: new Date(Date.now() - 60000).toISOString() })
}

// Replace the network calls of a real sync client with a fake feed: `feed` is every content change
// in order, and token n means "the first n have been delivered", like the Fetch sync index.
export const stubFetch = (syncClient, feed, { maxDelayMs = 5, syncItemsDelayMs = 0, failSyncItems } = {}) => {
	const client = syncClient.agilityClient
	client.getSyncContent = async ({ syncToken }) => {
		if (failSyncItems) throw failSyncItems
		if (syncItemsDelayMs) await new Promise((resolve) => setTimeout(resolve, syncItemsDelayMs))
		await randomDelay(maxDelayMs)
		if (syncToken >= feed.length) return { syncToken, items: [] }
		return { syncToken: syncToken + 1, items: [JSON.parse(JSON.stringify(feed[syncToken]))] }
	}
	client.getSyncPages = async ({ syncToken }) => {
		await randomDelay(maxDelayMs)
		return { syncToken, items: [] }
	}
	client.getSitemapFlat = async () => {
		await randomDelay(maxDelayMs)
		return { '/offers': { title: 'Offers', pageID: 1 } }
	}
	client.getSitemapNested = async () => {
		await randomDelay(maxDelayMs)
		return [{ title: 'Offers', pageID: 1, children: [] }]
	}
	client.getUrlRedirections = async () => {
		await randomDelay(maxDelayMs)
		return { isUpToDate: true, items: [] }
	}
	return syncClient
}

export const createStubbedSyncClient = (rootPath, feed, opts = {}) => {
	const syncClient = agilitySync.getSyncClient({
		guid: 'test-guid-d',
		apiKey: 'test-key',
		isPreview: opts.isPreview || false,
		logLevel: 'none',
		channels: ['website'],
		languages: ['en-us'],
		store: opts.store || { interface: storeInterfaceFileSystem, options: { rootPath } },
	})
	return stubFetch(syncClient, feed, opts)
}

// Parse every JSON file in the cache; return the ones that fail.
export const findCorruptFiles = (rootPath) => {
	const bad = []
	const walk = (dir) => {
		for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
			const full = path.join(dir, entry.name)
			if (entry.isDirectory()) walk(full)
			else if (entry.name.endsWith('.json')) {
				try {
					JSON.parse(fs.readFileSync(full, 'utf8'))
				} catch (err) {
					bad.push(`${path.relative(rootPath, full)}: ${err.message}`)
				}
			}
		}
	}
	walk(rootPath)
	return bad
}
