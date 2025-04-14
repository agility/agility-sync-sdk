import { logInfo, logWarning, sleep } from '../util';
import { ContentItem, SyncContentResponse, AgilityClient, StoreInterface, SyncContext } from '../types/index';

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

    do {

        try {
            //sync content items...

            const syncRet = await this.agilityClient.getSyncContent({
                syncToken: token,
                pageSize: 100,
                languageCode: languageCode,
            });

            if (syncRet === undefined || syncRet === null) {
                console.error('Sync response is undefined or null');
                logWarning("Sync API returned undefined/null response");
                break;
            }

            // Check if the server is busy
            if (syncRet.busy === true) {
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
            // console.log('Items in response:', syncItems.length);

            //if we don't get anything back, kick out
            if (syncItems.length === 0) {
                console.log('No items to process in this batch');
                break;
            }

            // console.log('Processing', syncItems.length, 'items');
            for (let index = 0; index < syncItems.length; index++) {
                const item = syncItems[index];
                console.log(`Saving item ${index + 1}/${syncItems.length}:`, {
                    contentID: item.contentID,
                    properties: Object.keys(item.properties || {}),
                });
                await storeInterface.saveContentItem({ contentItem: item, languageCode });
                itemCount++;
            }

            // Update the token for the next iteration
            if (syncRet.syncToken !== undefined && syncRet.syncToken !== null && syncRet.syncToken > token) {
                token = syncRet.syncToken;
                console.log('Updated sync token:', token);
            } else {
                console.log('No sync token returned or token not increased, sync complete');
                break;
            }

        } catch (error: unknown) {
            console.error('Error during sync iteration:', error);
            logWarning(`Error during sync: ${error instanceof Error ? error.message : 'Unknown error'}`);
            break;
        }

    } while (token > 0 || busy === true);


    if (itemCount > 0) {
        logInfo(`Content Sync returned ${itemCount} item(s).`);
    } else {
        logInfo(`Content Sync returned no item(s).`);
    }

    return token;
} 