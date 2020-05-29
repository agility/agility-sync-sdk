import chai from 'chai'
const assert = chai.assert;
const expect = chai.expect;

import { createSyncClient, createSyncClientUsingConsoleStore, createPreviewSyncClient } from './_syncClients.config'

/*
    This file contains static references to content from the instance configured in the apiClient.config file.
*/

//this file should always run first in the tests...

describe('runSync:', async function() {


	this.timeout('120s');

    it('should run sync method using the filesystem', async function() {
        var sync = createSyncClient();
        await sync.runSync();
    })

});

describe('runSync:', async function() {

	this.timeout('120s');

    it('should run sync method using the console store', async function() {
        var sync = createSyncClientUsingConsoleStore();
        await sync.runSync();
    })

});

