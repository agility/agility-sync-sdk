import { logInfo } from '../util'



/**
 * Sync the content items in the specified Agility Instance.
 */
export default async function (languageCode, token) {
    const storeInterface = this.store;

	if (!token) token = 0;

	logInfo(`Pulling Content Changes...`);

	let itemCount = 0;

	do {

		//sync content items...
		const syncRet = await this.agilityClient.getSyncContent({
			syncToken: token,
			pageSize: 100,
			languageCode: languageCode,

		});

		const syncItems = syncRet.items;

		//if we don't get anything back, kick out
		if (syncItems.length === 0) {
			break;
		}

		for (let index = 0; index < syncItems.length; index++) {
			await storeInterface.saveContentItem({ contentItem: syncItems[index], languageCode });
		}

		token = syncRet.syncToken;
		itemCount += syncItems.length;

	} while (token > 0)

	if (itemCount > 0) {
		logInfo(`Content Sync returned ${itemCount} item(s).`);
	} else {
		logInfo(`Content Sync returned no item(s).`);
	}

	return token;
}