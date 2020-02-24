import chai from 'chai'
const assert = chai.assert;
const expect = chai.expect;

import { createSyncClient, createPreviewSyncClient } from './_syncClients.config'

/* 
    This file contains static references to content from the instance configured in the apiClient.config file.
*/

const languageCode = 'en-us'

describe('store.getContentList:', async function() {

    it('should be able to retrieve an item from the store', async function() {
        var syncClient = createSyncClient();

        const contentList = await syncClient.store.getContentList({
            referenceName: 'posts',
            languageCode: languageCode
        })
        assert.strictEqual(contentList[0].contentID, 15, 'retrieved the content list we asked for')
    })
});

