import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import storeInterfaceFileSystem from '../src/store-interface-filesystem.ts';
import { createMockContentItem } from './utils.ts';

describe('store-interface-filesystem', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        storeInterfaceFileSystem.setOptions({ rootPath: './test-data' });
    });

    describe('saveItem', () => {
        it('should save an item to the filesystem', async () => {
            const item = createMockContentItem();
            const options = { rootPath: './test-data' };
            const itemType = 'item';
            const languageCode = 'en-us';
            const itemID = item.contentID;

            vi.mocked(fs.existsSync).mockReturnValue(false);
            vi.mocked(path.dirname).mockReturnValue('./test-data/en-us/item');
            vi.mocked(path.join).mockReturnValue('./test-data/en-us/item/1.json');

            await storeInterfaceFileSystem.saveItem({ options, item, itemType, languageCode, itemID });

            expect(fs.mkdirSync).toHaveBeenCalledWith('./test-data/en-us/item', { recursive: true });
            expect(fs.writeFileSync).toHaveBeenCalledWith(
                './test-data/en-us/item/1.json',
                JSON.stringify(item)
            );
        });
    });

    describe('getItem', () => {
        it('should return null if file does not exist', async () => {
            const options = { rootPath: './test-data' };
            const itemType = 'item';
            const languageCode = 'en-us';
            const itemID = 1;

            vi.mocked(fs.existsSync).mockReturnValue(false);
            vi.mocked(path.join).mockReturnValue('./test-data/en-us/item/1.json');

            const result = await storeInterfaceFileSystem.getItem({ options, itemType, languageCode, itemID });

            expect(result).toBeNull();
        });

        it('should return parsed JSON if file exists', async () => {
            const item = createMockContentItem();
            const options = { rootPath: './test-data' };
            const itemType = 'item';
            const languageCode = 'en-us';
            const itemID = item.contentID;

            vi.mocked(fs.existsSync).mockReturnValue(true);
            vi.mocked(path.join).mockReturnValue('./test-data/en-us/item/1.json');
            vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(item));

            const result = await storeInterfaceFileSystem.getItem({ options, itemType, languageCode, itemID });

            expect(result).toEqual(item);
        });
    });

    describe('deleteItem', () => {
        it('should delete an item from the filesystem', async () => {
            const options = { rootPath: './test-data' };
            const itemType = 'item';
            const languageCode = 'en-us';
            const itemID = 1;

            vi.mocked(fs.existsSync).mockReturnValue(true);
            vi.mocked(path.join).mockReturnValue('./test-data/en-us/item/1.json');

            await storeInterfaceFileSystem.deleteItem({ options, itemType, languageCode, itemID });

            expect(fs.unlinkSync).toHaveBeenCalledWith('./test-data/en-us/item/1.json');
        });

        it('should not throw if file does not exist', async () => {
            const options = { rootPath: './test-data' };
            const itemType = 'item';
            const languageCode = 'en-us';
            const itemID = 1;

            vi.mocked(fs.existsSync).mockReturnValue(false);
            vi.mocked(path.join).mockReturnValue('./test-data/en-us/item/1.json');

            await expect(storeInterfaceFileSystem.deleteItem({ options, itemType, languageCode, itemID }))
                .resolves.not.toThrow();
        });
    });

    describe('clearItems', () => {
        it('should clear all items from the filesystem', async () => {
            const rootPath = './test-data';
            vi.mocked(fs.existsSync).mockReturnValue(true);

            await storeInterfaceFileSystem.clearItems();

            expect(fs.rmSync).toHaveBeenCalledWith(rootPath, { recursive: true, force: true });
        });

        it('should not throw if directory does not exist', async () => {
            vi.mocked(fs.existsSync).mockReturnValue(false);

            await expect(storeInterfaceFileSystem.clearItems()).resolves.not.toThrow();
        });
    });
}); 