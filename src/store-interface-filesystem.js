import fs from 'fs'
import os from 'os'
import path from 'path'
import crypto from 'crypto'
import { sleep, logWarning, CORRUPT_CACHE_ERROR_CODE } from "./util.js"
import { lock } from "proper-lockfile"
import dotenv from "dotenv"

dotenv.config({
	path: `.env.${process.env.NODE_ENV}`,
})

/**
 * The function to handle saving/updating an item to your storage. This could be a Content Item, Page, Url Redirections, Sync State (state), or Sitemap.
 * @param {Object} params - The parameters object
 * @param {Object} params.options - A flexible object that can contain any properties specifically related to this interface
 * @param {String} params.options.rootPath - The path to store/access the content as JSON 
 * @param {Object} params.item - The object representing the Content Item, Page, Url Redirections, Sync State (state), or Sitemap that needs to be saved/updated
 * @param {String} params.itemType - The type of item being saved/updated, expected values are `item`, `page`, `sitemap`, `nestedsitemap`, `state`, `urlredirections`
 * @param {String} params.languageCode - The locale code associated to the item being saved/updated
 * @param {(String|Number)} params.itemID - The ID of the item being saved/updated - this could be a string or number depending on the itemType
 * @returns {promise<void>}
 */
const saveItem = async ({ options, item, itemType, languageCode, itemID }) => {

	let filePath = getFilePath({ options, itemType, languageCode, itemID });

	let dirPath = path.dirname(filePath);

	// mkdir with recursive is a no-op when the folder exists
	await fs.promises.mkdir(dirPath, { recursive: true });

	let json = JSON.stringify(item);
	await writeFileAtomic(filePath, json);
}

/**
 * Write a file so that readers only ever see the old content or the new content, never a mix.
 * A plain writeFile truncates and then writes, so two writers (or a writer and a reader) that
 * overlap can leave a short write over a longer one: valid JSON followed by leftover bytes.
 * Writing to a temp file in the same folder and renaming it over the target is atomic on POSIX.
 * On Windows the rename can fail briefly while another process has the target open, so retry.
 * @private
 */
const writeFileAtomic = async (filePath, data) => {
	const tmpPath = `${filePath}.${process.pid}.${crypto.randomBytes(6).toString('hex')}.tmp`
	try {
		await fs.promises.writeFile(tmpPath, data)
	} catch (err) {
		await fs.promises.unlink(tmpPath).catch(() => { })
		throw err
	}

	for (let attempt = 1; ; attempt++) {
		try {
			await fs.promises.rename(tmpPath, filePath)
			return
		} catch (err) {
			const retryable = err.code === 'EPERM' || err.code === 'EBUSY' || err.code === 'EACCES'
			if (retryable && attempt < 10) {
				await sleep(20 * attempt)
				continue
			}
			await fs.promises.unlink(tmpPath).catch(() => { })
			throw err
		}
	}
}
/**
 * The function to handle deleting an item to your storage. This could be a Content Item, Page, Url Redirections, Sync State (state), or Sitemap.
 * @param {Object} params - The parameters object
 * @param {Object} params.options - A flexible object that can contain any properties specifically related to this interface
 * @param {String} params.options.rootPath - The path to store/access the content as JSON 
 * @param {String} params.itemType - The type of item being deleted, expected values are `item`, `page`, `sitemap`, `nestedsitemap`, `state`, `urlredirections`
 * @param {String} params.languageCode - The locale code associated to the item being saved/updated
 * @param {(String|Number)} params.itemID - The ID of the item being deleted - this could be a string or number depending on the itemType
 * @returns {promise<void>}
 */
const deleteItem = async ({ options, itemType, languageCode, itemID }) => {

	let filePath = getFilePath({ options, itemType, languageCode, itemID });

	try {
		await fs.promises.unlink(filePath);
	} catch (err) {
		if (err.code !== 'ENOENT') throw err;
	}

}
/**
 * The function to handle updating and placing a Content Item into a "list" so that you can handle querying a collection of items.
 * @param {Object} params - The parameters object
 * @param {Object} params.options - A flexible object that can contain any properties specifically related to this interface
 * @param {String} params.options.rootPath - The path to store/access the content as JSON 
 * @param {Object} params.item - The object representing the Content Item
 * @param {String} params.languageCode - The locale code associated to the item being saved/updated 
 * @param {(String|Number)} params.itemID - The ID of the item being updated - this could be a string or number depending on the itemType
 * @param {String} params.referenceName - The reference name of the Content List that this Content Item should be added to
 * @param {String} params.definitionName - The Model name that the Content Item is based on
 * @returns {Promise<void>}
 */
