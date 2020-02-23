import { logInfo } from '../util'

export default async function (languageCode, token) {
    const syncStorageInterface = this.syncStorageInterface;
	if (!token) token = 0;

	do {
		//sync pages...
		logInfo(`Pulling Page Changes using token: ${token}`);

		const syncRet = await this.agilityClient.getSyncPages({
			syncToken: token,
			pageSize: 100,
			languageCode: languageCode
		});

		const syncItems = syncRet.items;

		//if we don't get anything back, kick out
		if (syncItems.length === 0) {
			logInfo(`Page Sync returned no item(s).`);
			break;
		}

		for (let index = 0; index < syncItems.length; index++) {
			await syncStorageInterface.savePageItem({ pageItem: syncItems[index], languageCode });
		}

		token = syncRet.syncToken;
		logInfo(`Page Sync returned ${syncItems.length} item(s).`);

	} while (token > 0)


	return token;
}