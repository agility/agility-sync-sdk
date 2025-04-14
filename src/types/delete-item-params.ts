import { StoreOptions } from './store-options';

/**
 * Interface defining the parameters required for deleting an item from the store.
 */
export interface DeleteItemParams {
    /**
     * Store-specific options
     */
    options: StoreOptions;

    /**
     * Type of the item being deleted
     */
    itemType: string;

    /**
     * Language code for the item
     */
    languageCode: string;

    /**
     * ID of the item being deleted
     */
    itemID: string | number;
} 