import { logInfo, logSuccess } from '../util'


export default async function () {

	const languageCodes = this.config.languages;
	const channels = this.config.channels;
	const storeInterface = this.store;

	for (const languageCode of languageCodes) {

		logSuccess(`Starting Sync for ${languageCode}`);
		let syncState = await storeInterface.getSyncState(languageCode);

		if (!syncState) syncState = { itemToken: 0, pageToken: 0 };

		const newItemToken = await this.syncContent(languageCode, syncState.itemToken);
		const newPageToken = await this.syncPages(languageCode, syncState.pageToken);

		if (newItemToken != syncState.itemToken
			|| newPageToken != syncState.pageToken) {
			//if we sync ANYTHING - pull the new sitemap down


			for (const channelName of channels) {
				logInfo(`Updating Sitemap channel ${channelName} in ${languageCode}`);

				const sitemap = await this.agilityClient.getSitemapFlat({ channelName, languageCode });
				storeInterface.saveSitemap({ sitemap, languageCode, channelName });

				const sitemapNested = await this.agilityClient.getSitemapNested({ channelName, languageCode });
				storeInterface.saveSitemapNested({ sitemapNested, languageCode, channelName });

			}
		}

		//save the redirects if they have changed...
		let urlRedirections = await storeInterface.getUrlRedirections({languageCode});
		let lastAccessDate = null;
		if (urlRedirections) lastAccessDate = urlRedirections.lastAccessDate;

		logInfo(`Updating URL Redirections from lastAccessDate: ${lastAccessDate}`);

		urlRedirections = await this.agilityClient.getUrlRedirections({ lastAccessDate });
		if (urlRedirections && urlRedirections.isUpToDate === false) {
			logInfo(`Saving URL Redirections into cache`);
			await storeInterface.saveUrlRedirections({urlRedirections, languageCode});
		}

		syncState.itemToken = newItemToken;
		syncState.pageToken = newPageToken;

		await storeInterface.saveSyncState({ syncState, languageCode });

		logSuccess(`Completed Sync for ${languageCode}`);

	}

}