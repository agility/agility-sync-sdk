import { logInfo } from '../util'



/**
 * Sync the content items in the specified Agility Instance.
 */
export default async function (languageCode, token) {
    const storeInterface = this.store;

	if (!token) token = 0;

	do {

		//sync content items...
		logInfo(`Pulling Content Changes using token: ${token}`);


		const syncRet = await this.agilityClient.getSyncContent({
			syncToken: token,
			pageSize: 100,
			languageCode: languageCode,

		});

		const syncItems = syncRet.items;

		//if we don't get anything back, kick out
		if (syncItems.length === 0) {
			logInfo(`Content Sync returned no item(s).`);
			break;
		}

		for (let index = 0; index < syncItems.length; index++) {
			await storeInterface.saveContentItem({ contentItem: syncItems[index], languageCode });
		}

		token = syncRet.syncToken;
		logInfo(`Content Sync returned ${syncItems.length} item(s).`);

	} while (token > 0)

	return token;
}