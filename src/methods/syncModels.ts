import { logInfo, logWarning } from '../util';
import { ContentDefinition, ContentDefinitionList } from '../types/content-definition.ts';
import { StoreInterface } from '../types/store-interface.ts';
import { SyncContext } from '../types/sync-context.ts';
import { AgilityClient } from '../types/agility-client.ts';

/**
 * Sync the content models from the Agility Instance.
 * This uses the Management API to fetch all content definitions.
 */
export default async function syncModels(
    this: SyncContext,
    languageCode: string
): Promise<void> {
    const storeInterface = this.store;

    try {
        // Fetch all content definitions
        const definitionList = await this.agilityClient.management.getContentDefinitionList();
        
        if (!definitionList || !definitionList.items) {
            logWarning("No content definitions found.");
            return;
        }

        // Save each content definition
        for (const definition of definitionList.items) {
            try {
                // Get the full definition details
                const fullDefinition = await this.agilityClient.management.getContentDefinition({
                    referenceName: definition.referenceName
                });

                // Save the definition
                await storeInterface.saveItem({
                    options: {},
                    item: fullDefinition,
                    itemType: 'model',
                    languageCode,
                    itemID: definition.referenceName
                });

                logInfo(`Saved content model: ${definition.name} (${definition.referenceName})`);
            } catch (error) {
                logWarning(`Failed to sync content model ${definition.name}: ${error}`);
            }
        }

        logInfo(`Completed syncing ${definitionList.items.length} content model(s)`);
    } catch (error) {
        logWarning(`Failed to sync content models: ${error}`);
    }
} 