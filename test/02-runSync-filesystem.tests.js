import chai from 'chai'
const assert = chai.assert;
const expect = chai.expect;

import { createSyncClient } from './_syncClients.config'
import fs from 'fs';
import path from 'path';

const languageCode = 'en-us'

describe('runSync with filesystem store:', async function() {
    const rootPath = path.join(process.cwd(), '.agility-files-test');
    let syncClient;

    beforeEach(async function() {
        // Clean up any existing test files
        if (fs.existsSync(rootPath)) {
            fs.rmSync(rootPath, { recursive: true, force: true });
        }
        
        // Create a new sync client with filesystem store
        syncClient = createSyncClient({
            rootPath,
            pretty: true
        });
    });

    afterEach(async function() {
        // Clean up test files after each test
        if (fs.existsSync(rootPath)) {
            fs.rmSync(rootPath, { recursive: true, force: true });
        }
    });

    it('should run sync method using the filesystem store', async function() {
        const result = await syncClient.runSync({
            languageCode
        });

        assert.isTrue(result.success, 'sync completed successfully');
        
        // Verify files were created
        assert.isTrue(fs.existsSync(path.join(rootPath, languageCode, 'state', 'state.json')), 'sync state file exists');
        assert.isTrue(fs.existsSync(path.join(rootPath, languageCode, 'sitemap', 'website.json')), 'sitemap file exists');
        assert.isTrue(fs.existsSync(path.join(rootPath, languageCode, 'nestedsitemap', 'website.json')), 'nested sitemap file exists');
    });

    it('should handle concurrent syncs with the filesystem store', async function() {
        const syncPromises = [
            syncClient.runSync({ languageCode }),
            syncClient.runSync({ languageCode }),
            syncClient.runSync({ languageCode })
        ];

        const results = await Promise.all(syncPromises);
        
        results.forEach((result, index) => {
            assert.isTrue(result.success, `sync ${index + 1} completed successfully`);
        });

        // Verify files were created
        assert.isTrue(fs.existsSync(path.join(rootPath, languageCode, 'state', 'state.json')), 'sync state file exists');
        assert.isTrue(fs.existsSync(path.join(rootPath, languageCode, 'sitemap', 'website.json')), 'sitemap file exists');
        assert.isTrue(fs.existsSync(path.join(rootPath, languageCode, 'nestedsitemap', 'website.json')), 'nested sitemap file exists');
    });

    it('should handle syncs with delay between them', async function() {
        const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

        const result1 = await syncClient.runSync({ languageCode });
        assert.isTrue(result1.success, 'first sync completed successfully');

        await delay(1500); // Wait 1.5 seconds

        const result2 = await syncClient.runSync({ languageCode });
        assert.isTrue(result2.success, 'second sync completed successfully');

        await delay(1500); // Wait 1.5 seconds

        const result3 = await syncClient.runSync({ languageCode });
        assert.isTrue(result3.success, 'third sync completed successfully');

        // Verify files were created
        assert.isTrue(fs.existsSync(path.join(rootPath, languageCode, 'state', 'state.json')), 'sync state file exists');
        assert.isTrue(fs.existsSync(path.join(rootPath, languageCode, 'sitemap', 'website.json')), 'sitemap file exists');
        assert.isTrue(fs.existsSync(path.join(rootPath, languageCode, 'nestedsitemap', 'website.json')), 'nested sitemap file exists');
    });

    it('should properly handle content items in the filesystem store', async function() {
        await syncClient.runSync({ languageCode });

        // Verify content items were saved
        const contentDir = path.join(rootPath, languageCode, 'item');
        assert.isTrue(fs.existsSync(contentDir), 'content items directory exists');

        const contentFiles = fs.readdirSync(contentDir);
        assert.isAtLeast(contentFiles.length, 1, 'at least one content item was saved');

        // Verify content list was created
        const listDir = path.join(rootPath, languageCode, 'list');
        assert.isTrue(fs.existsSync(listDir), 'content lists directory exists');

        const listFiles = fs.readdirSync(listDir);
        assert.isAtLeast(listFiles.length, 1, 'at least one content list was saved');
    });
}); 