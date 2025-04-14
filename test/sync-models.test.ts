import { describe, it, expect, vi, beforeEach } from 'vitest';
import syncModels from '../src/methods/syncModels.ts';
import { createMockSyncContext } from './utils.ts';
import { ContentDefinition, ContentDefinitionList } from '../src/types/content-definition.ts';

describe('syncModels', () => {
    const mockContext = createMockSyncContext();
    const languageCode = 'en-us';

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should sync content models successfully', async () => {
        const mockDefinitionList: ContentDefinitionList = {
            items: [
                {
                    contentID: 1,
                    name: 'Test Model',
                    referenceName: 'test-model',
                    properties: {},
                },
            ],
            totalCount: 1,
        };

        const mockFullDefinition: ContentDefinition = {
            contentID: 1,
            name: 'Test Model',
            referenceName: 'test-model',
            properties: {
                fields: [],
            },
        };

        vi.mocked(mockContext.agilityClient.management.getContentDefinitionList)
            .mockResolvedValue(mockDefinitionList);
        vi.mocked(mockContext.agilityClient.management.getContentDefinition)
            .mockResolvedValue(mockFullDefinition);

        await syncModels.call(mockContext, languageCode);

        expect(mockContext.agilityClient.management.getContentDefinitionList).toHaveBeenCalled();
        expect(mockContext.agilityClient.management.getContentDefinition).toHaveBeenCalledWith({
            referenceName: 'test-model',
        });
        expect(mockContext.store.saveItem).toHaveBeenCalledWith({
            options: {},
            item: mockFullDefinition,
            itemType: 'model',
            languageCode,
            itemID: 'test-model',
        });
    });

    it('should handle empty definition list', async () => {
        const mockDefinitionList: ContentDefinitionList = {
            items: [],
            totalCount: 0,
        };

        vi.mocked(mockContext.agilityClient.management.getContentDefinitionList)
            .mockResolvedValue(mockDefinitionList);

        await syncModels.call(mockContext, languageCode);

        expect(mockContext.agilityClient.management.getContentDefinitionList).toHaveBeenCalled();
        expect(mockContext.agilityClient.management.getContentDefinition).not.toHaveBeenCalled();
        expect(mockContext.store.saveItem).not.toHaveBeenCalled();
    });

    it('should handle empty API response', async () => {
        vi.mocked(mockContext.agilityClient.management.getContentDefinitionList)
            .mockResolvedValue(null as any);

        await syncModels.call(mockContext, languageCode);

        expect(mockContext.agilityClient.management.getContentDefinitionList).toHaveBeenCalled();
        expect(mockContext.agilityClient.management.getContentDefinition).not.toHaveBeenCalled();
        expect(mockContext.store.saveItem).not.toHaveBeenCalled();
    });

    it('should handle error when fetching definition list', async () => {
        vi.mocked(mockContext.agilityClient.management.getContentDefinitionList)
            .mockRejectedValue(new Error('API Error'));

        await syncModels.call(mockContext, languageCode);

        expect(mockContext.agilityClient.management.getContentDefinitionList).toHaveBeenCalled();
        expect(mockContext.agilityClient.management.getContentDefinition).not.toHaveBeenCalled();
        expect(mockContext.store.saveItem).not.toHaveBeenCalled();
    });

    it('should handle error when fetching individual definition', async () => {
        const mockDefinitionList: ContentDefinitionList = {
            items: [
                {
                    contentID: 1,
                    name: 'Test Model',
                    referenceName: 'test-model',
                    properties: {},
                },
            ],
            totalCount: 1,
        };

        vi.mocked(mockContext.agilityClient.management.getContentDefinitionList)
            .mockResolvedValue(mockDefinitionList);
        vi.mocked(mockContext.agilityClient.management.getContentDefinition)
            .mockRejectedValue(new Error('API Error'));

        await syncModels.call(mockContext, languageCode);

        expect(mockContext.agilityClient.management.getContentDefinitionList).toHaveBeenCalled();
        expect(mockContext.agilityClient.management.getContentDefinition).toHaveBeenCalledWith({
            referenceName: 'test-model',
        });
        expect(mockContext.store.saveItem).not.toHaveBeenCalled();
    });
}); 