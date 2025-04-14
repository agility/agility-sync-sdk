import { StoreOptions } from './store-options';

/**
 * Interface defining the parameters required for getting a file path in the store.
 */
export interface GetFilePathParams {
    /**
     * Store-specific options
     */
    options: StoreOptions;

    /**
     * Type of the item
     */
    itemType: string;

    /**
     * Language code for the item
     */
    languageCode: string;

    /**
     * ID of the item
     */
    itemID: string | number;
} 