import { ExtendedStoreInterface } from './extended-store-interface';
import { ClientConfig } from './client-config';
import { SyncState } from './sync-state';

/**
 * Interface defining the structure of a client object in Agility CMS.
 */
export interface ClientObject {
    /**
     * Store-related functionality
     */
    store: ExtendedStoreInterface;

    /**
     * Client configuration
     */
    config: ClientConfig;

    /**
     * Synchronizes content for a specific language
     * @param languageCode - The language code to sync
     * @param itemToken - The token for content item synchronization
     * @returns The next token to use for synchronization
     */
    syncContent: (languageCode: string, itemToken: number) => Promise<number>;

    /**
     * Synchronizes pages for a specific language
     * @param languageCode - The language code to sync
     * @param pageToken - The token for page synchronization
     * @returns The next token to use for synchronization
     */
    syncPages: (languageCode: string, pageToken: number) => Promise<number>;

    /**
     * Agility client functionality
     */
    agilityClient: {
        /**
         * Gets a flat sitemap for a specific channel and language
         * @param params - Parameters for getting the sitemap
         * @param params.channelName - The channel name
         * @param params.languageCode - The language code
         */
        getSitemapFlat: (params: { channelName: string; languageCode: string }) => Promise<any>;

        /**
         * Gets a nested sitemap for a specific channel and language
         * @param params - Parameters for getting the nested sitemap
         * @param params.channelName - The channel name
         * @param params.languageCode - The language code
         */
        getSitemapNested: (params: { channelName: string; languageCode: string }) => Promise<any>;

        /**
         * Gets URL redirections since a specific date
         * @param params - Parameters for getting URL redirections
         * @param params.lastAccessDate - The date to get redirections since
         */
        getUrlRedirections: (params: { lastAccessDate: Date | null }) => Promise<any>;
    };
} 