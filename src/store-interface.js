import {
	logDebug,
	logInfo,
	logError,
	logWarning,
	logSuccess,
	asyncForEach,
} from "./util";

let store = null;
let options = null;

const validateStoreInterface = (storeCandidate) => {
	if (!storeCandidate.clearItems) {
		throw new TypeError(
			"Your sync store interface must implement `clearItems`."
		);
	}

	if (!storeCandidate.deleteItem) {
		throw new TypeError(
			"Your sync store interface must implement `deleteItem`."
		);
	}

	if (!storeCandidate.getItem) {
		throw new TypeError("Your sync store interface must implement `getItem`.");
	}

	if (!storeCandidate.saveItem) {
		throw new TypeError("Your sync store interface must implement `saveItem`.");
	}

	if (!storeCandidate.mergeItemToList) {
		throw new TypeError(
			"Your sync store interface must implement `mergeItemToList`."
		);
	}
};

const setStore = (storeToUse, storeOptions) => {
	validateStoreInterface(storeToUse);
	store = storeToUse;
	options = storeOptions;
};

const getStore = () => {
	return store
}

// sanitize graphql node names
const sanitizeName = (name) => {

	if (name !== undefined && name !== null) {
		return name.replace(/\W/g, "")
	} else {
		return null
	}

};

const saveContentItem = async ({ contentItem, languageCode }) => {

	if (
		!contentItem ||
		!contentItem.properties
	) {
		logWarning("Null item or item with no properties cannot be saved");
		return;
	}

	let definitionName = sanitizeName(contentItem.properties.definitionName)
	let referenceName = contentItem.properties.referenceName

	if (contentItem.properties.state === 3) {
		//if the item is deleted

		//grab the reference name from the currently saved item...
		const currentItem = await store.getItem({
			options,
			itemType: "item",
			languageCode,
			itemID: contentItem.contentID,
		});
		if (currentItem) {

			//if the item is deleted, we need to grab the def and ref name from the current
			definitionName = sanitizeName(currentItem.properties.definitionName)
			referenceName = currentItem.properties.referenceName

			await store.deleteItem({
				options,
				itemType: "item",
				languageCode,
				itemID: contentItem.contentID,
			});
		}
	} else {
		//regular item
		if (!contentItem.properties.definitionName
			|| !contentItem.properties.referenceName) {
			logWarning(`Content with id ${contentItem.contentID} does not have the neccessary properties to be saved.`)
			return
		}



		await store.saveItem({
			options,
			item: contentItem,
			itemType: "item",
			languageCode,
			itemID: contentItem.contentID,
		});
	}

	if (referenceName) {
		//merge the item by reference or definition name - it might need to be merged into a list
		await store.mergeItemToList({
			options,
			item: contentItem,
			languageCode,
			itemID: contentItem.contentID,
			referenceName,
			definitionName,
		});
	}
};

const savePageItem = async ({ pageItem, languageCode }) => {
	if (pageItem.properties.state === 3) {
		//item is deleted
		await store.deleteItem({
			options,
			itemType: "page",
			languageCode,
			itemID: pageItem.pageID,
		});
	} else {
		//regular item
		await store.saveItem({
			options,
			item: pageItem,
			itemType: "page",
			languageCode,
			itemID: pageItem.pageID,
		});
	}
};

const saveSitemap = async ({ sitemap, channelName, languageCode }) => {
	await store.saveItem({
		options,
		item: sitemap,
		itemType: "sitemap",
		languageCode,
		itemID: channelName,
	});
};

const saveSitemapNested = async ({
	sitemapNested,
	channelName,
	languageCode,
}) => {
	await store.saveItem({
		options,
		item: sitemapNested,
		itemType: "nestedsitemap",
		languageCode,
		itemID: channelName,
	});
};

const saveUrlRedirections = async ({ urlRedirections, languageCode }) => {
	await store.saveItem({
		options,
		item: urlRedirections,
		itemType: "urlredirections",
		languageCode,
		itemID: "urlredirections",
	});
};

const getUrlRedirections = async ({ languageCode }) => {
	return await store.getItem({
		options,
		itemType: "urlredirections",
		languageCode,
		itemID: "urlredirections",
	});
};

