import { MediaFolder } from './types/media-folder';
import { MediaAsset } from './types/media-asset';
import { StoreInterface } from './types/store-interface';
import { SyncAssetsResponse } from './types/sync-assets-response';

export interface SyncAssetsOptions {
    store: StoreInterface;
    fetchFolders: () => Promise<{ items: MediaFolder[]; syncToken: string }>;
    fetchAssets: () => Promise<SyncAssetsResponse>;
}

export async function syncAssets(options: SyncAssetsOptions): Promise<void> {
    const { store, fetchFolders, fetchAssets } = options;

    // Fetch and save folders
    const foldersResponse = await fetchFolders();
    for (const folder of foldersResponse.items) {
        await store.saveItem('mediaFolders', folder.mediaFolderID.toString(), folder);
    }

    // Fetch and save assets
    const assetsResponse = await fetchAssets();
    for (const asset of assetsResponse.items) {
        await store.saveItem('mediaAssets', asset.mediaID.toString(), asset);
    }
} 