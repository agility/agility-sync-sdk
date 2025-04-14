import { MediaAsset } from './media-asset';

/**
 * Interface defining the response from an assets synchronization operation.
 */
export interface SyncAssetsResponse {
    /**
     * Array of media assets returned by the sync operation
     */
    items: MediaAsset[];

    /**
     * Token to be used for the next sync operation
     */
    syncToken: number;

    /**
     * Indicates if the server is busy processing another request
     */
    busy?: boolean;
} 