import { MediaGallery } from './media-gallery';

/**
 * Interface defining a list of media galleries with pagination information.
 */
export interface MediaGalleryList {
    /**
     * Array of media galleries in the current page
     */
    items: MediaGallery[];

    /**
     * Total number of media galleries available across all pages
     */
    totalCount: number;
} 