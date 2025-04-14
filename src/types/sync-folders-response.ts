import { MediaFolder } from './media-folder';

/**
 * Interface defining the response from a folders synchronization operation.
 */
export interface SyncFoldersResponse {
    /**
     * Array of media folders returned by the sync operation
     */
    items: MediaFolder[];

    /**
     * Token to be used for the next sync operation
     */
    syncToken: number;

    /**
     * Indicates if the server is busy processing another request
     */
    busy?: boolean;
} 