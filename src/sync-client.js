import agility from '@agility/content-fetch'
import syncContentInternal from './methods/syncContent'
import clearSyncInternal from './methods/clearSync'
import syncPagesInternal from './methods/syncPages'
import runSyncInternal from './methods/runSync'

import { StoreInterface } from './store-interface'
import storeInterfaceFileSystem from './store-interface-filesystem'

function getSyncClient(userConfig) {
    validateConfigParams(userConfig);
    return createSyncClient(userConfig);
}

function validateConfigParams(configParams) {

    if (!configParams.guid || configParams.guid.length == 0) {
        throw new TypeError('You must provide an guid.');
    } else if (!configParams.apiKey || configParams.apiKey.length == 0) {
        throw new TypeError('You must provide an access token.');
    } else {
        return;
    }
}

const defaultConfig = {
    region: null,
    baseUrl: null,
    isPreview: false,
    guid: null,
    apiKey: null,
    languages: [],
    channels: [],
    debug: false,
    logLevel: 'warning',
    store: {
        interface: storeInterfaceFileSystem,
        options: {
            rootPath: '.agility-files'
        }
    }
};

function createSyncClient(userConfig) {
    let config = {
        ...defaultConfig,
        ...userConfig

    }

    process.env.AGILITY_LOG_LEVEL = config.logLevel;

    const agilityClient = agility.getApi({
        guid: config.guid,
        apiKey: config.apiKey,
        isPreview: config.isPreview,
        debug: config.debug,
        baseUrl: config.baseUrl,
        region: config.region
    });


    //resolve the dependancy for store interface implementation (uses file-system by default)
    let store = config.store.interface;

    //set the sync storage interface provider, it will also validate it
    const storeInterface = new StoreInterface(store, config.store.options);


    const syncPages = (languageCode, token) => syncPagesInternal(languageCode, token, storeInterface, agilityClient);

    const syncContent = (languageCode, token) => syncContentInternal(languageCode, token, storeInterface, agilityClient);

    return {
        config,
        agilityClient,
        syncContent,
        syncPages,
        clearSync: () => clearSyncInternal(storeInterface),
        runSync: () => runSyncInternal(config, agilityClient, storeInterface, syncContent, syncPages),
        store: storeInterface
    }
}

export { getSyncClient }
export default { getSyncClient }