import { describe, it, expect, vi } from 'vitest';
import { syncAssets } from '../src/sync-assets';
import { MediaFolder } from '../src/types/media-folder';
import { MediaAsset } from '../src/types/media-asset';
import { StoreInterface } from '../src/types/store-interface';

describe('syncAssets', () => {
    const mockStore: StoreInterface = {
        clearItems: vi.fn(),
        deleteItem: vi.fn(),
        getItem: vi.fn(),
        saveItem: vi.fn(),
        mergeItemToList: vi.fn(),
        saveContentItem: vi.fn(),
        savePageItem: vi.fn()
    };

    const mockFolders: MediaFolder[] = [
        { mediaFolderID: 1, name: 'Folder 1' },
        { mediaFolderID: 2, name: 'Folder 2', parentFolderID: 1 }
    ];

    const mockAssets: MediaAsset[] = [
        { mediaID: 1, name: 'Asset 1', url: 'url1', size: 100, type: 'image/jpeg', folderID: 1, properties: {} },
        { mediaID: 2, name: 'Asset 2', url: 'url2', size: 200, type: 'image/png', folderID: 2, properties: {} }
    ];

    it('should successfully sync media folders and assets', async () => {
        const fetchFolders = vi.fn().mockResolvedValue({ items: mockFolders, syncToken: 'folder-token' });
        const fetchAssets = vi.fn().mockResolvedValue({ items: mockAssets, syncToken: 'asset-token' });

        await syncAssets({ store: mockStore, fetchFolders, fetchAssets });

        expect(fetchFolders).toHaveBeenCalled();
        expect(fetchAssets).toHaveBeenCalled();
        expect(mockStore.saveItem).toHaveBeenCalledTimes(4);
    });

    it('should handle errors when fetching folders fails', async () => {
        const fetchFolders = vi.fn().mockRejectedValue(new Error('Failed to fetch folders'));
        const fetchAssets = vi.fn().mockResolvedValue({ items: mockAssets, syncToken: 'asset-token' });

        await expect(syncAssets({ store: mockStore, fetchFolders, fetchAssets })).rejects.toThrow('Failed to fetch folders');
    });

    it('should handle errors when fetching assets fails', async () => {
        const fetchFolders = vi.fn().mockResolvedValue({ items: mockFolders, syncToken: 'folder-token' });
        const fetchAssets = vi.fn().mockRejectedValue(new Error('Failed to fetch assets'));

        await expect(syncAssets({ store: mockStore, fetchFolders, fetchAssets })).rejects.toThrow('Failed to fetch assets');
    });
}); 