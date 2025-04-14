##Fetch SDK Functions

The following are a collection of SDK functions used with `@agility/content-fetch`

### Example request

```javascript
import agility from "@agility/content-fetch"

//initialize the api client
const api = agility.getApi({
	guid: "[guid]",
	apiKey: "[your-api-key]",
})

//make the request: get a content item with the ID 22 in locale 'en-us'
const contentItems = await api.getContentItem({
	contentID: 22,
	locale: "en-us",
})
```

### Functions
#### getApi
To instantiate a new Agility client, you must first use the getApi function, this will be used for all your subsequent function calls. 

```typescript
const api = await agility.getApi({
  guid: '046a1a87',
  apiKey: 'defaultlive.2b7f3a...'
})
```

#### getContentList
Retrieves a list of content items by reference name.

```typescript
const api = await agility.getApi({
  guid: '046a1a87',
  apiKey: 'defaultlive.2b7f3a...'
})

const list = await api.getContentList({
    referenceName: 'posts',
    languageCode: 'en-us'
})
```

#### getContentItem
Gets the details of a content item by their Content ID.

```typescript
const api = await agility.getApi({
  guid: '046a1a87',
  apiKey: 'defaultlive.2b7f3a...'
})

const item = await api.getContentItem({
    contentID: 21,
    languageCode: 'en-us'
})
```

#### getSitemapFlat
The sitemap, returned in a flat list, where the dictionary key is the page path. This method is ideal for page routing or generating sitemaps. 

```typescript
const api = await agility.getApi({
  guid: '046a1a87',
  apiKey: 'defaultlive.2b7f3a...'
})

const sitemapFlat = await api.getSitemapFlat({
    channelName: 'website',
    languageCode: 'en-us'
})
```

#### getSitemapNested
Gets the sitemap as an array in a nested format, ideal for generating menus.

```typescript
const api = await agility.getApi({
  guid: '046a1a87',
  apiKey: 'defaultlive.2b7f3a...'
})

const sitemapNested = await api.getSitemapNested({
  channelName: 'website',
  languageCode: 'en-us'
})
```

#### getPage
Gets the details of a page by its Page ID.

```typescript
const api = await agility.getApi({
   guid: 'ade6cf3c',
   apiKey: 'defaultlive.201ffdd0841ca...',
});
 
const page = await api.getPage({
   pageID: 1,
   locale: 'en-us'
})
```


#### getPageByPath
Gets the details of a page by its Path.
```typescript
const api = await agility.getApi({
   guid: 'ade6cf3c',
   apiKey: 'defaultlive.201ffdd0841ca...',
});
 
const page = await api.getPageByPath({
   pagePath: '/blog/amazing-travel-guide',
   channelName: 'website',
   locale: 'en-us'
})
```

#### getGallery
Gets the details of a gallery by their Gallery ID.
```typescript
const api = await agility.getApi({
  guid: 'ade6cf3c',
  apiKey: 'defaultlive.201ffdd0841ca...',
});

const gallery = await api.getGallery({
  galleryID: 22
})
```

#### getUrlRedirections
Retrieves a list of URL redirections

```typescript
const api = await agility.getApi({
  guid: 'ade6cf3c',
  apiKey: 'defaultlive.201ffdd0841ca...',
});

const redirects = await api.getUrlRedirections({
  lastAccessDate: dateObj
})
```

#### getSyncContent
Retrieves a list of content items that need to be synced based on the provided sync content items token, and returns the next sync token.

```typescript
const api = await agility.getApi({
  guid: 'ade6cf3c',
  apiKey: 'defaultlive.201ffdd0841ca...',
});

const content = await api.getSyncContent({
  syncToken: '0', //to start a new sync
  locale: 'en-us',
  pageSize: 500
})

// pass this back to the getSyncPages to resume
// the content until no sync token is returned.
const syncToken = pages.syncToken
Response Schema
{
   syncToken: number; // send back to continue sync
   items: ContentItem[]; // see getContentItem above
}
```


#### getSyncPages
Retrieves a list of pages that need to be synced based on the provided sync pages token, and returns the next sync token.

```typescript
const api = await agility.getApi({
  guid: 'ade6cf3c',
  apiKey: 'defaultlive.201ffdd0841ca...',
});

const pages = await api.getSyncPages({
  syncToken: '0', //to start a new sync
  locale: 'en-us',
  pageSize: 500
})

// pass this back to the getSyncPages to resume
// the content until no sync token is returned.
const syncToken = pages.syncToken
Response Schema
{
   syncToken: number;
   items: Page[]; // see getPage above
}
```