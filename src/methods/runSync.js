import { logInfo, logSuccess } from '../util'


const syncRunner = async function () {

	const storeInterface = this.store.getStore();

	//if a mutex has been defined, call the wait lock
	let lockRelease = null
	if (storeInterface.mutexLock !== undefined) {
		lockRelease = await storeInterface.mutexLock()
	}

	try {

		//check to see


		//actually do the sync
		await sync(this)

	} finally {
		if (lockRelease) {
			lockRelease()
		}
	}

}


const sync = async (clientObj) => {

	const languageCodes = clientObj.config.languages;
	const channels = clientObj.config.channels;
	const storeInterface = clientObj.store;


	for (const languageCode of languageCodes) {


		let syncState = await storeInterface.getSyncState(languageCode);

		if (!syncState) syncState = { itemToken: 0, pageToken: 0 };

		const lastSyncDate = syncState.lastSyncDate || null
		//run at MOST once a second
		if (lastSyncDate && (new Date()) - new Date(lastSyncDate) < 1000) {
			logInfo(`Skipping Sync for ${languageCode} (last sync finished less than 1sec ago).`);
			continue;
		}

		logSuccess(`Starting Sync for ${languageCode}`);


		const newItemToken = await clientObj.syncContent(languageCode, syncState.itemToken);
		const newPageToken = await clientObj.syncPages(languageCode, syncState.pageToken);

		if (newItemToken != syncState.itemToken
			|| newPageToken != syncState.pageToken) {
			//if we sync ANYTHING - pull the new sitemap down


			for (const channelName of channels) {
				logInfo(`Updating Sitemap channel ${channelName} in ${languageCode}`);

				const sitemap = await clientObj.agilityClient.getSitemapFlat({ channelName, languageCode });
				storeInterface.saveSitemap({ sitemap, languageCode, channelName });

				const sitemapNested = await clientObj.agilityClient.getSitemapNested({ channelName, languageCode });
				storeInterface.saveSitemapNested({ sitemapNested, languageCode, channelName });

			}
		}

		//save the redirects if they have changed...
		let urlRedirections = await storeInterface.getUrlRedirections({ languageCode });
		let lastAccessDate = null;
		if (urlRedirections) lastAccessDate = urlRedirections.lastAccessDate;

		logInfo(`Updating URL Redirections from lastAccessDate: ${lastAccessDate}`);

		urlRedirections = await clientObj.agilityClient.getUrlRedirections({ lastAccessDate });
		if (urlRedirections && urlRedirections.isUpToDate === false) {
			logInfo(`Saving URL Redirections into cache`);
			await storeInterface.saveUrlRedirections({ urlRedirections, languageCode });
		}

		syncState.itemToken = newItemToken;
		syncState.pageToken = newPageToken;
		syncState.lastSyncDate = new Date();

		await storeInterface.saveSyncState({ syncState, languageCode });

		logSuccess(`Completed Sync for ${languageCode}`);
	}
}


export default syncRunner