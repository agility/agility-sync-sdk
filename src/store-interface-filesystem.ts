import fs from 'fs';
import os from 'os';
import path from 'path';
import { sleep } from "./util";
import { lockSync, unlockSync, checkSync, check } from "proper-lockfile";
import dotenv from "dotenv";

import { StoreOptions } from "./types/store-options";
import { SaveItemParams } from "./types/save-item-params";
import { DeleteItemParams } from "./types/delete-item-params";
import { MergeItemToListParams } from "./types/merge-item-to-list-params";
import { GetItemParams } from "./types/get-item-params";
import { ClearItemsParams } from "./types/clear-items-params";
import { GetFilePathParams } from "./types/get-file-path-params";
import { StoreInterface } from "./types/store-interface";
import { ExtendedStoreInterface } from "./types/extended-store-interface";
import { SyncState } from "./types/sync-state";
import { ContentItem } from "./types/content-item";
import { PageItem } from "./types/page-item";
import { Sitemap } from "./types/sitemap";
import { ContentListResult } from "./types/content-list-result";

dotenv.config({
	path: `.env.${process.env.NODE_ENV}`,
});

let options: StoreOptions | null = null;

const setOptions = (opts: StoreOptions): void => {
	options = opts;
};

/**
 * The function to handle saving/updating an item to your storage. This could be a Content Item, Page, Url Redirections, Sync State (state), or Sitemap.
 * @param {Object} params - The parameters object
 * @param {Object} params.options - A flexible object that can contain any properties specifically related to this interface
 * @param {String} params.options.rootPath - The path to store/access the content as JSON 
 * @param {Object} params.item - The object representing the Content Item, Page, Url Redirections, Sync State (state), or Sitemap that needs to be saved/updated
 * @param {String} params.itemType - The type of item being saved/updated, expected values are `item`, `page`, `sitemap`, `nestedsitemap`, `state`, `urlredirections`
 * @param {String} params.languageCode - The locale code associated to the item being saved/updated
 * @param {(String|Number)} params.itemID - The ID of the item being saved/updated - this could be a string or number depending on the itemType
 * @returns {Promise<void>}
 */
const saveItem = async ({ options, item, itemType, languageCode, itemID }: SaveItemParams): Promise<void> => {
	console.log(`File System Interface: saveItem has been called`);
	if (!options) throw new Error('Store options not initialized');
	const filePath = getFilePath({ options, itemType, languageCode, itemID });
	const dirPath = path.dirname(filePath);

	// Create all necessary directories
	const rootDir = path.join(options.rootPath, languageCode);
	if (!fs.existsSync(rootDir)) {
		fs.mkdirSync(rootDir, { recursive: true });
	}

	const typeDir = path.join(rootDir, itemType);
	if (!fs.existsSync(typeDir)) {
		fs.mkdirSync(typeDir, { recursive: true });
	}

	if (!fs.existsSync(dirPath)) {
		fs.mkdirSync(dirPath, { recursive: true });
	}

	const json = options.pretty ? JSON.stringify(item, null, 2) : JSON.stringify(item);
	fs.writeFileSync(filePath, json);
};

/**
 * The function to handle deleting an item to your storage. This could be a Content Item, Page, Url Redirections, Sync State (state), or Sitemap.
 * @param {Object} params - The parameters object
 * @param {Object} params.options - A flexible object that can contain any properties specifically related to this interface
 * @param {String} params.options.rootPath - The path to store/access the content as JSON 
 * @param {String} params.itemType - The type of item being deleted, expected values are `item`, `page`, `sitemap`, `nestedsitemap`, `state`, `urlredirections`
 * @param {String} params.languageCode - The locale code associated to the item being saved/updated
 * @param {(String|Number)} params.itemID - The ID of the item being deleted - this could be a string or number depending on the itemType
 * @returns {Promise<void>}
 */
const deleteItem = async ({ options, itemType, languageCode, itemID }: DeleteItemParams): Promise<void> => {
	console.log(`File System Interface: deleteItem has been called`);
	const filePath = getFilePath({ options, itemType, languageCode, itemID });

	if (fs.existsSync(filePath)) {
		fs.unlinkSync(filePath);
	}
};

