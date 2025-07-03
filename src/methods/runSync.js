import { logInfo, logSuccess } from '../util'


const syncRunner = async function (config, agilityClient, storeInterface, syncContent, syncPages) {


	//if a mutex has been defined, call the wait lock
	let lockRelease = null
	if (storeInterface.mutexLock !== undefined) {
		lockRelease = await storeInterface.mutexLock()
	}

	try {

		//check to see


		//actually do the sync
		await sync(config, agilityClient, storeInterface, syncContent, syncPages)

	} finally {
		if (lockRelease) {
			lockRelease()
		}
	}

}


const sync = async (config, agilityClient, storeInterface, syncContent, syncPages) => {

	const languageCodes = config.languages;
	const channels = config.channels;

	const modeStr = config.isPreview ? "preview" : "live"

	for (const languageCode of languageCodes) {


		let syncState = await storeInterface.getSyncState(languageCode);

		if (!syncState) syncState = { itemToken: 0, pageToken: 0 };

		const lastSyncDate = syncState.lastSyncDate || null
		//run at MOST once a second
		if (lastSyncDate && (new Date()) - new Date(lastSyncDate) < 1000) {
			//skip sync...
			continue;
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
				storeInterface.saveSitemap({ sitemap, languageCode, channelName });

				const sitemapNested = await agilityClient.getSitemapNested({ channelName, languageCode });
				storeInterface.saveSitemapNested({ sitemapNested, languageCode, channelName });

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
}


export default syncRunner