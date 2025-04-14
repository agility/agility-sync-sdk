import { MediaAsset } from './media-asset';

/**
 * Interface defining a list of media assets with pagination information.
 */
export interface MediaList {
    /**
     * Array of media assets in the current page
     */
    items: MediaAsset[];

    /**
     * Total number of media assets available across all pages
     */
    totalCount: number;
} 