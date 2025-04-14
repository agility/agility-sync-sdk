import { StoreOptions } from "./types/store-options.ts";
import { SaveItemParams } from "./types/save-item-params.ts";
import { DeleteItemParams } from "./types/delete-item-params.ts";
import { MergeItemToListParams } from "./types/merge-item-to-list-params.ts";
import { GetItemParams } from "./types/get-item-params.ts";
import { ClearItemsParams } from "./types/clear-items-params.ts";
import { StoreInterface } from "./types/store-interface.ts";
import { SyncState } from "./types/sync-state.ts";

let options: StoreOptions | null = null;

const setOptions = (opts: StoreOptions): void => {
    options = opts;
};

const getContentItem = async (params: { contentID: number; languageCode: string }) => {
    return getItem({
        options: { rootPath: options?.rootPath || '.agility-files' },
        itemType: 'item',
        languageCode: params.languageCode,
        itemID: params.contentID
    });
};

const getContentList = async (params: { referenceName: string; languageCode: string }) => {
    return getItem({
        options: { rootPath: options?.rootPath || '.agility-files' },
        itemType: 'list',
        languageCode: params.languageCode,
        itemID: params.referenceName
    });
};

const getPage = async (params: { pageID: number; languageCode: string }) => {
    return getItem({
        options: { rootPath: options?.rootPath || '.agility-files' },
        itemType: 'page',
        languageCode: params.languageCode,
        itemID: params.pageID
    });
};

const getUrlRedirections = async (params: { languageCode: string }) => {
    return getItem({
        options: { rootPath: options?.rootPath || '.agility-files' },
        itemType: 'urlredirections',
        languageCode: params.languageCode,
        itemID: 'urlredirections'
    });
};

const getSyncState = async (languageCode: string): Promise<SyncState | null> => {
    return getItem({
        options: { rootPath: options?.rootPath || '.agility-files' },
        itemType: 'state',
        languageCode: languageCode,
        itemID: 'state'
    });
};

/**
 * The function to handle saving/updating an item to your storage. This could be a Content Item, Page, Url Redirections, Sync State (state), or Sitemap.
 * @param {Object} params - The parameters object
 * @param {Object} params.options - A flexible object that can contain any properties specifically related to this interface
 * @param {Object} params.item - The object representing the Content Item, Page, Url Redirections, Sync State (state), or Sitemap that needs to be saved/updated
 * @param {String} params.itemType - The type of item being saved/updated, expected values are `item`, `page`, `sitemap`, `nestedsitemap`, `state`, `urlredirections`
 * @param {String} params.languageCode - The locale code associated to the item being saved/updated
 * @param {(String|Number)} params.itemID - The ID of the item being saved/updated - this could be a string or number depending on the itemType
 * @returns {Promise<void>}
 */
const saveItem = async ({ options, item, itemType, languageCode, itemID }: SaveItemParams): Promise<void> => {
    console.log(`Console Interface: saveItem has been called`);
}

/**
 * The function to handle deleting an item to your storage. This could be a Content Item, Page, Url Redirections, Sync State (state), or Sitemap.
 * @param {Object} params - The parameters object
 * @param {Object} params.options - A flexible object that can contain any properties specifically related to this interface
 * @param {String} params.itemType - The type of item being deleted, expected values are `item`, `page`, `sitemap`, `nestedsitemap`, `state`, `urlredirections`
 * @param {String} params.languageCode - The locale code associated to the item being saved/updated
 * @param {(String|Number)} params.itemID - The ID of the item being deleted - this could be a string or number depending on the itemType
 * @returns {Promise<void>}
 */
const deleteItem = async ({ options, itemType, languageCode, itemID }: DeleteItemParams): Promise<void> => {
    console.log(`Console Interface: deleteItem has been called`);
}

/**
 * The function to handle updating and placing a Content Item into a "list" so that you can handle querying a collection of items.
 * @param {Object} params - The parameters object
 * @param {Object} params.options - A flexible object that can contain any properties specifically related to this interface
 * @param {Object} params.item - The object representing the Content Item
 * @param {String} params.languageCode - The locale code associated to the item being saved/updated 
 * @param {(String|Number)} params.itemID - The ID of the item being updated - this could be a string or number depending on the itemType
 * @param {String} params.referenceName - The reference name of the Content List that this Content Item should be added to
 * @param {String} params.definitionName - The Model name that the Content Item is based on
 * @returns {Promise<void>}
 */
const mergeItemToList = async ({ options, item, languageCode, itemID, referenceName, definitionName }: MergeItemToListParams): Promise<void> => {
    console.log(`Console Interface: mergeItemToList has been called`);
}

/**
 * The function to handle retrieving a Content Item, Page, Url Redirections, Sync State (state), or Sitemap
 * @param {Object} params - The parameters object
 * @param {Object} params.options - A flexible object that can contain any properties specifically related to this interface
 * @param {String} params.itemType - The type of item being accessed, expected values are `item`, `list`, `page`, `sitemap`, `nestedsitemap`, `state`, `urlredirections`
 * @param {String} params.languageCode - The locale code associated to the item being accessed
 * @param {(String|Number)} params.itemID - The ID of the item being accessed - this could be a string or number depending on the itemType
 * @returns {Promise<any>}
 */
const getItem = async ({ options, itemType, languageCode, itemID }: GetItemParams): Promise<any> => {
    console.log(`Console Interface: getItem has been called`);
    return null;
}

/**
 * The function to handle clearing the cache of synchronized data from the CMS
 * @param {Object} params - The parameters object
 * @param {Object} params.options - A flexible object that can contain any properties specifically related to this interface
 * @returns {Promise<void>}
 */
const clearItems = async ({ options }: ClearItemsParams): Promise<void> => {
    console.log(`Console Interface: clearItems has been called`);
}

const saveContentItem = async (params: { contentItem: any; languageCode: string }): Promise<void> => {
    await saveItem({
        options: { rootPath: options?.rootPath || '.agility-files' },
        item: params.contentItem,
        itemType: 'item',
        languageCode: params.languageCode,
        itemID: params.contentItem.contentID
    });
};

const savePageItem = async (params: { pageItem: any; languageCode: string }): Promise<void> => {
    await saveItem({
        options: { rootPath: options?.rootPath || '.agility-files' },
        item: params.pageItem,
        itemType: 'page',
        languageCode: params.languageCode,
        itemID: params.pageItem.pageID
    });
};

const storeInterface = {
    clearItems,
    deleteItem,
    getItem,
    saveItem,
    mergeItemToList,
    getContentItem,
    getContentList,
    getPage,
    getUrlRedirections,
    saveContentItem,
    savePageItem,
    setOptions,
    getSyncState
};

export default storeInterface;

export type {
    StoreOptions,
    SaveItemParams,
    DeleteItemParams,
    MergeItemToListParams,
    GetItemParams,
    ClearItemsParams
}; 