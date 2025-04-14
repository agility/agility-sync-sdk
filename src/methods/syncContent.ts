import { logInfo, logWarning, sleep } from '../util';
import { ContentItem } from '../types/content-item.ts';
import { SyncContentResponse } from '../types/sync-content-response.ts';
import { AgilityClient } from '../types/agility-client.ts';
import { StoreInterface } from '../types/store-interface.ts';
import { SyncContext } from '../types/sync-context.ts';

/**
 * Sync the content items in the specified Agility Instance.
 */
export default async function syncContent(
    this: SyncContext,
    languageCode: string,
    token: number = 0
): Promise<number> {
    const storeInterface = this.store;

    let itemCount = 0;
    let busy = false;
    let waitMS = 0;
    const waitMaxMS = 10 * 60 * 1000;
    const waitIntervalMS = 1000;

    console.log('=== Starting Content Sync ===');
    console.log('Initial Token:', token);
    console.log('Language Code:', languageCode);
    console.log('Store Interface:', storeInterface.constructor.name);

    do {
        console.log('\n=== Sync Iteration ===');
        console.log('Current Token:', token);
        console.log('Total Items Processed:', itemCount);
        console.log('Wait Time (ms):', waitMS);

        try {
            //sync content items...
            console.log('Calling getSyncContent with params:', {
                syncToken: token,
                pageSize: 100,
                languageCode: languageCode,
            });

            const syncRet = await this.agilityClient.getSyncContent({
                syncToken: token,
                pageSize: 100,
                languageCode: languageCode,
            });

            console.log('Raw Sync Response:', JSON.stringify(syncRet, null, 2));

            if (syncRet === undefined || syncRet === null) {
                console.error('Sync response is undefined or null');
                logWarning("Sync API returned undefined/null response");
                break;
            }

            if (syncRet.busy !== undefined && syncRet.busy === true) {
                //if the api is being updated, wait a few ms and try again...
                waitMS += waitIntervalMS;
                if (waitMS > waitMaxMS) {
                    console.error('Sync timeout reached:', waitMS, 'ms');
                    logWarning("Sync API has been busy for too long, canceling.");
                    break;
                }

                if (!busy) {
                    //first time we're busy...
                    busy = true;
                    console.log('First busy state detected');
                    logInfo("Sync API is busy. Waiting...");
                }

                console.log('Waiting for', waitIntervalMS, 'ms before retry');
                await sleep(waitIntervalMS);
                continue;
            }

            if (busy === true) {
                console.log('Server no longer busy, continuing sync');
                logInfo("Continuing sync...");
                busy = false;
                waitMS = 0;
            }

            const syncItems = syncRet.items || [];
            console.log('Items in response:', syncItems.length);

            //if we don't get anything back, kick out
            if (syncItems.length > 0) {
                console.log('Processing', syncItems.length, 'items');
                for (let index = 0; index < syncItems.length; index++) {
                    const item = syncItems[index];
                    console.log(`Saving item ${index + 1}/${syncItems.length}:`, {
                        contentID: item.contentID,
                        properties: Object.keys(item.properties || {}),
                    });
                    await storeInterface.saveContentItem({ contentItem: item, languageCode });
                }
            } else {
                console.log('No items to process in this batch');
            }

            if (syncRet.syncToken > token) {
                console.log('Updating token from', token, 'to', syncRet.syncToken);
                token = syncRet.syncToken;
            } else {
                console.log('No new token received, breaking sync loop');
                break;
            }

            itemCount += syncItems.length;
            console.log('Updated total items processed:', itemCount);

        } catch (error: unknown) {
            console.error('Error during sync iteration:', error);
            logWarning(`Error during sync: ${error instanceof Error ? error.message : 'Unknown error'}`);
            break;
        }

    } while (token > 0 || busy === true);

    console.log('\n=== Sync Summary ===');
    console.log('Final Token:', token);
    console.log('Total Items Processed:', itemCount);
    console.log('Total Wait Time (ms):', waitMS);

    if (itemCount > 0) {
        logInfo(`Content Sync returned ${itemCount} item(s).`);
    } else {
        logInfo(`Content Sync returned no item(s).`);
    }

    return token;
} 