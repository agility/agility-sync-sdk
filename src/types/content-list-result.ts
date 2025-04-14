import { ContentItem } from './content-item';

/**
 * Interface defining the result of a content list query in Agility CMS.
 * This represents a paginated list of content items with total count.
 */
export interface ContentListResult {
    /**
     * Array of content items in the current page
     */
    items: ContentItem[];

    /**
     * Total number of items available across all pages
     */
    totalCount: number;
} 