# Agility CMS Sync SDK
The Agility CMS Sync SDK provides an interface to sync, store and access content locally.

By keeping a local cache of your content, your web app can access content faster.

## Benefits
- Access your content quickly, and locally in your web or mobile app
- Use your own persistent storage, such as **Gatsby GraphQL**, a **Database**, or **Local Storage**
- Simplify syncing content



## Use Cases
1. You want to reduce the amount of REST API calls made to your Agility CMS instance.
2. You have a client-side Single Page Application, and want to cache content in local storage in the browser.
3. You want so synchronize content from the CMS to another system such Redis Cache
4. You are running a **Server-Side Rendered (SSR)** web app and you want to cache your content locally, reducing latency for retrieving content.
5. You are using a **Static Site Generator (SSG)** and you don't want to have to re-source all of your content on each build.
6. You have a client-side **Single Page Application**, and want to cache content in local storage in the browser.

## How it Works
This Sync SDK uses the Sync API `getSyncPages` and `getSyncContent` found in our [Agility CMS Content Fetch JS SDK](https://agilitydocs.netlify.com/agility-content-fetch-js-sdk/) and aims to abstract some of the complexities involved in managing synced content.

It Calls the Sync API and returns content that has not yet been synced. The first call will pull everything and save it to your local store. Subsequent calls will only refresh content that has changed since the last time the Sync API was called.

This SDK:
- Calls the API
- Manages your `syncToken` for you
- Stores content in the filesystem (by default)
- Provides ability to extend and store/access content in other places

## Setup
Install `@agility/content-sync`:
```
npm install @agility/content-sync
```

## Sync to Filesystem (using Defaults)
1. Create a sync client:
    ```javascript
    import agilitySync from '@agility/content-sync'
    const syncClient = agilitySync.getSyncClient({
        //your 'guid' from Agility CMS
        guid: 'some-guid',
        //your 'apiKey' from Agility CMS
        apiKey: 'some-api-key',
        //the language(s) of content you want to source
        languages: ['en-us'],
        //your channel(s) for the pages you want to source
		channels: ['website'],
		//whether you are using the preview key or not
		isPreview: false
    });
    ```

2. Run the `runSync` command to synchronize your Agility CMS content (*Content* and *Pages*) to your local filesystem
    ```javascript
    await syncClient.runSync();
    ```
    `runSync()` will pull down all your *Sitemap*, *Pages*, and *Content* and store them in your local filesystem under the default path `.agility-files`.

## Accessing Content
Once content is in your sync store, you can easily access it as you need it:
```javascript
import agilitySync from '@agility/constent-sync'
const syncClient = agilitySync.getSyncClient({
    //your 'guid' from Agility CMS
    guid: 'some-guid',
    //your 'apiKey' from Agility CMS
    apiKey: 'some-api-key',
    //the language(s) of content you want to source
    languages: ['en-us'],
    //your channel(s) for the pages you want to source
    channels: ['website']
});

//start the sync process
await syncClient.runSync();

//query and retrieve your content
const contentItem = await syncClient.store.getContentItem({
    contentID: 21,
    languageCode: languageCode
})

const contentList = await syncClient.store.getContentList({
    referenceName: 'posts',
    languageCode: languageCode
})
```

## Clearing out the Sync Content
To clear out the locally synced content, run the clearSync command.
```javascript
await syncClient.clearSync();
```

## How to Create your Own Sync Store
While this SDK provides a filesystem sync interface by default, you can change this and use another one or create your own.
1. Create a new `.js` file which exports the following methods:
```javascript
/**
 * The function to handle saving/updating an item to your storage. This could be a Content Item, Page, Url Redirections, Sync State (state), or Sitemap.
 * @param {Object} params - The parameters object
 * @param {Object} params.options - A flexible object that can contain any properties specifically related to this interface
 * @param {Object} params.item - The object representing the Content Item, Page, Url Redirections, Sync State (state), or Sitemap that needs to be saved/updated
 * @param {String} params.itemType - The type of item being saved/updated, expected values are `item`, `page`, `sitemap`, `nestedsitemap`, `state`, `urlredirections`
 * @param {String} params.languageCode - The locale code associated to the item being saved/updated
 * @param {(String|Number)} params.itemID - The ID of the item being saved/updated - this could be a string or number depending on the itemType
 * @returns {Void}
 */
const saveItem = async ({ options, item, itemType, languageCode, itemID }) => {
    console.log(`Console Interface: saveItem has been called`);
    return null;
}
/**
 * The function to handle deleting an item to your storage. This could be a Content Item, Page, Url Redirections, Sync State (state), or Sitemap.
 * @param {Object} params - The parameters object
 * @param {Object} params.options - A flexible object that can contain any properties specifically related to this interface
 * @param {String} params.itemType - The type of item being deleted, expected values are `item`, `page`, `sitemap`, `nestedsitemap`, `state`, `urlredirections`
 * @param {String} params.languageCode - The locale code associated to the item being saved/updated
 * @param {(String|Number)} params.itemID - The ID of the item being deleted - this could be a string or number depending on the itemType
 * @returns {Void}
 */
const deleteItem = async ({ options, itemType, languageCode, itemID }) => {
    console.log(`Console Interface: deleteItem has been called`);
    return null;
}
/**
 * The function to handle updating and placing a Content Item into a "list" so that you can handle querying a collection of items.
 * @param {Object} params - The parameters object
 * @param {Object} params.options - A flexible object that can contain any properties specifically related to this interface
 * @param {Object} params.item - The object representing the Content Item
 * @param {String} params.languageCode - The locale code associated to the item being saved/updated 
 * @param {(String|Number)} params.itemID - The ID of the item being updated - this could be a string or number depending on the itemType
 * @param {String} params.referenceName - The reference name of the Content List that this Content Item should be added to
 * @param {String} params.definitionName - The Model name that the Content Item is based on
 * @returns {Void}
 */
const mergeItemToList = async ({ options, item, languageCode, itemID, referenceName, definitionName }) => {
	console.log(`Console Interface: mergeItemToList has been called`);
    return null;
}
/**
 * The function to handle retrieving a Content Item, Page, Url Redirections, Sync State (state), or Sitemap
 * @param {Object} params - The parameters object
 * @param {Object} params.options - A flexible object that can contain any properties specifically related to this interface
 * @param {String} params.itemType - The type of item being accessed, expected values are `item`, `list`, `page`, `sitemap`, `nestedsitemap`, `state`, `urlredirections`
 * @param {String} params.languageCode - The locale code associated to the item being accessed
 * @param {(String|Number)} params.itemID - The ID of the item being accessed - this could be a string or number depending on the itemType
 * @returns {Object}
 */
const getItem = async ({ options, itemType, languageCode, itemID }) => {
    console.log(`Console Interface: getItem has been called`)
    return null;
}
/**
 * The function to handle clearing the cache of synchronized data from the CMS
 * @param {Object} params - The parameters object
 * @param {Object} params.options - A flexible object that can contain any properties specifically related to this interface
 * @returns {Void}
 */
const clearItems = async ({ options }) => {
    console.log(`Console Interface: clearItem has been called`)
    return null;
}

module.exports = {
    saveItem,
    deleteItem,
    mergeItemToList,
    getItem,
    clearItems
}
```
2. Register the `syncClient` to use your **Sync Store**
```javascript
import agilitySync from '@agility/constent-sync'
import sampleSyncConsoleInterface from './store-interface-console'
const syncClient = agilitySync.getSyncClient({
    //your 'guid' from Agility CMS
    guid: 'some-guid',
    //your 'apiKey' from Agility CMS
    apiKey: 'some-api-key',
    //the language(s) of content you want to source
    languages: ['en-us'],
    //your channel(s) for the pages you want to source
    channels: ['website'],
    //your custom storage/access interface
    store: {
        //must be the interface used to store and access content
        interface: sampleSyncConsoleInterface,
        //any options/config that you want to pass along to your interface as an argument 'options'
        options: {}
    }
});
//start the sync process
syncClient.runSync();
```







