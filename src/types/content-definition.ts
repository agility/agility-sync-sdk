/**
 * Interface defining the structure of a content definition in Agility CMS.
 * This represents the schema or template for a type of content.
 */
export interface ContentDefinition {
    /**
     * The unique identifier for the content definition
     */
    contentID: number;

    /**
     * The reference name for this content definition
     */
    referenceName: string;

    /**
     * The display name of the content definition
     */
    name: string;

    /**
     * Properties of the content definition
     */
    properties: {
        /**
         * Dynamic index signature to allow for flexible properties
         */
        [key: string]: any;
    };
}

/**
 * Interface defining a list of content definitions with pagination information.
 */
export interface ContentDefinitionList {
    /**
     * Array of content definitions in the current page
     */
    items: ContentDefinition[];

    /**
     * Total number of content definitions available across all pages
     */
    totalCount: number;
} 