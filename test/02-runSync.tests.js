import chai from 'chai'
const assert = chai.assert;
const expect = chai.expect;


import { createSyncClient, createSyncClientUsingConsoleStore, createPreviewSyncClient } from './_syncClients.config'

const sleep = (ms) => {
	return new Promise(resolve => setTimeout(resolve, ms));
}


/*
	This file contains static references to content from the instance configured in the apiClient.config file.
*/

//this file should always run first in the tests...

describe('runSync:', async function () {
	it('should run 1 sync method using the filesystem', async function () {
		try {
			console.log('Creating sync client...');
			var syncClient = createSyncClient();
			console.log('Sync Client Created:', {
				config: syncClient.config,
				storeMethods: Object.keys(syncClient.store)
			});

			console.log('Starting sync...');
			const syncPromise = syncClient.runSync();
			const timeoutPromise = new Promise((_, reject) => 
				setTimeout(() => reject(new Error('Sync operation timed out')), 300000)
			);
			
			await Promise.race([syncPromise, timeoutPromise]);
			console.log('Sync completed');

			// Verify sync state
			const syncState = await syncClient.store.getSyncState('en-us');
			console.log('Sync State:', syncState);

			console.log('Clearing sync...');
			await syncClient.clearSync();
			console.log('Sync cleared');
		} catch (error) {
			console.error('Sync failed:', error);
			throw error;
		}
	}, 300000)


	it('should run 3 syncs at the same time method using the filesystem', async function () {
		try {
			console.log('Creating 3 sync clients...');
			let sync1 = createSyncClient();
			let sync2 = createSyncClient();
			let sync3 = createSyncClient();
			console.log('Sync Clients Created');

			console.log('Starting parallel syncs...');
			const syncPromises = [
				sync1.runSync(),
				sync2.runSync(),
				sync3.runSync()
			];
			
			// Add timeout to parallel syncs
			const timeoutPromise = new Promise((_, reject) => 
				setTimeout(() => reject(new Error('Parallel syncs timed out')), 300000)
			);

			console.log('Waiting for all syncs to complete...');
			await Promise.race([Promise.all(syncPromises), timeoutPromise]);
			console.log('All syncs completed');

			// Verify sync states
			const syncState1 = await sync1.store.getSyncState('en-us');
			const syncState2 = await sync2.store.getSyncState('en-us');
			const syncState3 = await sync3.store.getSyncState('en-us');
			console.log('Sync States:', {
				sync1: syncState1,
				sync2: syncState2,
				sync3: syncState3
			});
		} catch (error) {
			console.error('Parallel syncs failed:', error);
			throw error;
		}
	}, 300000)


	it('should run 3 syncs 1.5 secs apart', async function () {
		try {
			console.log('Creating 3 sync clients...');
			let sync1 = createSyncClient();
			let sync2 = createSyncClient();
			let sync3 = createSyncClient();
			console.log('Sync Clients Created');

			console.log('Starting first sync...');
			await sleep(1500);
			const sync1Promise = sync1.runSync();
			const timeout1Promise = new Promise((_, reject) => 
				setTimeout(() => reject(new Error('First sync timed out')), 300000)
			);
			await Promise.race([sync1Promise, timeout1Promise]);
			console.log('First sync completed');

			console.log('Starting second sync...');
			await sleep(1500);
			const sync2Promise = sync2.runSync();
			const timeout2Promise = new Promise((_, reject) => 
				setTimeout(() => reject(new Error('Second sync timed out')), 300000)
			);
			await Promise.race([sync2Promise, timeout2Promise]);
			console.log('Second sync completed');

			console.log('Starting third sync...');
			await sleep(1500);
			const sync3Promise = sync3.runSync();
			const timeout3Promise = new Promise((_, reject) => 
				setTimeout(() => reject(new Error('Third sync timed out')), 300000)
			);
			await Promise.race([sync3Promise, timeout3Promise]);
			console.log('Third sync completed');

			// Verify sync states
			const syncState1 = await sync1.store.getSyncState('en-us');
			const syncState2 = await sync2.store.getSyncState('en-us');
			const syncState3 = await sync3.store.getSyncState('en-us');
			console.log('Sync States:', {
				sync1: syncState1,
				sync2: syncState2,
				sync3: syncState3
			});
		} catch (error) {
			console.error('Sequential syncs failed:', error);
			throw error;
		}
	}, 300000)

});

describe('runSync:', async function () {
	it('should run sync method using the console store', async function () {
		try {
			console.log('Creating console store sync client...');
			var syncClient = createSyncClientUsingConsoleStore();
			console.log('Console Store Sync Client Created:', {
				config: syncClient.config,
				storeMethods: Object.keys(syncClient.store)
			});

			console.log('Starting sync...');
			const syncPromise = syncClient.runSync();
			const timeoutPromise = new Promise((_, reject) => 
				setTimeout(() => reject(new Error('Console store sync timed out')), 300000)
			);
			
			await Promise.race([syncPromise, timeoutPromise]);
			console.log('Sync completed');

			// Verify sync state
			const syncState = await syncClient.store.getSyncState('en-us');
			console.log('Sync State:', syncState);
		} catch (error) {
			console.error('Console store sync failed:', error);
			throw error;
		}
	}, 300000)

});

