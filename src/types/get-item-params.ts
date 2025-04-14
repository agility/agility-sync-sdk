import { StoreOptions } from './store-options';

/**
 * Interface defining the parameters required for retrieving an item from the store.
 */
export interface GetItemParams {
    /**
     * Store-specific options
     */
    options: StoreOptions;

    /**
     * Type of the item being retrieved
     */
    itemType: string;

    /**
     * Language code for the item
     */
    languageCode: string;

    /**
     * ID of the item being retrieved
     */
    itemID: string | number;
} 