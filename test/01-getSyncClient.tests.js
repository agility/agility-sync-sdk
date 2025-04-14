import chai from 'chai'
const assert = chai.assert;
const expect = chai.expect;

import agilitySync from '../src/sync-client'
import { createSyncClientUsingConsoleStore, createSyncClient } from './_syncClients.config'


//This is a synchronous test
describe('getSyncClient:', function() {

    it('should return a sync worker object with required params', function() {
        var syncClient = createSyncClient();
        console.log('Sync Client Object:', JSON.stringify(syncClient, null, 2));
        console.log('Store Methods Available:', Object.keys(syncClient.store));
        
        assert.isObject(syncClient);
        assert.isObject(syncClient.store);
        assert.isFunction(syncClient.syncContent);
        assert.isFunction(syncClient.syncPages);
        
        // Verify store methods exist
        assert.isFunction(syncClient.store.clearItems);
        assert.isFunction(syncClient.store.deleteItem);
        assert.isFunction(syncClient.store.getItem);
        assert.isFunction(syncClient.store.saveItem);
        assert.isFunction(syncClient.store.setOptions);
    })

    it('should return an sync worker object in preview mode', async function() {
        const syncClient = agilitySync.getSyncClient({
            guid: 'some-guid',
            apiKey: 'some-access-token',
            isPreview: true
        });

        console.log('Preview Mode Sync Client Config:', JSON.stringify(syncClient.config, null, 2));
        console.log('Preview Mode Store Methods:', Object.keys(syncClient.store));
        assert.strictEqual(syncClient.config.isPreview, true);
    })

    it('should validate a valid external store interface (console)', async function() {
        const syncClient = createSyncClientUsingConsoleStore();
        console.log('Console Store Sync Client:', JSON.stringify(syncClient, null, 2));
        console.log('Console Store Methods:', Object.keys(syncClient.store));
        
        assert.isObject(syncClient);
        assert.isObject(syncClient.store);
        
        // Verify console store methods exist
        assert.isFunction(syncClient.store.clearItems);
        assert.isFunction(syncClient.store.deleteItem);
        assert.isFunction(syncClient.store.getItem);
        assert.isFunction(syncClient.store.saveItem);
        assert.isFunction(syncClient.store.setOptions);
    })
 
});