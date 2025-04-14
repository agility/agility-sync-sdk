import { logInfo, logWarning } from '../util';
import { MediaGallery } from '../types/media-gallery.ts';
import { MediaGalleryItem } from '../types/media-gallery-item.ts';
import { MediaGalleryList } from '../types/media-gallery-list.ts';
import { AgilityClient } from '../types/agility-client.ts';
import { StoreInterface } from '../types/store-interface.ts';
import { SyncContext } from '../types/sync-context.ts';

/**
 * Sync the media galleries from the Agility Instance.
 * This uses the Management API to fetch all media galleries and their items.
 */
export default async function syncGalleries(
    this: SyncContext,
    languageCode: string
): Promise<void> {
    const storeInterface = this.store;
    const PAGE_SIZE = 50;

    try {
        let totalGalleries = 0;
        let hasMore = true;
        let skip = 0;

        while (hasMore) {
            try {
                const galleryList = await this.agilityClient.management.getMediaGalleryList({
                    take: PAGE_SIZE,
                    skip
                });

                if (!galleryList || !galleryList.items || galleryList.items.length === 0) {
                    hasMore = false;
                    continue;
                }

                // Save each gallery with its items
                for (const gallery of galleryList.items) {
                    try {
                        // Get the full gallery details including items
                        const fullGallery = await this.agilityClient.management.getMediaGallery({
                            galleryID: gallery.galleryID
                        });

                        await storeInterface.saveItem({
                            options: {},
                            item: fullGallery,
                            itemType: 'gallery',
                            languageCode,
                            itemID: gallery.galleryID
                        });

                        totalGalleries++;
                        logInfo(`Saved gallery: ${gallery.name} with ${fullGallery.items?.length || 0} items`);
                    } catch (error) {
                        logWarning(`Failed to sync gallery ${gallery.name}: ${error}`);
                    }
                }

                skip += galleryList.items.length;
                hasMore = galleryList.items.length === PAGE_SIZE;

                logInfo(`Synced ${galleryList.items.length} gallery/galleries. Total: ${totalGalleries}`);
            } catch (error) {
                logWarning(`Failed to sync galleries batch: ${error}`);
                hasMore = false;
            }
        }

        logInfo(`Completed syncing ${totalGalleries} gallery/galleries`);
    } catch (error) {
        logWarning(`Failed to sync galleries: ${error}`);
    }
} 