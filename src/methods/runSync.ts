import { logInfo, logSuccess } from '../util';
import { StoreInterface } from '../types/store-interface.ts';
import { ExtendedStoreInterface } from '../types/extended-store-interface.ts';
import { ClientConfig } from '../types/client-config.ts';
import { SyncState } from '../types/sync-state.ts';
import { ClientObject } from '../types/client-object.ts';

const syncRunner = async function (this: ClientObject) {
    const storeInterface = this.store;

    //if a mutex has been defined, call the wait lock
    let lockRelease: (() => void) | null = null;
    if (storeInterface.mutexLock !== undefined) {
        lockRelease = await storeInterface.mutexLock();
    }

    try {
        //actually do the sync
        await sync(this);
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

    console.log('Running sync...');

    const modeStr = clientObj.config.isPreview ? "preview" : "live";

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
        const newItemToken = await clientObj.syncContent(languageCode, syncState.itemToken);
        const newPageToken = await clientObj.syncPages(languageCode, syncState.pageToken);

        console.log('New Item Token:', newItemToken);
        console.log('New Page Token:', newPageToken);

        if (newItemToken != syncState.itemToken || newPageToken != syncState.pageToken) {
            //if we sync ANYTHING - pull the new sitemap down
            console.log('Syncing sitemaps...');
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
    }
};

export default syncRunner; 