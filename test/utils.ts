import { vi } from 'vitest';
import { StoreInterface } from '../src/types/store-interface.ts';
import { AgilityClient } from '../src/types/agility-client.ts';
import { SyncContext } from '../src/types/sync-context.ts';

/**
 * Creates a mock store interface for testing
 */
export function createMockStore(): StoreInterface {
    return {
        clearItems: vi.fn(),
        deleteItem: vi.fn(),
        getItem: vi.fn(),
        saveItem: vi.fn(),
        mergeItemToList: vi.fn(),
        saveContentItem: vi.fn(),
        savePageItem: vi.fn(),
    };
}

/**
 * Creates a mock Agility client for testing
 */
export function createMockAgilityClient(): AgilityClient {
    return {
        management: {
            getContentDefinition: vi.fn(),
            getContentDefinitionList: vi.fn(),
            getMediaList: vi.fn(),
            getMediaFolderList: vi.fn(),
            getMediaGalleryList: vi.fn(),
            getMediaGallery: vi.fn(),
            getContainer: vi.fn(),
            getContainerList: vi.fn(),
        },
        getSyncContent: vi.fn(),
        getSyncPages: vi.fn(),
    };
}

/**
 * Creates a mock sync context for testing
 */
export function createMockSyncContext(): SyncContext {
    return {
        store: createMockStore(),
        agilityClient: createMockAgilityClient(),
    };
}

/**
 * Creates a mock content item for testing
 */
export function createMockContentItem(contentID: number = 1) {
    return {
        contentID,
        properties: {
            title: 'Test Content',
            state: 1,
        },
    };
}

/**
 * Creates a mock page item for testing
 */
export function createMockPageItem(pageID: number = 1) {
    return {
        pageID,
        properties: {
            title: 'Test Page',
            state: 1,
        },
    };
}

/**
 * Creates a mock media asset for testing
 */
export function createMockMediaAsset(mediaID: number = 1) {
    return {
        mediaID,
        name: 'test.jpg',
        url: 'https://example.com/test.jpg',
        size: 1024,
        type: 'image/jpeg',
        folderID: 1,
        properties: {},
    };
}

/**
 * Creates a mock media folder for testing
 */
export function createMockMediaFolder(id: number) {
    return {
        mediaFolderID: id,
        name: `Test Folder ${id}`,
        parentFolderID: undefined,
    };
} 