/**
 * The function to handle updating and placing a Content Item into a "list" so that you can handle querying a collection of items.
 * @param {Object} params - The parameters object
 * @param {Object} params.options - A flexible object that can contain any properties specifically related to this interface
 * @param {String} params.options.rootPath - The path to store/access the content as JSON 
 * @param {Object} params.item - The object representing the Content Item
 * @param {String} params.languageCode - The locale code associated to the item being saved/updated 
 * @param {(String|Number)} params.itemID - The ID of the item being updated - this could be a string or number depending on the itemType
 * @param {String} params.referenceName - The reference name of the Content List that this Content Item should be added to
 * @param {String} params.definitionName - The Model name that the Content Item is based on
 * @returns {Promise<void>}
 */
const mergeItemToList = async ({ 
	options, 
	item, 
	languageCode, 
	itemID, 
	referenceName, 
	definitionName 
}: MergeItemToListParams): Promise<void> => {
	console.log(`File System Interface: mergeItemToList has been called`);
	let contentList = await getItem({ options, itemType: "list", languageCode, itemID: referenceName });

	if (contentList == null) {
		//initialize the list
		contentList = [item];
	} else {
		//replace the item...
		const cIndex = contentList.findIndex((ci: any) => {
			return ci.contentID === itemID;
		});

		if (item.properties.state === 3) {
			//*** deleted item (remove from the list) ***
			if (cIndex >= 0) {
				//remove the item
				contentList.splice(cIndex, 1);
			}
		} else {
			//*** regular item (merge) ***
			if (cIndex >= 0) {
				//replace the existing item
				contentList[cIndex] = item;
			} else {
				//add it to the end of the list
				contentList.push(item);
			}
		}
	}

	await saveItem({ options, item: contentList, itemType: "list", languageCode, itemID: referenceName });
};

/**
 * The function to handle retrieving a Content Item, Page, Url Redirections, Sync State (state), or Sitemap
 * @param {Object} params - The parameters object
 * @param {Object} params.options - A flexible object that can contain any properties specifically related to this interface
 * @param {String} params.options.rootPath - The path to store/access the content as JSON 
 * @param {String} params.itemType - The type of item being accessed, expected values are `item`, `list`, `page`, `sitemap`, `nestedsitemap`, `state`, `urlredirections`
 * @param {String} params.languageCode - The locale code associated to the item being accessed
 * @param {(String|Number)} params.itemID - The ID of the item being accessed - this could be a string or number depending on the itemType
 * @returns {Promise<any>}
 */
const getItem = async ({ options, itemType, languageCode, itemID }: GetItemParams): Promise<any> => {
	console.log(`File System Interface: getItem has been called`);
	const filePath = getFilePath({ options, itemType, languageCode, itemID });

	if (!fs.existsSync(filePath)) return null;

	const json = fs.readFileSync(filePath, 'utf8');
	return JSON.parse(json);
};

/**
 * The function to handle clearing the cache of synchronized data from the CMS
 * @param {Object} params - The parameters object
 * @param {Object} params.options - A flexible object that can contain any properties specifically related to this interface
 * @param {String} params.options.rootPath - The path to store/access the content as JSON 
 * @returns {Promise<void>}
 */
const clearItems = async (): Promise<void> => {
	console.log(`File System Interface: clearItems has been called`);
	const rootPath = options?.rootPath || '.agility-files';
	if (fs.existsSync(rootPath)) {
		fs.rmSync(rootPath, { recursive: true, force: true });
	}
	// Recreate the root directory
	fs.mkdirSync(rootPath, { recursive: true });
};

/**
 * The function to handle multi-threaded Syncs that may be happening at the same time. If you need to prevent a sync from happening and let it wait until another sync has finished use this.
 * @returns A function to release the lock
 */
