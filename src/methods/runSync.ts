import { logInfo, logSuccess, logError, logWarning, sleep } from '../util';
import { 
    StoreInterface, 
    ExtendedStoreInterface, 
    ClientConfig, 
    SyncState, 
    ClientObject, 
    SyncResult,
    AgilityClient,
    SyncContext 
} from '../types/index';

const syncRunner = async function (this: ClientObject): Promise<SyncResult> {
    const storeInterface = this.store;
    let totalItems = 0;
    let processedItems = 0;
    let errors = 0;

    //if a mutex has been defined, call the wait lock
    let lockRelease: (() => void) | null = null;
    if (storeInterface.mutexLock !== undefined) {
        lockRelease = await storeInterface.mutexLock();
    }

    try {
        //actually do the sync
        await sync(this);
        return {
            success: true,
            stats: {
                total: totalItems,
                processed: processedItems,
                errors: errors
            }
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error : new Error('Unknown error occurred during sync'),
            stats: {
                total: totalItems,
                processed: processedItems,
                errors: errors + 1
            }
        };
    } finally {
        if (lockRelease) {
            lockRelease();
        }
    }
};

const sync = async (clientObj: ClientObject) => {
    const languageCodes = clientObj.config.languages;
    const channels = clientObj.config.channels;
    const storeInterface = clientObj.store;

    const modeStr = clientObj.config.isPreview ? "preview" : "live";
    let totalItems = 0;
    let processedItems = 0;
    let errors: string[] = [];

    for (const languageCode of languageCodes) {
        let syncState = await storeInterface.getSyncState(languageCode);

        if (!syncState) syncState = { itemToken: 0, pageToken: 0 };

        const lastSyncDate = syncState.lastSyncDate || null;
        //run at MOST once a second
        if (lastSyncDate && (new Date()).getTime() - new Date(lastSyncDate).getTime() < 1000) {
            //skip sync...
            continue;
        }

        logSuccess(`Starting Sync for ${languageCode} - ${modeStr} mode.`);
        try {
            const newItemToken = await clientObj.syncContent(languageCode, syncState.itemToken);
            const newPageToken = await clientObj.syncPages(languageCode, syncState.pageToken);

            if (newItemToken != syncState.itemToken || newPageToken != syncState.pageToken) {
                //if we sync ANYTHING - pull the new sitemap down
                
                for (const channelName of channels) {
                    logInfo(`Updating Sitemap channel ${channelName} in ${languageCode}`);

                    const sitemap = await clientObj.agilityClient.getSitemapFlat({ channelName, languageCode });
                    console.log('Sitemap:', sitemap);
                    storeInterface.saveSitemap({ sitemap, languageCode, channelName });

                    const sitemapNested = await clientObj.agilityClient.getSitemapNested({ channelName, languageCode });
                    console.log('Sitemap Nested:', sitemapNested);
                    storeInterface.saveSitemapNested({ sitemapNested, languageCode, channelName });
                }
            }

            //save the redirects if they have changed...
            let urlRedirections = await storeInterface.getUrlRedirections({ languageCode });
            let lastAccessDate: Date | null = null;
            if (urlRedirections) lastAccessDate = urlRedirections.lastAccessDate;

            urlRedirections = await clientObj.agilityClient.getUrlRedirections({ lastAccessDate });
            if (urlRedirections && urlRedirections.isUpToDate === false) {
                logInfo(`URL Redirections Updated and Saved`);
                await storeInterface.saveUrlRedirections({ urlRedirections, languageCode });
            }

            syncState.itemToken = newItemToken;
            syncState.pageToken = newPageToken;
            syncState.lastSyncDate = new Date();

            await storeInterface.saveSyncState({ syncState, languageCode });

            logSuccess(`Completed Sync for ${languageCode} - ${modeStr} mode.`);
            processedItems++;
        } catch (error) {
            logError(`Error during sync for ${languageCode}: ${error}`);
            errors.push(`Error during sync for ${languageCode}: ${error}`);
        }
    }

    return {
        success: errors.length === 0,
        stats: {
            totalItems,
            processedItems,
            errors
        }
    };
};

export default syncRunner; 