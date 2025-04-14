/**
 * Interface defining the structure of a media folder in Agility CMS.
 */
export interface MediaFolder {
    /**
     * The unique identifier for the media folder
     */
    mediaFolderID: number;

    /**
     * The name of the media folder
     */
    name: string;

    /**
     * The ID of the parent folder (optional)
     */
    parentFolderID?: number;
}

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