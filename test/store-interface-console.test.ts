import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as storeInterfaceConsole from '../src/store-interface-console.ts';
import { createMockContentItem } from './utils.ts';

describe('store-interface-console', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        storeInterfaceConsole.setOptions({ rootPath: './test-data' });
        vi.spyOn(console, 'log').mockImplementation(() => {});
    });

    describe('saveItem', () => {
        it('should log item details to console', async () => {
            const item = createMockContentItem();
            const options = { rootPath: './test-data' };
            const itemType = 'item';
            const languageCode = 'en-us';
            const itemID = item.contentID;

            await storeInterfaceConsole.saveItem({ options, item, itemType, languageCode, itemID });

            expect(console.log).toHaveBeenCalledWith(
                expect.stringContaining('Saving item'),
                expect.stringContaining(itemType),
                expect.stringContaining(languageCode),
                expect.stringContaining(String(itemID))
            );
        });
    });

    describe('getItem', () => {
        it('should log retrieval attempt and return null', async () => {
            const options = { rootPath: './test-data' };
            const itemType = 'item';
            const languageCode = 'en-us';
            const itemID = 1;

            const result = await storeInterfaceConsole.getItem({ options, itemType, languageCode, itemID });

            expect(console.log).toHaveBeenCalledWith(
                expect.stringContaining('Getting item'),
                expect.stringContaining(itemType),
                expect.stringContaining(languageCode),
                expect.stringContaining(String(itemID))
            );
            expect(result).toBeNull();
        });
    });

    describe('deleteItem', () => {
        it('should log deletion attempt', async () => {
            const options = { rootPath: './test-data' };
            const itemType = 'item';
            const languageCode = 'en-us';
            const itemID = 1;

            await storeInterfaceConsole.deleteItem({ options, itemType, languageCode, itemID });

            expect(console.log).toHaveBeenCalledWith(
                expect.stringContaining('Deleting item'),
                expect.stringContaining(itemType),
                expect.stringContaining(languageCode),
                expect.stringContaining(String(itemID))
            );
        });
    });

    describe('clearItems', () => {
        it('should log clearing attempt', async () => {
            await storeInterfaceConsole.clearItems({ options: {} });

            expect(console.log).toHaveBeenCalledWith(
                expect.stringContaining('Clearing all items')
            );
        });
    });

    describe('saveContentItem', () => {
        it('should log content item save attempt', async () => {
            const contentItem = createMockContentItem();
            const languageCode = 'en-us';

            await storeInterfaceConsole.saveContentItem({ contentItem, languageCode });

            expect(console.log).toHaveBeenCalledWith(
                expect.stringContaining('Saving content item'),
                expect.stringContaining(String(contentItem.contentID)),
                expect.stringContaining(languageCode)
            );
        });
    });

    describe('savePageItem', () => {
        it('should log page item save attempt', async () => {
            const pageItem = { pageID: 1, properties: { title: 'Test Page' } };
            const languageCode = 'en-us';

            await storeInterfaceConsole.savePageItem({ pageItem, languageCode });

            expect(console.log).toHaveBeenCalledWith(
                expect.stringContaining('Saving page item'),
                expect.stringContaining(String(pageItem.pageID)),
                expect.stringContaining(languageCode)
            );
        });
    });
}); 