const saveSyncState = async ({ syncState, languageCode }) => {
	await store.saveItem({
		options,
		item: syncState,
		itemType: "state",
		languageCode,
		itemID: "sync",
	});
};

const getSyncState = async (languageCode) => {
	return await store.getItem({
		options,
		itemType: "state",
		languageCode,
		itemID: "sync",
	});
};

/**
 * Gets the details of a content item by its Content ID.
 * @memberof AgilitySync.Client.Content
 * @param {Object} requestParams - The paramters for the SDK request.
 * @param {number} requestParams.contentID - The contentID of the requested item in this language.
 * @param {string} requestParams.languageCode - The language code of the content you want to retrieve.
 * @param {number} [requestParams.depth] - The depth, representing the levels in which you want linked content auto-resolved. Default is **1**.
 * @param {boolean} [requestParams.expandAllContentLinks] - Whether or not to expand entire linked content references, includings lists and items that are rendered in the CMS as Grid or Link. Default is **false**
 * @returns {Promise<Object>} - Returns a content item object.
*/
const getContentItem = async ({ contentID, languageCode, depth, contentLinkDepth, expandAllContentLinks = false }) => {

	if (depth === undefined && contentLinkDepth !== undefined) {
		depth = contentLinkDepth
	} else if (depth === undefined && contentLinkDepth === undefined) {
		depth = 2
	}

	const contentItem = await store.getItem({
		options,
		itemType: "item",
		languageCode,
		itemID: contentID,
	});
	return await expandContentItem({ contentItem, languageCode, depth, expandAllContentLinks });
};

const expandContentItem = async ({ contentItem, languageCode, depth, expandAllContentLinks = false }) => {
	if (!contentItem) return null;

	if (depth > 0) {
		//make this work for the .fields or the .customFields property...
		let fields = contentItem.fields;
		if (!fields) fields = contentItem.customFields;
		for (const fieldName in fields) {
			const fieldValue = fields[fieldName];
			if (!fieldValue) {
				//do nothing...
				continue;
			} else if (fieldValue.contentid > 0) {
				//single linked item
				const childItem = await getContentItem({
					contentID: fieldValue.contentid,
					languageCode,
					depth: depth - 1,
				});
				if (childItem != null) fields[fieldName] = childItem;
			} else if (fieldValue.fulllist === true
							&& fieldValue.referencename
							&& expandAllContentLinks === true) {

				//LINK TO THE FULL LIST
				const referenceName = fieldValue.referencename

				const skip = 0
				const take = 50

				const list = await getContentList({
					referenceName,
					languageCode,
					depth: depth - 1,
					expandAllContentLinks,
					skip,
					take
				})

				let sortIDAry = []

				if (fieldValue.sortids && fieldValue.sortids.split) {
					sortIDAry = fieldValue.sortids.split(",");
				}

				let itemCount = 0
				const childItems = [];
				for (const childItemID of sortIDAry) {
					itemCount++
					const childItem = await getContentItem({
						contentID: childItemID,
						languageCode,
						depth: depth - 1,
						expandAllContentLinks,
						skip,
						take
					});

					if (childItem != null) {
						childItems.push(childItem);
					}
				}

				for (const listItem of list) {
					itemCount++
					if (itemCount > 50) break;

					const listItemContentID = listItem.contentID
					if (sortIDAry.includes(`${listItemContentID}`)) {
						continue;
					}

					const childItem = await getContentItem({
						contentID: listItemContentID,
						languageCode,
						depth: depth - 1,
						expandAllContentLinks
					});
					if (childItem != null) childItems.push(childItem);
				}

				fields[fieldName] = childItems;

			} else if (fieldValue.sortids && fieldValue.sortids.split && fieldValue.fulllist !== true) {
				//MULTI LINKED ITEM
				let sortIDAry = []
				if (fieldValue.sortids && fieldValue.sortids.split) {
					sortIDAry = fieldValue.sortids.split(",");
				}

				const skip = expandAllContentLinks ? 0 : undefined
				const take = expandAllContentLinks ? 50 : undefined

				const childItems = [];
				for (const childItemID of sortIDAry) {
					const childItem = await getContentItem({
						contentID: childItemID,
						languageCode,
						depth: depth - 1,
						expandAllContentLinks,
						skip,
						take
					});
					if (childItem != null) childItems.push(childItem);
				}
				fields[fieldName] = childItems;

			}
		}
	}
	return contentItem;
};



