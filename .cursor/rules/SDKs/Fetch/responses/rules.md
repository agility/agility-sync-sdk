---
title: Fetch SDK Response Schemas
description: Documentation for all response schemas returned by the Fetch SDK API endpoints
version: 1.0.0
last_updated: 2024-03-21
author: Aaron Taylor
type: json
---

# Fetch SDK Response Schemas

## getContentList
Retrieves a list of content items by reference name.

```typescript
{
  items: [
    { 
      contentID: number,
      properties: {
        state: number,
        modified: Date,
        versionID: number,
        referenceName: string,
        definitionName: string,
        itemOrder: number
      },
      fields: {
        // list of fields you have in your content model
        title: string,
        slug: string,
        date: Date,
        content: string
      }
    }
  ],
  totalCount: number
}
```

## getContentItem
Gets the details of a content item by their Content ID.

```typescript
{ 
  contentID: number,
  properties: {
    state: number,
    modified: Date,
    versionID: number,
    referenceName: string,
    definitionName: string,
    itemOrder: number
  },
  fields: {
    // list of fields you have in your content model
    title: string,
    slug: string,
    date: Date,
    content: string
  }
}
```

## getSitemapFlat
The sitemap, returned in a flat list, where the dictionary key is the page path.

```typescript
{
  path: {
    title: string,
    name: string,
    pageID: number,
    menuText: string,
    visible: { menu: boolean, sitemap: boolean },
    path: string,
    redirect: string,
    isFolder: boolean
  }
}
```

## getSitemapNested
Gets the sitemap as an array in a nested format.

```typescript
[
  {
    title: string,
    name: string,
    pageID: number,
    menuText: string,
    visible: { menu: boolean, sitemap: boolean },
    path: string,
    redirect: string,
    isFolder: boolean,
    children: [
      {
       title: string,
       name: string,
       pageID: number,
       menuText: string,
       visible: { menu: boolean, sitemap: boolean },
       path: string,
       redirect: string,
       isFolder: boolean,
       contentID: number,
       children: [ ... ]
     }
   ]
  }
]
```

## getPage
Gets the details of a page by its Page ID.

```typescript
{
  pageID: number,
  name: string,
  path: string,
  title: string,
  menuText: string,
  pageType: string,
  templateName: string,
  redirectUrl: string,
  securePage: boolean,
  excludeFromOutputCache: boolean,
  visible: { menu: boolean, sitemap: boolean },
  seo: {
    metaDescription: string,
    metaKeywords: string,
    metaHTML: string,
    menuVisible: boolean,
    sitemapVisible: boolean
  },
  scripts: { excludedFromGlobal: boolean, top: string, bottom: string },
  dynamic: {
    referenceName: string,
    fieldName: string,
    titleFormula:  string,
    menuTextFormula: string,
    pageNameFormula: string,
    visibleOnMenu: boolean,
    visibleOnSitemap: boolean
  },
  properties: { state: number, modified: Date, versionID: number },
  zones: { 
   MainContentZone: [ 
     {
      module: string;
      item: ContentItem;
      customData?: any;
     }
   ]
  }
}
```

## getPageByPath
Gets the details of a page by its Path.

```typescript
{
 sitemapNode: {
    pageID: number,
    name: string,
    path: string,
    title: string,
    menuText: string,
    visible: { menu: boolean, sitemap: boolean }
  },
  page: {
    pageID: number,
    name: string,
    path: string,
    title: string,
    menuText: string,
    pageType: string,
    templateName: string,
    redirectUrl: string,
    securePage: boolean,
    excludeFromOutputCache: boolean,
    visible: { menu: boolean, sitemap: boolean },
    seo: {
      metaDescription: string,
      metaKeywords: string,
      metaHTML: string,
      menuVisible: boolean,
      sitemapVisible: boolean
    },
    scripts: { excludedFromGlobal: boolean, top: string, bottom: string },
    dynamic: {
      referenceName: string,
      fieldName: string,
      titleFormula:  string,
      menuTextFormula: string,
      pageNameFormula: string,
      visibleOnMenu: boolean,
      visibleOnSitemap: boolean
    },
    properties: { state: number, modified: Date, versionID: number },
    zones: { 
     MainContentZone: [ 
       {
        module: string;
        item: ContentItem;
        customData?: any;
       }
     ]
    }
  }
}
```

## getGallery
Gets the details of a gallery by their Gallery ID.

```typescript
{
  galleryID: number;
  name: string;
  description: string;
  count: number;
  media: [
     {
       mediaID: number;
       fileName: string;
       url: string;
       size: number;
       modifiedOn: Date;
       metaData: {
           title: string;
           description: string;
           linkUrl: string;
           pixelHeight: string;
           pixelWidth: string;
       };
     }
  ];
}
```

## getUrlRedirections
Retrieves a list of URL redirections.

```typescript
{
   syncToken: number;
   items: [
      {
        id: number;
        originUrl: string;
        destinationUrl: string;
        statusCode: 301 | 302;
      }
   ];
}
```

## getSyncContent
Retrieves a list of content items that need to be synced.

```typescript
{
   syncToken: number;
   items: ContentItem[];
}
```

## getSyncPages
Retrieves a list of pages that need to be synced.

```typescript
{
   syncToken: number;
   items: Page[];
}
```
