import { MediaFolder } from './media-folder';

/**
 * Interface defining a list of media folders with pagination information.
 */
export interface MediaFolderList {
    /**
     * Array of media folders in the current page
     */
    items: MediaFolder[];

    /**
     * Total number of media folders available across all pages
     */
    totalCount: number;
} 