const mutexLock = async (): Promise<() => void> => {
	const dir = os.tmpdir();
	const lockFile = `${dir}/${"agility-sync"}.mutex`;
	
	if (!fs.existsSync(lockFile)) {
		fs.writeFileSync(lockFile, "agility-sync");
	}

	//THE LOCK IS ALREADY HELD - WAIT UP!
	await waitOnLock(lockFile);

	try {
		lockSync(lockFile);
		return () => {
			unlockSync(lockFile);
		};
	} catch (err) {
		if (`${err}`.indexOf("Lock file is already being held") !== -1) {
			//this error happens when 2 processes try to get a lock at the EXACT same time (very rare)
			await sleep(100);
			await waitOnLock(lockFile);

			try {
				lockSync(lockFile);
				return () => {
					unlockSync(lockFile);
				};
			} catch (e2) {
				if (`${e2}`.indexOf("Lock file is already being held") !== -1) {
					//this error happens when 2 processes try to get a lock at the EXACT same time (very rare)
					await sleep(100);
					await waitOnLock(lockFile);
					lockSync(lockFile);
					return () => {
						unlockSync(lockFile);
					};
				}
				throw e2;
			}
		}
		throw new Error("The mutex lock could not be obtained.");
	}
};

/**
 * Private function to wait on a lock file
 * @param {string} lockFile - The path to the lock file
 * @returns {Promise<void>}
 */
const waitOnLock = async (lockFile: string): Promise<void> => {
	while (await check(lockFile)) {
		await sleep(100);
	}
};

/**
 * Private function to get path of an item
 * @param {Object} params - The parameters object
 * @param {Object} params.options - A flexible object that can contain any properties specifically related to this interface
 * @param {String} params.options.rootPath - The path to store/access the content as JSON 
 * @param {String} params.itemType - The type of item being accessed
 * @param {String} params.languageCode - The locale code associated to the item being accessed
 * @param {(String|Number)} params.itemID - The ID of the item being accessed
 * @returns {string}
 */
