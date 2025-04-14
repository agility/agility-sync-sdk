import { logInfo, logWarning } from '../util';
import { MediaAsset, MediaList } from '../types/media-asset.ts';
import { MediaFolder, MediaFolderList } from '../types/media-folder.ts';
import { StoreInterface } from '../types/store-interface.ts';
import { SyncContext } from '../types/sync-context.ts';
import { AgilityClient } from '../types/agility-client.ts';

/**
 * Sync the media assets from the Agility Instance.
 * This uses the Management API to fetch all media assets and folders.
 */
export default async function syncAssets(
    this: SyncContext,
    languageCode: string
): Promise<void> {
    const storeInterface = this.store;
    const PAGE_SIZE = 50;

    try {
        // First, sync media folders
        const folderList = await this.agilityClient.management.getMediaFolderList();
        
        if (folderList && folderList.items) {
            for (const folder of folderList.items) {
                await storeInterface.saveItem({
                    options: {},
                    item: folder,
                    itemType: 'mediaFolder',
                    languageCode,
                    itemID: folder.mediaFolderID
                });
            }
            logInfo(`Synced ${folderList.items.length} media folder(s)`);
        }

        // Then sync media assets
        let totalAssets = 0;
        let hasMore = true;
        let skip = 0;

        while (hasMore) {
            try {
                const mediaList = await this.agilityClient.management.getMediaList({
                    take: PAGE_SIZE,
                    skip
                });

                if (!mediaList || !mediaList.items || mediaList.items.length === 0) {
                    hasMore = false;
                    continue;
                }

                // Save each media asset
                for (const asset of mediaList.items) {
                    await storeInterface.saveItem({
                        options: {},
                        item: asset,
                        itemType: 'media',
                        languageCode,
                        itemID: asset.mediaID
                    });
                    totalAssets++;
                }

                skip += mediaList.items.length;
                hasMore = mediaList.items.length === PAGE_SIZE;

                logInfo(`Synced ${mediaList.items.length} media asset(s). Total: ${totalAssets}`);
            } catch (error) {
                logWarning(`Failed to sync media assets batch: ${error}`);
                hasMore = false;
            }
        }

        logInfo(`Completed syncing ${totalAssets} media asset(s)`);
    } catch (error) {
        logWarning(`Failed to sync media assets: ${error}`);
    }
} 