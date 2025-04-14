/**
 * Interface defining the options that can be passed to a store implementation.
 * This interface allows for store-specific configuration while maintaining a common base structure.
 */
export interface StoreOptions {
    /**
     * The root path where the store should operate
     */
    rootPath: string;

    /**
     * Whether to use pretty formatting for JSON files
     */
    pretty?: boolean;

    /**
     * Additional store-specific options can be added as needed
     */
    [key: string]: any;
} 