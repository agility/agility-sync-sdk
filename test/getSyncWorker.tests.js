import chai from 'chai'
const assert = chai.assert;

import agilitySync from '../src/sync-worker'


//This is a synchronous test
describe('getSyncWorker:', function() {

    this.timeout('120s');
    
    it('should return a sync worker object with required params', function(done) {
        const syncWorker = agilitySync.getSyncWorker({
            guid: 'some-guid',
            apiKey: 'some-access-token'
        });
        assert.strictEqual(typeof(syncWorker), "object");
        done();
    })

    it('should return an sync worker object in preview mode', function(done) {
        const syncWorker = agilitySync.getSyncWorker({
            guid: 'some-guid',
            apiKey: 'some-access-token',
            isPreview: true
        });
        assert.strictEqual(syncWorker.config.isPreview, true);
        done();
    })
 
});