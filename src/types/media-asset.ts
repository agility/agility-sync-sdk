/**
 * Interface defining the structure of a media asset in Agility CMS.
 */
export interface MediaAsset {
    /**
     * The unique identifier for the media asset
     */
    mediaID: number;

    /**
     * The name of the media asset
     */
    name: string;

    /**
     * The URL of the media asset
     */
    url: string;

    /**
     * The file size of the media asset in bytes
     */
    size: number;

    /**
     * The MIME type of the media asset
     */
    type: string;

    /**
     * The ID of the folder containing this asset
     */
    folderID: number;

    /**
     * Additional properties of the media asset
     */
    properties: {
        /**
         * Dynamic index signature to allow for flexible properties
         */
        [key: string]: any;
    };
}

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