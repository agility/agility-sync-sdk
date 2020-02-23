import chai from 'chai'
const assert = chai.assert;
const expect = chai.expect;

import { createSyncWorker, createPreviewSyncWorker } from './_syncWorkers.config'

/* 
    This file contains static references to content from the instance configured in the apiClient.config file.
*/

describe('getContentItem:', function() {

    this.timeout('120s');

    it('should run sync method', async function() {
        var sw = createSyncWorker();

        await sw.runSync();

    })
    
    
    
    
    
    

});

