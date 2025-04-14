import { StoreOptions } from './store-options';

/**
 * Interface defining the parameters required for saving an item to the store.
 */
export interface SaveItemParams {
    /**
     * Store-specific options
     */
    options: StoreOptions;

    /**
     * The item to be saved
     */
    item: any;

    /**
     * Type of the item being saved
     */
    itemType: string;

    /**
     * Language code for the item
     */
    languageCode: string;

    /**
     * ID of the item being saved
     */
    itemID: string | number;
} 