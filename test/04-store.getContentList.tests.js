import chai from 'chai'
const assert = chai.assert;
const expect = chai.expect;

import { createSyncClient, createPreviewSyncClient } from './_syncClients.config'

/*
    This file contains static references to content from the instance configured in the apiClient.config file.
*/

const languageCode = 'en-us'

describe('store.getContentList:', async function () {

    it('should be able to retrieve a list from the store', async function () {
        var syncClient = createSyncClient();

        const contentList = await syncClient.store.getContentList({
            referenceName: 'posts',
            languageCode: languageCode
        })

        assert.strictEqual(contentList[0].properties.referenceName, "posts", 'retrieved the content list we asked for')
    })


    it('should be able to expand and page a list from the store', async function () {
        var syncClient = createSyncClient();

        const contentList = await syncClient.store.getContentList({
            referenceName: 'posts',
            languageCode: languageCode,
            depth: 2,
            take: 1,
            skip: 1,
            expandAllContentLinks: true
        })

        assert.isAtLeast(contentList.totalCount, 1, 'retrieved the totalCount of the content list we asked for')
        assert.exists(contentList.items, 'retrieved the items of the content list we asked for')
        assert.exists(contentList.items[0].fields, 'retrieved the item of the content list we asked for')
        assert.strictEqual(contentList.items.length, 1, 'retrieved only the item of the content list we asked for')

    })


    it('should be able to expand a nested list with expandAllContentLinks', async function () {
        var syncClient = createSyncClient();

        const contentList = await syncClient.store.getContentList({
            referenceName: 'listwithnestedcontentlink',
            languageCode: languageCode,
            depth: 10,
            take: 50,
            skip: 0,
            expandAllContentLinks: true
        })

        assert.isAtLeast(contentList.totalCount, 1, 'retrieved the totalCount of the content list we asked for')
        assert.exists(contentList.items, 'retrieved the items of the content list we asked for')
        assert.exists(contentList.items[0].fields, 'retrieved the item of the content list we asked for')
        assert.isAtLeast(contentList.items[0].fields.posts.length, 1, 'expanded the linked cotnent of the posts field')


    })
});

