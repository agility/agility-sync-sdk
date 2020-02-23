import agility from '@agility/content-fetch'
import syncContent from './methods/syncContent'
import clearSync from './methods/clearSync'
import syncPages from './methods/syncPages'
import runSync from './methods/runSync'

//uses filesystem by default
import syncStorage from './plugins/agility-sync-filesystem'
import syncStorageInterface from './sync-storage-interface'

function getSyncWorker (userConfig) {
    validateConfigParams(userConfig);
    return createSyncWorker(userConfig);
}

function validateConfigParams(configParams) {

    if(!configParams.guid || configParams.guid.length == 0) {
        throw new TypeError('You must provide an guid.');
    } else if(!configParams.apiKey || configParams.apiKey.length == 0) {
        throw new TypeError('You must provide an access token.');
    } else {
        return;
    }
}

const defaultConfig = {
    baseUrl: null,
    isPreview: false,
    guid: null,
    apiKey: null,
    languages: [],
    channels: [],
    debug: false,
    syncStorage: syncStorage

};

function createSyncWorker(userConfig) {
    let config = {
        ...defaultConfig,
        ...userConfig
        
    }

    const agilityClient = agility.getApi({
        guid: config.guid,
        apiKey: config.apiKey,
        isPreview: config.isPreview,
        debug: config.debug,
        baseUrl: config.baseUrl
    });

    //validate we have an impementation of the syncStorage available
    validateSyncStorageAccess(config.syncStorage)

    //set the sync storage interface provider
    syncStorageInterface.setSyncStorage(config.syncStorage);
    
    return {
        config,
        agilityClient,
        syncContent,
        syncPages,
        clearSync,
        runSync,
        syncStorageInterface
    }
}

function validateSyncStorageAccess (syncStorage) {
	if (!syncStorage.clearItems
		|| !syncStorage.getItem
		|| !syncStorage.saveItem) {
		logError("The sync storage access provider specified does not implement the clearItems, getItem, or saveItem method.");
		return;
	}
	return;
}


export default { getSyncWorker }