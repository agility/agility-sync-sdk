
import { logDebug, logInfo, logError, logWarning, logSuccess, asyncForEach } from './util'

let syncStorage = null;

const setSyncStorage = (syncStorageToUse) => {
	syncStorage = syncStorageToUse;
}

const saveContentItem = async ({contentItem, languageCode}) => {

	if (!contentItem || !contentItem.properties) {
		logWarning('Null item or item with no properties cannot be saved');
		return;
	}

	let referenceName = contentItem.properties.referenceName;
	let definitionName = contentItem.properties.definitionName;


	if (contentItem.properties.state === 3) {
		//if the item is deleted

		//grab the reference name from the currently saved item...
		const currentItem = await syncStorage.getItem({ itemType: "item", languageCode, itemID: contentItem.contentID });
		if (currentItem) {

			referenceName = currentItem.properties.referenceName;
			definitionName = currentItem.properties.definitionName;

			await syncStorage.deleteItem({ itemType: "item", languageCode, itemID: contentItem.contentID });
		}


	} else {
		//regular item
		await syncStorage.saveItem({ item: contentItem, itemType: "item", languageCode, itemID: contentItem.contentID });
	}

	if (referenceName) {
		//save the item by reference name - it might need to be merged into a list
		await syncStorage.mergeItemToList({ item: contentItem, languageCode, itemID: contentItem.contentID, referenceName, definitionName });
	}
}

const savePageItem = async ({pageItem, languageCode}) =>  {

	if (pageItem.properties.state === 3) {
		//item is deleted
		await syncStorage.deleteItem({ itemType: "page", languageCode, itemID: pageItem.pageID });
	} else {
		//regular item
		await syncStorage.saveItem({ item: pageItem, itemType: "page", languageCode, itemID: pageItem.pageID });
	}
}

const saveSitemap = async ({sitemap, channelName, languageCode}) => {
	await syncStorage.saveItem({ item: sitemap, itemType: "sitemap", languageCode, itemID: channelName });

}

const saveSyncState = async ({syncState, languageCode}) => {
	await syncStorage.saveItem({ item: syncState, itemType: "state", languageCode, itemID: "sync" });

}

const getSyncState = async (languageCode) => {
	return await syncStorage.getItem({ itemType: "state", languageCode, itemID: "sync" });
}

const getContentItem = async ({contentID, languageCode, depth = 2}) => {
	const contentItem = await syncStorage.getItem({ itemType: "item", languageCode, itemID: contentID });
	return await expandContentItem({ contentItem, languageCode, depth });
}

const expandContentItem = async ({contentItem, languageCode, depth}) => {
	if (depth > 0) {

		for (const fieldName in contentItem.fields) {
			const fieldValue = contentItem.fields[fieldName];

			if (fieldValue.contentid > 0) {
				//single linked item
				const childItem = await getContentItem({ contentID: fieldValue.contentid, languageCode, depth: depth - 1 });
				if (childItem != null) contentItem.fields[fieldName] = childItem;
			} else if (fieldValue.sortids && fieldValue.sortids.split) {
				//multi linked item
				const sortIDAry = fieldValue.sortids.split(',');
				const childItems = [];
				for (const childItemID of sortIDAry) {
					const childItem = await getContentItem({ contentID: childItemID, languageCode, depth: depth - 1 });
					if (childItem != null) childItems.push(childItem);
				}

				contentItem.fields[fieldName] = childItems;

			}
		}

	}

	return contentItem;
}

const getContentList = async ({referenceName, languageCode}) => {
	return await syncStorage.getItem({ itemType: "list", languageCode, itemID: referenceName });
}
/**
 * Get a Page based on it's id and languageCode.
 * @param {*} { pageID, languageCode, depth = 3 }
 * @returns
 */
const getPageItem = async ({pageID, languageCode, depth = 3}) => {
	let pageItem = await syncStorage.getItem({ itemType: "page", languageCode, itemID: pageID });

	if (depth > 0) {
		//if a depth was specified, pull in the modules (content items) for this page
		for (const zoneName in pageItem.zones) {
			const zone = pageItem.zones[zoneName];

			for (const mod of zone) {
				const moduleItem = await getContentItem({ contentID: mod.item.contentid, languageCode, depth: depth - 1 });
				mod.item = moduleItem;
			}
		}


	}

	return pageItem;

}

const getSitemap = async ({channelName, languageCode}) => {
	return await syncStorage.getItem({ itemType: "sitemap", languageCode, itemID: channelName });
}
/**
 * Clear everything out.
 */
const clear = async () => {
	await syncStorage.clearItems();
}


export default {
	saveContentItem: saveContentItem,
	savePageItem: savePageItem,
	getContentItem: getContentItem,
	getContentList: getContentList,
	getPageItem: getPageItem,
	getSitemap: getSitemap,
	saveSitemap: saveSitemap,
	getSyncState: getSyncState,
	saveSyncState: saveSyncState,
	clear: clear,
	setSyncStorage: setSyncStorage
}

