import chai from 'chai'
const assert = chai.assert;

import * as agilitySync from '../src/sync-client'
import syncClientDefault from '../src/sync-client'
import { createSyncClientUsingConsoleStore } from './_syncClients.config'


//This is a synchronous test
describe('getSyncClient:', function() {

    this.timeout('120s');
    
    it('should return a sync worker object with required params', function(done) {
        const syncClient = agilitySync.getSyncClient({
            guid: 'some-guid',
            apiKey: 'some-access-token'
        });
        assert.strictEqual(typeof(syncClient), "object");
        done();
    })

    it('should return an sync worker object in preview mode', function(done) {
        const syncClient = agilitySync.getSyncClient({
            guid: 'some-guid',
            apiKey: 'some-access-token',
            isPreview: true
        });

        assert.strictEqual(syncClient.config.isPreview, true);
        done();
    })

    it('should validate a valid external store interface (console)', function(done) {
        const syncClient = createSyncClientUsingConsoleStore()    
        done();
    })

    // Export compatibility tests to ensure multiple import patterns work
    describe('Export Compatibility:', function() {
        
        it('should support named import (getSyncClient)', function(done) {
            assert.strictEqual(typeof agilitySync.getSyncClient, 'function', 'Named import should be a function');
            
            const syncClient = agilitySync.getSyncClient({
                guid: 'test-guid',
                apiKey: 'test-key'
            });
            assert.strictEqual(typeof syncClient, 'object', 'Should return sync client object');
            done();
        })

        it('should support default import as function', function(done) {
            assert.strictEqual(typeof syncClientDefault, 'function', 'Default import should be a function');
            
            const syncClient = syncClientDefault({
                guid: 'test-guid',
                apiKey: 'test-key'
            });
            assert.strictEqual(typeof syncClient, 'object', 'Should return sync client object');
            done();
        })

        it('should support default import with getSyncClient property', function(done) {
            assert.strictEqual(typeof syncClientDefault.getSyncClient, 'function', 'Default.getSyncClient should be a function');
            
            const syncClient = syncClientDefault.getSyncClient({
                guid: 'test-guid',
                apiKey: 'test-key'
            });
            assert.strictEqual(typeof syncClient, 'object', 'Should return sync client object');
            done();
        })

        it('should support CommonJS-style default.getSyncClient pattern', function(done) {
            // This tests the pattern that was failing for the customer: content_sync_1.default.getSyncClient
            assert.strictEqual(typeof syncClientDefault.default, 'object', 'Default.default should be an object');
            assert.strictEqual(typeof syncClientDefault.default.getSyncClient, 'function', 'Default.default.getSyncClient should be a function');
            
            const syncClient = syncClientDefault.default.getSyncClient({
                guid: 'test-guid',
                apiKey: 'test-key'
            });
            assert.strictEqual(typeof syncClient, 'object', 'Should return sync client object');
            done();
        })

        it('should ensure all import patterns return equivalent sync clients', function(done) {
            const config = { guid: 'test-guid', apiKey: 'test-key' };
            
            const client1 = agilitySync.getSyncClient(config);
            const client2 = syncClientDefault(config);
            const client3 = syncClientDefault.getSyncClient(config);
            const client4 = syncClientDefault.default.getSyncClient(config);
            
            // All should have the same structure
            assert.strictEqual(typeof client1, 'object');
            assert.strictEqual(typeof client2, 'object');
            assert.strictEqual(typeof client3, 'object');
            assert.strictEqual(typeof client4, 'object');
            
            // All should have the same methods
            const expectedMethods = ['syncContent', 'syncPages', 'clearSync', 'runSync'];
            expectedMethods.forEach(method => {
                assert.strictEqual(typeof client1[method], 'function', `client1.${method} should be a function`);
                assert.strictEqual(typeof client2[method], 'function', `client2.${method} should be a function`);
                assert.strictEqual(typeof client3[method], 'function', `client3.${method} should be a function`);
                assert.strictEqual(typeof client4[method], 'function', `client4.${method} should be a function`);
            });
            
            done();
        })
    })
 
});