/**
 * Interface defining the structure of a page item in Agility CMS.
 * This represents a single page with its properties and content zones.
 */
export interface PageItem {
    /**
     * The unique identifier for the page
     */
    pageID: number;

    /**
     * Properties of the page
     */
    properties: {
        /**
         * The state of the page (e.g., published, draft)
         */
        state?: number;
    };

    /**
     * The content zones of the page, where each zone contains an array of content items
     */
    zones: Record<string, Array<{
        /**
         * The content item in this zone
         */
        item: {
            /**
             * The ID of the content item
             */
            contentid: number;
        };
    }>>;
} 