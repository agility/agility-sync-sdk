import { logInfo, logWarning } from '../util';
import { Container } from '../types/container.ts';
import { ContainerList } from '../types/container-list.ts';
import { AgilityClient } from '../types/agility-client.ts';
import { StoreInterface } from '../types/store-interface.ts';
import { SyncContext } from '../types/sync-context.ts';

/**
 * Sync the containers from the Agility Instance.
 * This uses the Management API to fetch all containers.
 */
export default async function syncContainers(
    this: SyncContext,
    languageCode: string
): Promise<void> {
    const storeInterface = this.store;

    try {
        // Fetch all containers
        const containerList = await this.agilityClient.management.getContainerList();
        
        if (!containerList || !containerList.items) {
            logWarning("No containers found.");
            return;
        }

        // Save each container
        for (const container of containerList.items) {
            try {
                // Get the full container details
                const fullContainer = await this.agilityClient.management.getContainer({
                    referenceName: container.referenceName
                });

                // Save the container
                await storeInterface.saveItem({
                    options: {},
                    item: fullContainer,
                    itemType: 'container',
                    languageCode,
                    itemID: container.referenceName
                });

                logInfo(`Saved container: ${container.name} (${container.referenceName})`);
            } catch (error) {
                logWarning(`Failed to sync container ${container.name}: ${error}`);
            }
        }

        logInfo(`Completed syncing ${containerList.items.length} container(s)`);
    } catch (error) {
        logWarning(`Failed to sync containers: ${error}`);
    }
} 