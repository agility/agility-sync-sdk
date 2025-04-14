/**
 * Interface defining the structure of a content item in Agility CMS.
 * This represents a single piece of content with its properties and fields.
 */
export interface ContentItem {
    /**
     * The unique identifier for the content item
     */
    contentID: number;

    /**
     * Properties of the content item
     */
    properties: {
        /**
         * The name of the content definition this item belongs to
         */
        definitionName?: string;

        /**
         * The reference name for this content item
         */
        referenceName?: string;

        /**
         * The state of the content item (e.g., published, draft)
         */
        state?: number;
    };

    /**
     * The content fields of the item
     */
    fields?: Record<string, any>;

    /**
     * Any custom fields defined for this content item
     */
    customFields?: Record<string, any>;
} 