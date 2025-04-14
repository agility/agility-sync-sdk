/**
 * Interface defining the structure of an item within a media gallery in Agility CMS.
 */
export interface MediaGalleryItem {
    /**
     * The ID of the media asset in this gallery item
     */
    mediaID: number;

    /**
     * The order in which this item appears in the gallery
     */
    sortOrder: number;

    /**
     * Optional caption for the gallery item
     */
    caption?: string;
} 