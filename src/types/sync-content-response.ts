import { ContentItem } from './content-item';

/**
 * Interface defining the response from a content synchronization operation.
 */
export interface SyncContentResponse {
    /**
     * Array of content items returned by the sync operation
     */
    items: ContentItem[];

    /**
     * Token to be used for the next sync operation
     */
    syncToken: number;

    /**
     * Indicates if the server is busy processing another request
     */
    busy?: boolean;
} 