const mergeItemToList = async ({ options, item, languageCode, itemID, referenceName, definitionName }) => {

	let contentList = await getItem({ options, itemType: "list", languageCode, itemID: referenceName });

	if (contentList == null) {
		//initialize the list
		contentList = [item];
	} else {
		//replace the item...
		const cIndex = contentList.findIndex((ci) => {
			return ci.contentID === itemID;
		});

		if (item.properties.state === 3) {
			//*** deleted item (remove from the list) ***
			if (cIndex >= 0) {
				//remove the item
				contentList.splice(cIndex, 1);
			}

		} else {
			//*** regular item (merge) ***
			if (cIndex >= 0) {
				//replace the existing item
				contentList[cIndex] = item;
			} else {
				//and it to the end of the
				contentList.push(item);
			}
		}
	}

	await saveItem({ options, item: contentList, itemType: "list", languageCode, itemID: referenceName });
}
/**
 * The function to handle retrieving a Content Item, Page, Url Redirections, Sync State (state), or Sitemap
 * @param {Object} params - The parameters object
 * @param {Object} params.options - A flexible object that can contain any properties specifically related to this interface
 * @param {String} params.options.rootPath - The path to store/access the content as JSON 
 * @param {String} params.itemType - The type of item being accessed, expected values are `item`, `list`, `page`, `sitemap`, `nestedsitemap`, `state`, `urlredirections`
 * @param {String} params.languageCode - The locale code associated to the item being accessed
 * @param {(String|Number)} params.itemID - The ID of the item being accessed - this could be a string or number depending on the itemType
 * @returns {Promise<Object>}
 */
const getItem = async ({ options, itemType, languageCode, itemID }) => {
	let filePath = getFilePath({ options, itemType, languageCode, itemID });

	let json;
	try {
		json = await fs.promises.readFile(filePath, 'utf8');
	} catch (err) {
		if (err.code === 'ENOENT') return null;
		throw err;
	}

	try {
		return JSON.parse(json);
	} catch (err) {
		// Tag the error so runSync can recognise a damaged cache file and repair it
		// (see discardCorruptItem) instead of failing on it forever.
		const corrupt = new Error(`The sync cache file ${filePath} could not be parsed: ${err.message}`);
		corrupt.code = CORRUPT_CACHE_ERROR_CODE;
		corrupt.filePath = filePath;
		throw corrupt;
	}
}

/**
 * Move a cache file that failed to parse out of the way, so the next sync rebuilds it.
 * The file is renamed, not deleted, to keep it for diagnosis.
 * @param {Object} params - The parameters object
 * @param {Object} params.options - The store options (rootPath)
 * @param {Error} params.error - The error getItem threw, carrying `filePath`
 * @returns {Promise<void>}
 */
const discardCorruptItem = async ({ options, error }) => {
	if (!error || !error.filePath) return;

	// only ever touch files inside this store's folder
	const root = path.resolve(options.rootPath);
	const filePath = path.resolve(error.filePath);
	if (!filePath.startsWith(root + path.sep)) return;

	try {
		await fs.promises.rename(filePath, `${filePath}.corrupt-${Date.now()}`);
	} catch (err) {
		if (err.code !== 'ENOENT') throw err;
	}
}

/**
 * The function to handle clearing the cache of synchronized data from the CMS
 * @param {Object} params - The parameters object
 * @param {Object} params.options - A flexible object that can contain any properties specifically related to this interface
 * @param {String} params.options.rootPath - The path to store/access the content as JSON 
 * @returns {Promise<void>}
 */
const clearItems = async ({ options }) => {
	await fs.promises.rmdir(options.rootPath, { recursive: true })
}



// How long a sync waits for another sync on the same folder before giving up. A first sync of a
// large instance can take minutes, and a caller that gives up early fails its page request.
const LOCK_WAIT_MS = 10 * 60 * 1000
// A lock not refreshed for this long belongs to a process that died; take it over.
const LOCK_STALE_MS = 60 * 1000
const LOCK_RETRY_MS = 200