/**
 * Retrieves a list of content items by reference name.  If skip or take has been specified, returns an object with an items array and totalCount property.  Otherwise returns an array of items.
 * @memberof AgilitySync.Client.Content
 * @param {Object} requestParams - The parameters for this request.
 * @param {string} requestParams.referenceName - The unique reference name of the content list you wish to retrieve in the specified language.
 * @param {string} requestParams.languageCode - The language code of the content you want to retrieve.
 * @param {number} [requestParams.depth] - The depth, representing the levels in which you want linked content auto-resolved. Default is **1**.
 * @param {boolean} [requestParams.expandAllContentLinks] - Whether or not to expand entire linked content references, includings lists and items that are rendered in the CMS as Grid or Link. Default is **false**
 * @param {number} [requestParams.take] - The maximum number of items to retrieve in this request.
 * @param {number} [requestParams.skip] - The number of items to skip from the list. Used for implementing pagination.
 * @returns {Promise<[] | Object>} - Returns a list of content items, or, if skip or take has been specified, an object with an items array and totalCount property.
*/
const getContentList = async ({ referenceName, languageCode, depth = 0, expandAllContentLinks = false, skip = -1, take = -1 }) => {

	let lst = await store.getItem({
		options,
		itemType: "list",
		languageCode,
		itemID: referenceName,
	}) || [];

	if (depth > 0 && take === -1) {
		throw new Error("If you specify depth > 0, you must also specify the take parameter.")
	}

	if (expandAllContentLinks && take === -1) {
		throw new Error("If you specify expandAllContentLinks=true, you must also specify the take parameter.")
	}

	const totalCount = lst.length

	if (skip > 0 && skip < lst.length) {
		lst = lst.slice(skip)
	}

	if (take > 0 && take < lst.length) {
		lst = lst.slice(0, take)
	}

	if (depth > 0) {
		for (let i=0; i<lst.length;i++) {
			lst[i] = await expandContentItem({
				contentItem: lst[i],
				depth: depth - 1,
				languageCode,
				expandAllContentLinks
			})
		}
	}

	if (skip > 0 || take > 0) {
		//if we have sliced this array, return an object with an items and totalCount property
		return {
			items: lst,
			totalCount
		}
	} else {
		//just return the full list
		return lst
	}





};
/**
 * Get a Page based on it's id and languageCode.
 * @param {*} { pageID, languageCode, depth = 3 }
 * @returns
 */
const getPage = async ({ pageID, languageCode, depth, contentLinkDepth, expandAllContentLinks = false }) => {

	if (depth === undefined && contentLinkDepth !== undefined) {
		depth = contentLinkDepth
	} else if (depth === undefined && contentLinkDepth === undefined) {
		depth = 2
	}

	let pageItem = await store.getItem({
		options,
		itemType: "page",
		languageCode,
		itemID: pageID,
	});

	if (depth > 0) {
		//if a depth was specified, pull in the modules (content items) for this page
		for (const zoneName in pageItem.zones) {
			const zone = pageItem.zones[zoneName];

			for (const mod of zone) {
				const moduleItem = await getContentItem({
					options,
					contentID: mod.item.contentid,
					languageCode,
					depth: depth - 1,
					expandAllContentLinks
				});
				mod.item = moduleItem;
			}
		}
	}

	return pageItem;
};

const getSitemap = async ({ channelName, languageCode }) => {
	return await store.getItem({
		options,
		itemType: "sitemap",
		languageCode,
		itemID: channelName,
	});
};

const getSitemapNested = async ({ channelName, languageCode }) => {
	return await store.getItem({
		options,
		itemType: "nestedsitemap",
		languageCode,
		itemID: channelName,
	});
};

/**
 * Clear everything out.
 */
const clear = async () => {
	await store.clearItems({ options });
};

export default {
	saveContentItem,
	savePageItem,
	getContentItem,
	getContentList,
	getPage,
	getSitemap,
	getSitemapFlat: getSitemap,
	getSitemapNested,
	saveSitemap,
	saveSitemapNested,
	saveUrlRedirections,
	getUrlRedirections,
	getSyncState,
	saveSyncState,
	clear,
	setStore,
	getStore
};
