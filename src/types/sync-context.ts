import { StoreInterface } from './store-interface';
import { AgilityClient } from './agility-client';

/**
 * Interface defining the context for synchronization operations.
 */
export interface SyncContext {
    /**
     * The store interface implementation
     */
    store: StoreInterface;

    /**
     * The Agility client instance
     */
    agilityClient: AgilityClient;
} 