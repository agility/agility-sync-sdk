import { logInfo, logWarning, sleep } from './util';
import {
  StoreOptions,
  SaveItemParams,
  DeleteItemParams,
  MergeItemToListParams,
  GetItemParams,
  ClearItemsParams,
  GetFilePathParams,
  StoreInterface,
  ExtendedStoreInterface,
  SyncState,
  ContentItem,
  PageItem,
  Sitemap,
  ContentListResult
} from './types/index';

let options: StoreOptions | undefined;

const setOptions = (opts: StoreOptions): void => {
    options = opts;
};

const saveItem = async ({ options: saveOptions, item, itemType, languageCode, itemID }: SaveItemParams): Promise<void> => {
    console.log(`Console Interface: saveItem has been called`);
};

const deleteItem = async ({ options: deleteOptions, itemType, languageCode, itemID }: DeleteItemParams): Promise<void> => {
    console.log(`Console Interface: deleteItem has been called`);
};

const mergeItemToList = async ({ options: mergeOptions, item, languageCode, itemID, referenceName, definitionName }: MergeItemToListParams): Promise<void> => {
    console.log(`Console Interface: mergeItemToList has been called`);
};

const getItem = async ({ options: getOptions, itemType, languageCode, itemID }: GetItemParams): Promise<any> => {
    console.log(`Console Interface: getItem has been called`);
    return null;
};

const clearItems = async ({ options: clearOptions }: ClearItemsParams): Promise<void> => {
    console.log(`Console Interface: clearItems has been called`);
};

const getContentItem = async (params: { contentID: number; languageCode: string }) => {
    return await getItem({
        options: { rootPath: options?.rootPath || '.agility-files' },
        itemType: 'item',
        languageCode: params.languageCode,
        itemID: params.contentID
    });
};

const getContentList = async (params: { referenceName: string; languageCode: string }) => {
    return await getItem({
        options: { rootPath: options?.rootPath || '.agility-files' },
        itemType: 'list',
        languageCode: params.languageCode,
        itemID: params.referenceName
    });
};

const getPage = async (params: { pageID: number; languageCode: string }) => {
    return await getItem({
        options: { rootPath: options?.rootPath || '.agility-files' },
        itemType: 'page',
        languageCode: params.languageCode,
        itemID: params.pageID
    });
};

const getUrlRedirections = async (params: { languageCode: string }) => {
    return await getItem({
        options: { rootPath: options?.rootPath || '.agility-files' },
        itemType: 'urlredirections',
        languageCode: params.languageCode,
        itemID: 'urlredirections'
    });
};

const getSyncState = async (params: { languageCode: string }) => {
    return await getItem({
        options: { rootPath: options?.rootPath || '.agility-files' },
        itemType: 'state',
        languageCode: params.languageCode,
        itemID: 'state'
    });
};

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

const saveSitemap = async (params: { sitemap: any; languageCode: string; channelName: string }): Promise<void> => {
    console.log(`Console Interface: saveSitemap has been called`);
    await saveItem({
        options: { rootPath: options?.rootPath || '.agility-files' },
        item: params.sitemap,
        itemType: 'sitemap',
        languageCode: params.languageCode,
        itemID: params.channelName
    });
};

const saveSitemapNested = async (params: { sitemapNested: any; languageCode: string; channelName: string }): Promise<void> => {
    console.log(`Console Interface: saveSitemapNested has been called`);
    await saveItem({
        options: { rootPath: options?.rootPath || '.agility-files' },
        item: params.sitemapNested,
        itemType: 'nestedsitemap',
        languageCode: params.languageCode,
        itemID: params.channelName
    });
};

const saveUrlRedirections = async (params: { urlRedirections: any; languageCode: string }): Promise<void> => {
    console.log(`Console Interface: saveUrlRedirections has been called`);
    await saveItem({
        options: { rootPath: options?.rootPath || '.agility-files' },
        item: params.urlRedirections,
        itemType: 'urlredirections',
        languageCode: params.languageCode,
        itemID: 'urlredirections'
    });
};

const saveSyncState = async (params: { syncState: SyncState; languageCode: string }): Promise<void> => {
    console.log(`Console Interface: saveSyncState has been called`);
    await saveItem({
        options: { rootPath: options?.rootPath || '.agility-files' },
        item: params.syncState,
        itemType: 'state',
        languageCode: params.languageCode,
        itemID: 'state'
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
    getSyncState,
    saveSitemap,
    saveSitemapNested,
    saveUrlRedirections,
    saveSyncState
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