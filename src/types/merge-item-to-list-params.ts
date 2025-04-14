import { StoreOptions } from './store-options';

/**
 * Interface defining the parameters required for merging an item into a list in the store.
 */
export interface MergeItemToListParams {
    /**
     * Store-specific options
     */
    options: StoreOptions;

    /**
     * The item to be merged
     */
    item: any;

    /**
     * Language code for the item
     */
    languageCode: string;

    /**
     * ID of the item being merged
     */
    itemID: string | number;

    /**
     * Reference name for the list
     */
    referenceName: string;

    /**
     * Definition name for the list (optional)
     */
    definitionName: string | null;
} 