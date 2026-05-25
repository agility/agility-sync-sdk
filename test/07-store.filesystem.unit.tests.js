import chai from 'chai'
import fs from 'fs'
import os from 'os'
import path from 'path'

import storeInterfaceFileSystem from '../src/store-interface-filesystem'

const assert = chai.assert

// Pure unit tests for the filesystem store — no network, no live API.
// Each test gets its own temp rootPath so cases are isolated.

const makeTmpRoot = () => fs.mkdtempSync(path.join(os.tmpdir(), 'agility-sync-test-'))
const cleanup = (root) => fs.rmSync(root, { recursive: true, force: true })

const languageCode = 'en-us'
const itemType = 'item'

describe('store-interface-filesystem (unit):', function () {

    let options

    beforeEach(function () {
        options = { rootPath: makeTmpRoot() }
    })

    afterEach(function () {
        cleanup(options.rootPath)
    })

    describe('saveItem / getItem:', function () {

        it('writes JSON to disk and reads it back', async function () {
            const item = { contentID: 1, name: 'hello' }
            await storeInterfaceFileSystem.saveItem({ options, item, itemType, languageCode, itemID: 1 })

            const got = await storeInterfaceFileSystem.getItem({ options, itemType, languageCode, itemID: 1 })
            assert.deepEqual(got, item)
        })

        it('creates nested directories as needed', async function () {
            const item = { contentID: 7 }
            await storeInterfaceFileSystem.saveItem({ options, item, itemType, languageCode, itemID: 7 })

            const expectedDir = path.join(options.rootPath, languageCode, itemType)
            assert.isTrue(fs.existsSync(expectedDir), 'nested dir was created')
        })

        it('overwrites existing items', async function () {
            await storeInterfaceFileSystem.saveItem({ options, item: { contentID: 1, v: 'a' }, itemType, languageCode, itemID: 1 })
            await storeInterfaceFileSystem.saveItem({ options, item: { contentID: 1, v: 'b' }, itemType, languageCode, itemID: 1 })

            const got = await storeInterfaceFileSystem.getItem({ options, itemType, languageCode, itemID: 1 })
            assert.strictEqual(got.v, 'b')
        })

        it('getItem returns null when the file does not exist (no throw)', async function () {
            const got = await storeInterfaceFileSystem.getItem({ options, itemType, languageCode, itemID: 'never-saved' })
            assert.isNull(got)
        })

        it('getItem propagates non-ENOENT errors', async function () {
            // Create a directory where a file is expected — readFile will fail with EISDIR, not ENOENT
            const filePath = path.join(options.rootPath, languageCode, itemType, '999.json')
            fs.mkdirSync(path.dirname(filePath), { recursive: true })
            fs.mkdirSync(filePath) // create a directory where the JSON file should be

            let threw = false
            try {
                await storeInterfaceFileSystem.getItem({ options, itemType, languageCode, itemID: 999 })
            } catch (err) {
                threw = true
                assert.notStrictEqual(err.code, 'ENOENT', 'should not swallow non-ENOENT errors')
            }
            assert.isTrue(threw, 'expected getItem to throw on non-ENOENT failure')
        })
    })

    describe('deleteItem:', function () {

        it('removes the file', async function () {
            await storeInterfaceFileSystem.saveItem({ options, item: { contentID: 1 }, itemType, languageCode, itemID: 1 })
            await storeInterfaceFileSystem.deleteItem({ options, itemType, languageCode, itemID: 1 })

            const got = await storeInterfaceFileSystem.getItem({ options, itemType, languageCode, itemID: 1 })
            assert.isNull(got)
        })

        it('is idempotent — does not throw on missing file', async function () {
            await storeInterfaceFileSystem.deleteItem({ options, itemType, languageCode, itemID: 'never-existed' })
            // If we got here without throwing, the test passes.
        })
    })

    describe('clearItems:', function () {

        it('removes the root path', async function () {
            await storeInterfaceFileSystem.saveItem({ options, item: { contentID: 1 }, itemType, languageCode, itemID: 1 })
            assert.isTrue(fs.existsSync(options.rootPath))

            await storeInterfaceFileSystem.clearItems({ options })
            assert.isFalse(fs.existsSync(options.rootPath))
        })

        it('is idempotent — does not throw when root path does not exist', async function () {
            // Wipe the tmpdir created in beforeEach so the directory is gone before clearItems runs.
            cleanup(options.rootPath)
            assert.isFalse(fs.existsSync(options.rootPath))

            await storeInterfaceFileSystem.clearItems({ options })
            // If we got here without throwing, the test passes.
        })
    })

    describe('mergeItemToList:', function () {

        const referenceName = 'posts'
        const definitionName = 'Post'

        const makeItem = (contentID, state = 2) => ({
            contentID,
            properties: { state, referenceName, definitionName }
        })

        it('initializes a new list with the first item', async function () {
            await storeInterfaceFileSystem.mergeItemToList({
                options, item: makeItem(1), languageCode, itemID: 1, referenceName, definitionName
            })

            const list = await storeInterfaceFileSystem.getItem({ options, itemType: 'list', languageCode, itemID: referenceName })
            assert.lengthOf(list, 1)
            assert.strictEqual(list[0].contentID, 1)
        })

        it('appends new items to an existing list', async function () {
            await storeInterfaceFileSystem.mergeItemToList({ options, item: makeItem(1), languageCode, itemID: 1, referenceName, definitionName })
            await storeInterfaceFileSystem.mergeItemToList({ options, item: makeItem(2), languageCode, itemID: 2, referenceName, definitionName })

            const list = await storeInterfaceFileSystem.getItem({ options, itemType: 'list', languageCode, itemID: referenceName })
            assert.lengthOf(list, 2)
            assert.deepEqual(list.map(i => i.contentID), [1, 2])
        })

        it('replaces an existing item with the same contentID', async function () {
            const first = makeItem(1)
            first.properties.title = 'original'
            await storeInterfaceFileSystem.mergeItemToList({ options, item: first, languageCode, itemID: 1, referenceName, definitionName })

            const updated = makeItem(1)
            updated.properties.title = 'updated'
            await storeInterfaceFileSystem.mergeItemToList({ options, item: updated, languageCode, itemID: 1, referenceName, definitionName })

            const list = await storeInterfaceFileSystem.getItem({ options, itemType: 'list', languageCode, itemID: referenceName })
            assert.lengthOf(list, 1)
            assert.strictEqual(list[0].properties.title, 'updated')
        })

        it('removes an item when state === 3 (deleted)', async function () {
            await storeInterfaceFileSystem.mergeItemToList({ options, item: makeItem(1), languageCode, itemID: 1, referenceName, definitionName })
            await storeInterfaceFileSystem.mergeItemToList({ options, item: makeItem(2), languageCode, itemID: 2, referenceName, definitionName })

            await storeInterfaceFileSystem.mergeItemToList({
                options, item: makeItem(1, 3), languageCode, itemID: 1, referenceName, definitionName
            })

            const list = await storeInterfaceFileSystem.getItem({ options, itemType: 'list', languageCode, itemID: referenceName })
            assert.lengthOf(list, 1)
            assert.strictEqual(list[0].contentID, 2)
        })

        it('is a no-op when removing an item that is not in the list', async function () {
            await storeInterfaceFileSystem.mergeItemToList({ options, item: makeItem(1), languageCode, itemID: 1, referenceName, definitionName })
            await storeInterfaceFileSystem.mergeItemToList({
                options, item: makeItem(99, 3), languageCode, itemID: 99, referenceName, definitionName
            })

            const list = await storeInterfaceFileSystem.getItem({ options, itemType: 'list', languageCode, itemID: referenceName })
            assert.lengthOf(list, 1)
            assert.strictEqual(list[0].contentID, 1)
        })
    })

    describe('path sanitization (getFilePath via saveItem):', function () {

        // The store strips dangerous chars from string itemIDs to keep writes inside rootPath.
        // We assert the resulting file lives under the configured rootPath and that the
        // unsanitized payload was never written outside.

        it('keeps writes inside rootPath even with traversal-like itemIDs', async function () {
            const evilItemID = '../../etc/passwd'
            await storeInterfaceFileSystem.saveItem({
                options, item: { contentID: 'evil' }, itemType, languageCode, itemID: evilItemID
            })

            // The stripped name is `etcpasswd` (slashes, dots, etc. removed).
            const safePath = path.join(options.rootPath, languageCode, itemType, 'etcpasswd.json')
            assert.isTrue(fs.existsSync(safePath), 'file landed inside rootPath under a sanitized name')

            // Verify nothing was written above rootPath via the raw itemID.
            const wouldBeAbove = path.join(options.rootPath, '..', '..', 'etc', 'passwd.json')
            assert.isFalse(fs.existsSync(wouldBeAbove), 'no file was written outside rootPath')
        })

        it('strips other special chars (spaces are kept, alphanumerics are kept)', async function () {
            // The regex strips: backtick, !@#$%^&*()+=[]{};':"\|,.<>/?~
            // It does NOT strip: spaces, hyphens, underscores, alphanumerics.
            const itemID = 'foo!@#bar'
            await storeInterfaceFileSystem.saveItem({
                options, item: { contentID: itemID }, itemType, languageCode, itemID
            })

            const expectedPath = path.join(options.rootPath, languageCode, itemType, 'foobar.json')
            assert.isTrue(fs.existsSync(expectedPath), 'special chars stripped from filename')
        })

        it('does not sanitize numeric itemIDs (they bypass the regex)', async function () {
            await storeInterfaceFileSystem.saveItem({
                options, item: { contentID: 42 }, itemType, languageCode, itemID: 42
            })

            const expectedPath = path.join(options.rootPath, languageCode, itemType, '42.json')
            assert.isTrue(fs.existsSync(expectedPath))
        })
    })
})
