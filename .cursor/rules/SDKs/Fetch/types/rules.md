---
title: Agility Content Fetch SDK Types Reference
description: Complete TypeScript type definitions for the Agility Content Fetch SDK
version: 1.0.0
last_updated: 2024-03-21
author: Aaron Taylor
type: typescript
---

# Agility Content Fetch SDK Types Reference

This document contains all the TypeScript types used in the Agility Content Fetch SDK.

## Page Types

### Page
```typescript
interface Page {
  pageID: number;
  name: string;
  path: string;
  title: string;
  menuText: string;
  pageType: "static" | "dynamic" | "dynamic_node" | "link" | "folder";
  templateName: string;
  securePage: boolean;
  properties: SystemProperties;
  zones: { [key: string]: ContentZone[] };
  redirectUrl?: string;
  dynamicItemContentID?: number;
  visible: SitemapVisibility;
  seo?: SEOProperties;
}
```

### SyncPages
```typescript
interface SyncPages {
  syncToken: number;
  items: Page[];
}
```

## Content Types

### ContentItem
```typescript
interface ContentItemProperties {
  state: number;
  modified: Date;
  versionID: number;
  referenceName: string;
  definitionName: string;
  itemOrder: number;
}

interface ContentItem<T = { [key: string]: any }> {
  contentID: number;
  properties: ContentItemProperties;
  fields: T;
  seo?: SEOProperties;
}
```

### ContentList
```typescript
interface ContentList {
  items: ContentItem[];
  totalCount: number;
}
```

### ContentZone
```typescript
interface ContentZone {
  module: string;
  item: ContentItem | ContentReference;
  customData?: any;
}
```

### ContentReference
```typescript
interface ContentReference {
  contentid?: number;
  fulllist?: boolean;
  referencename?: string;
}
```

### SyncContent
```typescript
interface SyncContent {
  syncToken: number;
  items: ContentItem[];
}
```

## System Types

### SystemProperties
```typescript
interface SystemProperties {
  created: Date;
  modified: Date;
  state: 1 | 2 | 3 | 4 | 5 | 6 | 7; // 1=Staging, 2=Published, 3=Deleted, 4=Approved, 5=AwaitingApproval, 6=Declined, 7=Unpublished
  versionID: number;
}
```

## URL Types

### URLRedirection
```typescript
interface URLRedirection {
  id: number;
  originUrl: string;
  destinationUrl: string;
  statusCode: 301 | 302;
}
```

### URLRedirectionResponse
```typescript
interface URLRedirectionResponse {
  syncToken: any; // The sync token to be used in the next call as a continuation token for syncing content
  items: Page[];
}
```

## Filter Types

### Filter
```typescript
interface Filter {
  property: string;
  operator: FilterOperator | "eq" | "ne" | "gt" | "lt" | "ge" | "le" | "contains" | "like" | "in";
  value: string;
}

type FilterOperator = "eq" | "ne" | "gt" | "lt" | "ge" | "le" | "contains" | "like" | "in";
```

### FilterLogicOperator
```typescript
type FilterLogicOperator = "AND" | "OR";

enum FilterLogicOperators {
  AND = "AND",
  OR = "OR",
}
```

## Media Types

### MediaItem
```typescript
interface MediaItem {
  mediaID: number;
  fileName: string;
  url: string;
  size: number;
  modifiedOn: Date;
  metaData: MediaItemMetaData;
}
```

### MediaItemMetaData
```typescript
interface MediaItemMetaData {
  Title: string;
  Description: string;
  LinkUrl: string;
  pixelHeight: string;
  pixelWidth: string;
}
```

### Gallery
```typescript
interface Gallery {
  galleryID: number;
  name: string;
  description: string;
  count: number;
  media: MediaItem[];
}
```

## SEO Types

### SEOProperties
```typescript
interface SEOProperties {
  metaDescription: string;
  metaKeywords: string;
  metaHTML: string;
  menuVisible: boolean;
  sitemapVisible: boolean;
}
```

## Sitemap Types

### SitemapFlat
```typescript
interface SitemapFlat {
  [key: string]: SitemapFlatItem;
}
```

