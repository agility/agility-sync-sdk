import { logInfo } from '../util'

export default async function (languageCode, token) {
    const storeInterface = this.store;
	if (!token) token = 0;


	logInfo(`Pulling Page Changes...`);

	let itemCount = 0;

	do {
		//sync pages...


		const syncRet = await this.agilityClient.getSyncPages({
			syncToken: token,
			pageSize: 100,
			languageCode: languageCode
		});

		const syncItems = syncRet.items;

		//if we don't get anything back, kick out
		if (syncItems.length === 0) {
			break;
		}

		for (let index = 0; index < syncItems.length; index++) {
			await storeInterface.savePageItem({ pageItem: syncItems[index], languageCode });
		}

		token = syncRet.syncToken;
		itemCount += syncItems.length;


	} while (token > 0)

	if (itemCount > 0) {
		logInfo(`Page Sync returned ${itemCount} item(s).`);
	} else {
		logInfo(`Page Sync returned no item(s).`);
	}


	return token;
}