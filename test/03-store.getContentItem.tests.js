import chai from 'chai'
const assert = chai.assert;
const expect = chai.expect;

import { createSyncClient, createPreviewSyncClient } from './_syncClients.config'

/*
    This file contains static references to content from the instance configured in the apiClient.config file.
*/

const languageCode = 'en-us'

describe('store.getContentItem:', async function() {

    it('should be able to retrieve an item from the store', async function() {
        var syncClient = createSyncClient();

        const contentItem = await syncClient.store.getContentItem({
            contentID: 21,
            languageCode: languageCode,

        })

        assert.strictEqual(contentItem.contentID, 21, 'retrieved the content item we asked for')
    })

	it('should be able to retrieve and expand item from the store', async function() {
        var syncClient = createSyncClient();

        const contentItem = await syncClient.store.getContentItem({
            contentID: 27,
            languageCode: languageCode
        })

        assert.strictEqual(contentItem.contentID, 27, 'retrieved the content item we asked for')
		assert.exists(contentItem.fields.category.fields, "retrieved the expanded category field")
    })
});

