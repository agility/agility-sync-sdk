//import agilitySync from '../dist/agility-sync-sdk.node'
import * as agilitySync from '../src/sync-client'

import storeInterfaceConsole from '../src/store-interface-console'
import dotenv from 'dotenv'
import path from 'path'

// Load .env.test for local dev; in CI the values come from the environment directly.
dotenv.config({ path: path.resolve(__dirname, '..', '.env.test') })

const guid = process.env.AGILITY_TEST_GUID
const apiKeyFetch = process.env.AGILITY_TEST_API_KEY_FETCH
const apiKeyPreview = process.env.AGILITY_TEST_API_KEY_PREVIEW
const baseUrl = process.env.AGILITY_TEST_BASE_URL

// If credentials aren't set (e.g. fork PR with no secrets), live-API tests should skip.
const hasLiveCredentials = Boolean(guid && apiKeyFetch && apiKeyPreview && baseUrl)


function createSyncClient() {
    var syncClient = agilitySync.getSyncClient({
        guid: guid,
        apiKey: apiKeyFetch,
        isPreview: false,
        logLevel: 'info',
        channels: ['website'],
        languages: ['en-us'],
        baseUrl: baseUrl
    });

    return syncClient;
}

function createSyncClientUsingConsoleStore() {
    var syncClient = agilitySync.getSyncClient({
        guid: guid,
        apiKey: apiKeyFetch,
        isPreview: false,
        channels: ['website'],
        languages: ['en-us'],
        store: {
            interface: storeInterfaceConsole,
            options: {}
        },
        baseUrl: baseUrl
    });
    return syncClient;
}


function createPreviewSyncClient() {
    var syncClient = agilitySync.getSyncClient({
        guid: guid,
        apiKey: apiKeyPreview,
        isPreview: true,
        channels: ['website'],
        languages: ['en-us'],
        baseUrl: baseUrl
    });
    return syncClient;
}

export {
    createSyncClient,
    createSyncClientUsingConsoleStore,
    createPreviewSyncClient,
    hasLiveCredentials
}
