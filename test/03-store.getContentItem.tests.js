import chai from 'chai'
const assert = chai.assert;
const expect = chai.expect;

import { createSyncClient, createPreviewSyncClient } from './_syncClients.config'
import { skipIfNoCredentials } from './_skipIfNoCredentials'

/*
    This file contains static references to content from the instance configured in the apiClient.config file.
*/

const languageCode = 'en-us'

describe('store.getContentItem:', async function () {

    before(skipIfNoCredentials());

    it('should be able to retrieve an item from the store', async function () {
        var syncClient = createSyncClient();

        const contentItem = await syncClient.store.getContentItem({
            contentID: 22,
            languageCode: languageCode,
        })

        assert.strictEqual(contentItem.contentID, 22, 'retrieved the content item we asked for')
    })

});

