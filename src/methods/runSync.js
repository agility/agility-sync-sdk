import { logInfo, logSuccess, logWarning, isCorruptCacheError } from '../util'

// A backstop: how many repair rounds one language may need in a single runSync. One round normally
// repairs everything, because the store checks the language's whole folder when asked.
const MAX_CORRUPT_FILE_REPAIRS = 3

const syncRunner = async function (config, agilityClient, storeInterface, syncContent, syncPages) {


	//if the store has a lock, hold it for the whole sync so overlapping syncs run one at a time
	let lockRelease = null
	if (storeInterface.mutexLock !== undefined) {
		lockRelease = await storeInterface.mutexLock()
	}

	try {

		//actually do the sync
		await sync(config, agilityClient, storeInterface, syncContent, syncPages)

	} finally {
		if (lockRelease) {
			await lockRelease()
		}
	}

}


const sync = async (config, agilityClient, storeInterface, syncContent, syncPages) => {

	const languageCodes = config.languages;

	for (const languageCode of languageCodes) {

		let fullSync = false
		const repairedFiles = new Set()
		for (let repairs = 0; ; repairs++) {
			try {
				await syncLanguage({ config, agilityClient, storeInterface, syncContent, syncPages, languageCode, fullSync })
				break
			} catch (err) {
				// A cache file that can't be parsed (left by an older SDK's overlapping writes, or a
				// crash mid-write) would otherwise fail every sync from here on. Have the store move
				// it, and any other damaged file for this language, aside, then sync this language
				// again from the start, which rebuilds them.
				if (!isCorruptCacheError(err) || repairs >= MAX_CORRUPT_FILE_REPAIRS) throw err

				// the same file failing again means the repair isn't working; don't loop on it
				if (err.filePath && repairedFiles.has(err.filePath)) throw err
				if (err.filePath) repairedFiles.add(err.filePath)

				const moved = await storeInterface.discardCorruptItem(err, languageCode)
				if (!moved) throw err

				logWarning(`${err.message} Damaged files have been moved aside; re-syncing ${languageCode} from the start.`)
				fullSync = true
			}
		}
	}
}

const syncLanguage = async ({ config, agilityClient, storeInterface, syncContent, syncPages, languageCode, fullSync }) => {

	const channels = config.channels;
	const modeStr = config.isPreview ? "preview" : "live"

	let syncState = null
	if (!fullSync) {
		syncState = await storeInterface.getSyncState(languageCode);
	}

	if (!syncState) syncState = { itemToken: 0, pageToken: 0 };

	const lastSyncDate = syncState.lastSyncDate || null
	//run at MOST once a second
	if (!fullSync && lastSyncDate && (new Date()) - new Date(lastSyncDate) < 1000) {
		//skip sync...
		return;
	}

	logSuccess(`Starting Sync for ${languageCode} - ${modeStr} mode.`);
	const newItemToken = await syncContent(languageCode, syncState.itemToken);
	const newPageToken = await syncPages(languageCode, syncState.pageToken);

	if (newItemToken != syncState.itemToken
		|| newPageToken != syncState.pageToken) {
		//if we sync ANYTHING - pull the new sitemap down

		for (const channelName of channels) {
			logInfo(`Updating Sitemap channel ${channelName} in ${languageCode}`);

			const sitemap = await agilityClient.getSitemapFlat({ channelName, languageCode });
			await storeInterface.saveSitemap({ sitemap, languageCode, channelName });

			const sitemapNested = await agilityClient.getSitemapNested({ channelName, languageCode });
			await storeInterface.saveSitemapNested({ sitemapNested, languageCode, channelName });

		}
	}

	//save the redirects if they have changed...
	let urlRedirections = await storeInterface.getUrlRedirections({ languageCode });
	let lastAccessDate = null;
	if (urlRedirections) lastAccessDate = urlRedirections.lastAccessDate;

	urlRedirections = await agilityClient.getUrlRedirections({ lastAccessDate });
	if (urlRedirections && urlRedirections.isUpToDate === false) {
		logInfo(`URL Redirections Updated and Saved`);
		await storeInterface.saveUrlRedirections({ urlRedirections, languageCode });
	}

	syncState.itemToken = newItemToken;
	syncState.pageToken = newPageToken;
	syncState.lastSyncDate = new Date();

	await storeInterface.saveSyncState({ syncState, languageCode });

	logSuccess(`Completed Sync for ${languageCode} - ${modeStr} mode.`);
}


export default syncRunner
