/**
 * Interface defining the synchronization state in Agility CMS.
 * This tracks the progress and status of content synchronization.
 */
export interface SyncState {
    /**
     * Dynamic index signature to allow for flexible sync state properties
     * Common properties include:
     * - itemToken: number - The token for content item synchronization
     * - pageToken: number - The token for page synchronization
     * - lastSyncDate: Date | string - The timestamp of the last successful sync
     */
    [key: string]: any;
} 