### SitemapFlatItem
```typescript
interface SitemapFlatItem {
  pageID: number;
  title: string;
  name: string;
  path: string;
  menuText: string;
  pageType: "static" | "dynamic" | "dynamic_node" | "folder" | "link";
  properties: SystemProperties;
  redirectUrl?: string;
  dynamicItemContentID?: number;
  visible: SitemapVisibility;
}
```

### SitemapNested
```typescript
type SitemapNested = SitemapNestedItem[];
```

### SitemapNestedItem
```typescript
interface SitemapNestedItem {
  pageID: number;
  title: string;
  name: string;
  path: string;
  menuText: string;
  pageType: "static" | "dynamic" | "dynamic_node" | "folder" | "link";
  properties: SystemProperties;
  redirectUrl?: string;
  dynamicItemContentID?: number;
  visible: SitemapVisibility;
  pages?: SitemapNestedItem[]; // Recursive reference to nested pages
}
```

### SitemapVisibility
```typescript
interface SitemapVisibility {
  menu: boolean;
  sitemap: boolean;
}
```

## Sort Types

### SortDirection
```typescript
type SortDirection = "asc" | "desc";

enum SortDirections {
  ASC = "asc",
  DESC = "desc",
}
```

## Error Types

### EvalError
```typescript
class EvalError extends Error {
  constructor(message?: string, asserter = undefined) {
    super(message);
    Error.captureStackTrace?.(this, asserter || this.constructor);
  }
}
```

### RangeError
```typescript
class RangeError extends Error {
  constructor(message?: string, asserter = undefined) {
    super(message);
    Error.captureStackTrace?.(this, asserter || this.constructor);
  }
}
```

### ReferenceError
```typescript
class ReferenceError extends Error {
  constructor(message?: string, asserter = undefined) {
    super(message);
    Error.captureStackTrace?.(this, asserter || this.constructor);
  }
}
```

### SyntaxError
```typescript
class SyntaxError extends Error {
  constructor(message?: string, asserter = undefined) {
    super(message);
    Error.captureStackTrace?.(this, asserter || this.constructor);
  }
}
```

### TypeError
```typescript
class TypeError extends Error {
  constructor(message: string, asserter?: any) {
    super(message);
    Error.captureStackTrace?.(this, asserter || this.constructor);
  }
}
```

### URIError
```typescript
class URIError extends Error {
  constructor(message?: string, asserter = undefined) {
    super(message);
    Error.captureStackTrace?.(this, asserter || this.constructor);
  }
}
```

## Client Types

### RequestParams
```typescript
interface RequestParams {
  url: string;
  method: string; //'get' | 'post' | 'put' | 'delete'
  baseURL: string | null;
  headers: any;
  params: any;
}
```

### ApiClientInstance
```typescript
interface ApiClientInstance {
  config: Config;
  makeRequest(req: RequestParams): Promise<any>;
}
```

## Environment Types

### EnvConfig
```typescript
interface EnvConfig {
  baseUrl: string | null;
  isPreview: boolean;
  guid: string | null;
  apiKey: string | null;
}
```

## Configuration Types

### Config
```typescript
interface Config {
  /**
   * The optional baseUrl for the API.  If not provided, the API will use the default baseUrl for the instance.
   * This is mostly used for testing purposes.
   */
  baseUrl?: string | null;

  /**
   * If true, the API will use the Preview API.  If false, it will use the Fetch API. Default is false.
   * Make sure the API Key provided matches this value.
   */
  isPreview?: boolean;

  /**
   * The guid that represents your instance.
   */
  guid?: string | null;

  /**
   * The Fetch or Preview API key.
   */
  apiKey?: string | null;
  locale?: string | null;
  /**
   * Additional headers to include in the request.
   */
  headers?: { [key: string]: string };
  requiresGuidInHeaders?: boolean;

  /**
   * The logging level.  Default is 'warn'.
   */
  logLevel?: 'debug' | 'info' | 'warn' | 'error' | 'silent';

  /**
   * Used for debugging purposes.  Default is false.
   */
  debug?: boolean;

  /**
   * Optional Caching options. Caching is disabled by default.
   * This is mostly used for Next.js and other server-side rendering frameworks.
   */
  caching?: {
    maxAge?: number; // caching disabled by default
  }
  fetchConfig?: any
}
```

Let me continue reading more type files to add to this documentation... 