const getFilePath = ({ options, itemType, languageCode, itemID }: GetFilePathParams): string => {
	let sanitizedItemID = itemID;
	if (typeof itemID === 'string') {
		sanitizedItemID = itemID.replace(/[`!@#$%^&*()+\=\[\]{};':"\\|,.<>\/?~]/g, "");
	}
	const fileName = `${sanitizedItemID}.json`;
	return path.join(options.rootPath, languageCode, itemType, fileName);
};

const saveContentItem = async (params: { contentItem: ContentItem; languageCode: string }): Promise<void> => {
	if (!options) throw new Error('Store options not initialized');
	await saveItem({ 
		options, 
		item: params.contentItem, 
		itemType: 'item', 
		languageCode: params.languageCode, 
		itemID: params.contentItem.contentID 
	});
};

const savePageItem = async (params: { pageItem: PageItem; languageCode: string }): Promise<void> => {
	if (!options) throw new Error('Store options not initialized');
	await saveItem({ 
		options, 
		item: params.pageItem, 
		itemType: 'page', 
		languageCode: params.languageCode, 
		itemID: params.pageItem.pageID 
	});
};

const getPage = async (params: { pageID: number; languageCode: string; depth?: number; contentLinkDepth?: number; expandAllContentLinks?: boolean }): Promise<any> => {
	if (!options) throw new Error('Store options not initialized');
	const page = await getItem({ 
		options, 
		itemType: 'page', 
		languageCode: params.languageCode, 
		itemID: params.pageID 
	});
	if (!page) {
		return {
			pageID: params.pageID,
			languageCode: params.languageCode,
			properties: {},
			zones: {}
		};
	}
	return page;
};

const getContentItem = async (params: { contentID: number; languageCode: string; depth?: number; contentLinkDepth?: number; expandAllContentLinks?: boolean }): Promise<any> => {
	if (!options) throw new Error('Store options not initialized');
	const item = await getItem({ 
		options, 
		itemType: 'item', 
		languageCode: params.languageCode, 
		itemID: params.contentID 
	});
	if (!item) {
		return {
			contentID: params.contentID,
			languageCode: params.languageCode,
			properties: {}
		};
	}
	return item;
};

const getContentList = async (params: { referenceName: string; languageCode: string; depth?: number; contentLinkDepth?: number; expandAllContentLinks?: boolean; skip?: number; take?: number }): Promise<ContentListResult | any[]> => {
	if (!options) throw new Error('Store options not initialized');
	const list = await getItem({ 
		options, 
		itemType: 'list', 
		languageCode: params.languageCode, 
		itemID: params.referenceName 
	});

	if (!list || !Array.isArray(list)) {
		return {
			items: [],
			totalCount: 0
		};
	}

	const totalCount = list.length;
	let items = [...list];

	if (params.skip && params.skip > 0) {
		items = items.slice(params.skip);
	}

	if (params.take && params.take > 0) {
		items = items.slice(0, params.take);
	}

	return {
		items,
		totalCount
	};
};

const getUrlRedirections = async (params: { languageCode: string }): Promise<any> => {
	if (!options) throw new Error('Store options not initialized');
	const redirections = await getItem({ 
		options, 
		itemType: 'urlredirections', 
		languageCode: params.languageCode, 
		itemID: 'urlredirections' 
	});
	if (!redirections) {
		return {
			items: [],
			isUpToDate: true
		};
	}
	return {
		...redirections,
		isUpToDate: redirections.isUpToDate ?? true
	};
};

const getSyncState = async (languageCode: string): Promise<SyncState | null> => {
	if (!options) throw new Error('Store options not initialized');
	return getItem({ options, itemType: 'state', languageCode, itemID: 'state' });
};

const saveSitemap = async (params: { sitemap: any; languageCode: string; channelName: string }): Promise<void> => {
	if (!options) throw new Error('Store options not initialized');
	await saveItem({ 
		options, 
		item: params.sitemap, 
		itemType: 'sitemap', 
		languageCode: params.languageCode, 
		itemID: params.channelName 
	});
};

const saveSitemapNested = async (params: { sitemapNested: any; languageCode: string; channelName: string }): Promise<void> => {
	if (!options) throw new Error('Store options not initialized');
	await saveItem({
		options,
		item: params.sitemapNested,
		itemType: 'nestedsitemap',
		languageCode: params.languageCode,
		itemID: params.channelName
	});
};

const saveUrlRedirections = async (params: { urlRedirections: any; languageCode: string }): Promise<void> => {
	if (!options) throw new Error('Store options not initialized');
	await saveItem({ 
		options, 
		item: params.urlRedirections, 
		itemType: 'urlredirections', 
		languageCode: params.languageCode, 
		itemID: 'urlredirections' 
	});
};

const saveSyncState = async (params: { syncState: SyncState; languageCode: string }): Promise<void> => {
	if (!options) throw new Error('Store options not initialized');
	await saveItem({ 
		options, 
		item: params.syncState, 
		itemType: 'state', 
		languageCode: params.languageCode, 
		itemID: 'state' 
	});
};

const storeInterface: ExtendedStoreInterface = {
	clearItems: async () => {
		if (!options) throw new Error('Store options not initialized');
		await clearItems();
	},
	deleteItem: async (key: string) => {
		if (!options) throw new Error('Store options not initialized');
		const [itemType, languageCode, itemID] = key.split(':');
		await deleteItem({ options, itemType, languageCode, itemID });
	},
	getItem: async (key: string) => {
		if (!options) throw new Error('Store options not initialized');
		const [itemType, languageCode, itemID] = key.split(':');
		return getItem({ options, itemType, languageCode, itemID });
	},
	saveItem: async (key: string, value: any) => {
		if (!options) throw new Error('Store options not initialized');
		const [itemType, languageCode, itemID] = key.split(':');
		await saveItem({ options, item: value, itemType, languageCode, itemID });
	},
	mergeItemToList,
	getContentItem,
	getContentList,
	getPage,
	getUrlRedirections,
	saveContentItem,
	savePageItem,
	setOptions,
	getSyncState,
	saveSitemap,
	saveSitemapNested,
	saveUrlRedirections,
	saveSyncState,
	mutexLock
};

export default storeInterface;

export type {
	StoreOptions,
	SaveItemParams,
	DeleteItemParams,
	MergeItemToListParams,
	GetItemParams,
	ClearItemsParams,
	GetFilePathParams
}; 