// One queue per lock, for the syncs in this process: each waits for the one before it.
const lockQueues = new Map()

/**
 * Make syncs on the same cache folder run one at a time, whether they come from this process or
 * another one on the same machine. Syncs on different folders (live and preview, for example)
 * don't wait for each other.
 * @param {Object} [params] - The parameters object
 * @param {Object} [params.options] - The store options; `rootPath` picks the lock, `lockWaitMs` overrides the wait limit
 * @returns {Promise<Function>} An async function that releases the lock.
 */
const mutexLock = async ({ options } = {}) => {
	const lockPath = getLockPath(options)
	const waitMs = (options && options.lockWaitMs) || LOCK_WAIT_MS
	const startedAt = Date.now()

	// 1. Within this process: queue behind whoever holds or is waiting for this lock.
	const previous = lockQueues.get(lockPath) || Promise.resolve()
	let releaseLocal
	const mine = new Promise((resolve) => { releaseLocal = resolve })
	const tail = previous.then(() => mine)
	lockQueues.set(lockPath, tail)

	// Our successors wait on `tail`, which only settles after `previous` does, so letting go of
	// our place (even on a timeout) never lets them overtake the current holder.
	const leaveQueue = () => {
		releaseLocal()
		if (lockQueues.get(lockPath) === tail) lockQueues.delete(lockPath)
	}

	try {
		await withTimeout(previous, waitMs)
	} catch (err) {
		leaveQueue()
		throw new Error(`Timed out after ${waitMs} ms waiting for another Agility sync on ${lockPath} to finish.`)
	}

	// 2. Across processes: a lock directory next to the lock path, refreshed while we hold it.
	const remainingMs = Math.max(LOCK_RETRY_MS, waitMs - (Date.now() - startedAt))
	let releaseFile
	try {
		releaseFile = await lock(lockPath, {
			realpath: false,
			stale: LOCK_STALE_MS,
			retries: {
				retries: Math.ceil(remainingMs / LOCK_RETRY_MS),
				factor: 1,
				minTimeout: LOCK_RETRY_MS,
				maxTimeout: LOCK_RETRY_MS,
			},
			// The library's default throws from a timer, which would crash the whole process.
			onCompromised: (err) => logWarning(`The Agility sync lock ${lockPath} was compromised: ${err.message}`),
		})
	} catch (err) {
		leaveQueue()
		if (err.code === 'ELOCKED') {
			throw new Error(`Timed out after ${waitMs} ms waiting for another process's Agility sync on ${lockPath} to finish.`)
		}
		throw err
	}

	let released = false
	return async () => {
		if (released) return
		released = true
		try {
			await releaseFile()
		} catch (err) {
			logWarning(`The Agility sync lock ${lockPath} could not be released cleanly: ${err.message}`)
		} finally {
			leaveQueue()
		}
	}
}

//private: one lock per cache folder, kept in the OS temp folder so clearing the cache can't remove it
const getLockPath = (options) => {
	const rootPath = path.resolve((options && options.rootPath) || '.agility-files')
	const hash = crypto.createHash('sha1').update(rootPath).digest('hex').slice(0, 16)
	return path.join(os.tmpdir(), `agility-sync-${hash}.mutex`)
}

//private: reject if the promise hasn't settled within ms
const withTimeout = (promise, ms) => {
	let timer
	const timeout = new Promise((resolve, reject) => {
		timer = setTimeout(() => reject(new Error('timeout')), ms)
	})
	return Promise.race([promise, timeout]).finally(() => clearTimeout(timer))
}

//private function to get path of an item
const getFilePath = ({ options, itemType, languageCode, itemID }) => {
		if(typeof itemID === 'string' || itemID instanceof String){
			itemID = itemID.replace(/[`!@#$%^&*()+\=\[\]{};':"\\|,.<>\/?~]/g, "");
		}
		const fileName = `${itemID}.json`;
		return path.join(options.rootPath, languageCode, itemType, fileName);
}


export default {
	saveItem,
	deleteItem,
	mergeItemToList,
	getItem,
	clearItems,
	mutexLock,
	discardCorruptItem
}
