/**
 * Interface defining the structure of a sitemap in Agility CMS.
 * This represents the hierarchical structure of pages in the site.
 */
export interface Sitemap {
    /**
     * Dynamic index signature to allow for flexible sitemap structure
     * The key represents the path or identifier, and the value can be any sitemap-related data
     */
    [key: string]: any;
} 