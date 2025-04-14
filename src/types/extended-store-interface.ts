import { StoreInterface } from './store-interface';
import { SyncState } from './sync-state';

/**
 * Interface extending the base StoreInterface with additional methods required for synchronization.
 */
export interface ExtendedStoreInterface extends StoreInterface {
    /**
     * Optional mutex lock function for synchronization
     * @returns A function to release the lock
     */
    mutexLock?: () => Promise<() => void>;

    /**
     * Retrieves the sync state for a specific language
     * @param languageCode - The language code to get the sync state for
     * @returns The sync state or null if not found
     */
    getSyncState: (languageCode: string) => Promise<SyncState | null>;

    /**
     * Saves a sitemap for a specific language and channel
     * @param params - Parameters for saving the sitemap
     * @param params.sitemap - The sitemap to save
     * @param params.languageCode - The language code
     * @param params.channelName - The channel name
     */
    saveSitemap: (params: { sitemap: any; languageCode: string; channelName: string }) => Promise<void>;

    /**
     * Saves a nested sitemap for a specific language and channel
     * @param params - Parameters for saving the nested sitemap
     * @param params.sitemapNested - The nested sitemap to save
     * @param params.languageCode - The language code
     * @param params.channelName - The channel name
     */
    saveSitemapNested: (params: { sitemapNested: any; languageCode: string; channelName: string }) => Promise<void>;

    /**
     * Retrieves URL redirections for a specific language
     * @param params - Parameters for getting URL redirections
     * @param params.languageCode - The language code
     */
    getUrlRedirections: (params: { languageCode: string }) => Promise<any>;

    /**
     * Saves URL redirections for a specific language
     * @param params - Parameters for saving URL redirections
     * @param params.urlRedirections - The URL redirections to save
     * @param params.languageCode - The language code
     */
    saveUrlRedirections: (params: { urlRedirections: any; languageCode: string }) => Promise<void>;

    /**
     * Saves the sync state for a specific language
     * @param params - Parameters for saving the sync state
     * @param params.syncState - The sync state to save
     * @param params.languageCode - The language code
     */
    saveSyncState: (params: { syncState: SyncState; languageCode: string }) => Promise<void>;
} 