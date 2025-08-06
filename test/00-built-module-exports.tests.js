import chai from 'chai'
const assert = chai.assert;

// Test the built dist module (what gets published to npm)
const path = require('path');
const fs = require('fs');

//This tests the actual built module that gets published
describe('Built Module Export Compatibility:', function() {

    this.timeout('30s');
    
    let builtModulePath;

    before(function() {
        builtModulePath = path.resolve(__dirname, '../dist/agility-sync-sdk.node.js');
        
        // Check if the built file exists
        if (!fs.existsSync(builtModulePath)) {
            throw new Error('Built module not found. Run "npm run build" first.');
        }
    });
    
    it('should support CommonJS require() import', function(done) {
        // Clear require cache to ensure fresh import
        delete require.cache[builtModulePath];
        
        const contentSync = require(builtModulePath);
        assert.strictEqual(typeof contentSync, 'function', 'CommonJS import should return a function');
        done();
    });

    it('should support customer pattern: require().default.getSyncClient', function(done) {
        // This is the exact pattern that was failing: content_sync_1.default.getSyncClient
        delete require.cache[builtModulePath];
        
        const contentSync = require(builtModulePath);
        
        assert.strictEqual(typeof contentSync.default, 'object', 'default should be an object');
        assert.strictEqual(typeof contentSync.default.getSyncClient, 'function', 'default.getSyncClient should be a function');
        
        // Test that it actually works
        const syncClient = contentSync.default.getSyncClient({
            guid: 'test-guid',
            apiKey: 'test-key'
        });
        
        assert.strictEqual(typeof syncClient, 'object', 'Should return sync client object');
        assert.strictEqual(typeof syncClient.syncContent, 'function', 'Should have syncContent method');
        assert.strictEqual(typeof syncClient.syncPages, 'function', 'Should have syncPages method');
        assert.strictEqual(typeof syncClient.runSync, 'function', 'Should have runSync method');
        assert.strictEqual(typeof syncClient.clearSync, 'function', 'Should have clearSync method');
        
        done();
    });

    it('should support alternative patterns for flexibility', function(done) {
        delete require.cache[builtModulePath];
        
        const contentSync = require(builtModulePath);
        const testConfig = { guid: 'test-guid', apiKey: 'test-key' };
        
        // Test direct function call
        const client1 = contentSync(testConfig);
        assert.strictEqual(typeof client1, 'object', 'Direct function call should work');
        
        // Test .getSyncClient property
        const client2 = contentSync.getSyncClient(testConfig);
        assert.strictEqual(typeof client2, 'object', 'getSyncClient property should work');
        
        done();
    });

    it('should maintain consistency across all import patterns', function(done) {
        delete require.cache[builtModulePath];
        
        const contentSync = require(builtModulePath);
        const testConfig = { guid: 'test-guid', apiKey: 'test-key' };
        
        const client1 = contentSync(testConfig);
        const client2 = contentSync.getSyncClient(testConfig);
        const client3 = contentSync.default.getSyncClient(testConfig);
        
        // All should have the same structure
        const expectedProperties = ['config', 'agilityClient', 'syncContent', 'syncPages', 'clearSync', 'runSync', 'store'];
        
        expectedProperties.forEach(prop => {
            assert.property(client1, prop, `client1 should have ${prop}`);
            assert.property(client2, prop, `client2 should have ${prop}`);
            assert.property(client3, prop, `client3 should have ${prop}`);
            
            // Types should match
            assert.strictEqual(typeof client1[prop], typeof client2[prop], `${prop} types should match between client1 and client2`);
            assert.strictEqual(typeof client2[prop], typeof client3[prop], `${prop} types should match between client2 and client3`);
        });
        
        done();
    });
});