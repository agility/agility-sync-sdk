import { PageItem } from './page-item';

/**
 * Interface defining the response from a pages synchronization operation.
 */
export interface SyncPagesResponse {
    /**
     * Array of page items returned by the sync operation
     */
    items: PageItem[];

    /**
     * Token to be used for the next sync operation
     */
    syncToken: number;

    /**
     * Indicates if the server is busy processing another request
     */
    busy?: boolean;
} 