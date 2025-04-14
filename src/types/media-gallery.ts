import { MediaGalleryItem } from './media-gallery-item';

/**
 * Interface defining the structure of a media gallery in Agility CMS.
 */
export interface MediaGallery {
    /**
     * The unique identifier for the media gallery
     */
    galleryID: number;

    /**
     * The name of the media gallery
     */
    name: string;

    /**
     * Optional description of the media gallery
     */
    description?: string;

    /**
     * Array of items in the gallery
     */
    items: MediaGalleryItem[];

    /**
     * Additional properties of the media gallery
     */
    properties: {
        /**
         * Dynamic index signature to allow for flexible properties
         */
        [key: string]: any;
    };
} 