import { SyncState } from './sync-state';
import { StoreOptions } from './store-options';
import { ContentListResult } from './content-list-result';

/**
 * Interface defining the core functionality required for a store implementation.
 * This interface must be implemented by any store that wants to be used with the Agility Sync SDK.
 */
export interface StoreInterface {
    /**
     * Clears all items from the store
     */
    clearItems: () => Promise<void>;

    /**
     * Deletes an item from the store
     * @param key The key of the item to delete
     */
    deleteItem: (key: string) => Promise<void>;

    /**
     * Gets an item from the store
     * @param key The key of the item to get
     * @returns The item value or null if not found
     */
    getItem: (key: string) => Promise<any>;

    /**
     * Saves an item to the store
     * @param key The key of the item to save
     * @param value The value to save
     */
    saveItem: (key: string, value: any) => Promise<void>;

    /**
     * Merges an item into a list in the store
     * @param params - Parameters for merging an item
     * @param params.options - Store-specific options
     * @param params.item - The item to merge
     * @param params.languageCode - Language code for the item
     * @param params.itemID - ID of the item to merge
     * @param params.referenceName - Reference name for the list
     * @param params.definitionName - Definition name for the list (optional)
     */
    mergeItemToList: (params: { 
        options: any;
        item: any;
        languageCode: string;
        itemID: string | number;
        referenceName: string;
        definitionName: string | null;
    }) => Promise<void>;

    /**
     * Saves a content item to the store
     * @param params - Parameters for saving a content item
     * @param params.contentItem - The content item to save
     * @param params.languageCode - Language code for the item
     */
    saveContentItem: (params: {
        contentItem: any;
        languageCode: string;
    }) => Promise<void>;

    /**
     * Saves a page item to the store
     * @param params - Parameters for saving a page item
     * @param params.pageItem - The page item to save
     * @param params.languageCode - Language code for the item
     */
    savePageItem: (params: {
        pageItem: any;
        languageCode: string;
    }) => Promise<void>;

    /**
     * Retrieves a content item from the store
     * @param params - Parameters for getting a content item
     * @param params.contentID - ID of the content item
     * @param params.languageCode - Language code for the item
     * @param params.depth - Depth of content links to expand
     * @param params.contentLinkDepth - Depth of content links to expand
     * @param params.expandAllContentLinks - Whether to expand all content links
     * @returns The retrieved content item or null if not found
     */
    getContentItem: (params: {
        contentID: number;
        languageCode: string;
        depth?: number;
        contentLinkDepth?: number;
        expandAllContentLinks?: boolean;
    }) => Promise<any>;

    /**
     * Retrieves a content list from the store
     * @param params - Parameters for getting a content list
     * @param params.referenceName - Reference name of the list
     * @param params.languageCode - Language code for the list
     * @param params.depth - Depth of content links to expand
     * @param params.contentLinkDepth - Depth of content links to expand
     * @param params.expandAllContentLinks - Whether to expand all content links
     * @param params.skip - Number of items to skip
     * @param params.take - Number of items to take
     * @returns The retrieved content list or empty array if not found
     */
    getContentList: (params: {
        referenceName: string;
        languageCode: string;
        depth?: number;
        contentLinkDepth?: number;
        expandAllContentLinks?: boolean;
        skip?: number;
        take?: number;
    }) => Promise<ContentListResult | any[]>;

    /**
     * Retrieves a page from the store
     * @param params - Parameters for getting a page
     * @param params.pageID - ID of the page
     * @param params.languageCode - Language code for the page
     * @param params.depth - Depth of content links to expand
     * @param params.contentLinkDepth - Depth of content links to expand
     * @param params.expandAllContentLinks - Whether to expand all content links
     * @returns The retrieved page or null if not found
     */
    getPage: (params: {
        pageID: number;
        languageCode: string;
        depth?: number;
        contentLinkDepth?: number;
        expandAllContentLinks?: boolean;
    }) => Promise<any>;

    /**
     * Retrieves URL redirections from the store
     * @param params - Parameters for getting URL redirections
     * @param params.languageCode - Language code for the redirections
     * @returns The retrieved URL redirections or null if not found
     */
    getUrlRedirections: (params: { languageCode: string }) => Promise<any>;

    /**
     * Saves URL redirections to the store
     * @param params - Parameters for saving URL redirections
     * @param params.urlRedirections - The URL redirections to save
     * @param params.languageCode - Language code for the redirections
     */
    saveUrlRedirections: (params: { urlRedirections: any; languageCode: string }) => Promise<void>;

    /**
     * Saves a sitemap to the store
     * @param params - Parameters for saving a sitemap
     * @param params.sitemap - The sitemap to save
     * @param params.languageCode - Language code for the sitemap
     * @param params.channelName - Channel name for the sitemap
     */
    saveSitemap: (params: { sitemap: any; languageCode: string; channelName: string }) => Promise<void>;

    /**
     * Saves a nested sitemap to the store
     * @param params - Parameters for saving a nested sitemap
     * @param params.sitemapNested - The nested sitemap to save
     * @param params.languageCode - Language code for the sitemap
     * @param params.channelName - Channel name for the sitemap
     */
    saveSitemapNested: (params: { sitemapNested: any; languageCode: string; channelName: string }) => Promise<void>;

    /**
     * Saves the sync state to the store
     * @param params - Parameters for saving the sync state
     * @param params.syncState - The sync state to save
     * @param params.languageCode - Language code for the sync state
     */
    saveSyncState: (params: { syncState: SyncState; languageCode: string }) => Promise<void>;

    /**
     * Retrieves the sync state from the store
     * @param languageCode - The language code to get the sync state for
     * @returns The retrieved sync state or null if not found
     */
    getSyncState: (languageCode: string) => Promise<SyncState | null>;

    /**
     * Sets the options for the store
     * @param options The options to set
     */
    setOptions: (options: StoreOptions) => void;
} 