# Type Interface Cleanup Plan

## Overview
This document tracks the progress of cleaning up type interfaces across the codebase. The goal is to remove duplicate interface definitions and ensure proper imports from the `types/` directory.

## Files to Update

### Store Interface Files
- [x] `src/store-interface.ts` - Remove duplicate `StoreInterface` and `ContentItem` definitions
- [x] `src/store-interface-console.ts` - Update type imports
- [x] `src/store-interface-filesystem.ts` - Update type imports

### Method Files
- [x] `src/methods/syncModels.ts` - Remove duplicate interfaces:
  - `ContentDefinition`
  - `ContentDefinitionList`
  - `StoreInterface`
  - `SyncContext`
- [x] `src/methods/syncAssets.ts` - Remove duplicate interfaces:
  - `MediaAsset`
  - `MediaFolder`
  - `MediaList`
  - `MediaFolderList`
  - `AgilityClient`
  - `StoreInterface`
  - `SyncContext`
- [x] `src/methods/runSync.ts` - Remove duplicate interfaces:
  - `ClientConfig`
  - `SyncState`
  - `ClientObject`
- [x] `src/methods/syncGalleries.ts` - Remove duplicate interfaces:
  - `MediaGalleryItem`
  - `MediaGalleryList`
  - `StoreInterface`
  - `SyncContext`
- [x] `src/methods/syncContainers.ts` - Remove duplicate interfaces:
  - `ContainerList`
  - `AgilityClient`
  - `StoreInterface`
  - `SyncContext`
- [x] `src/methods/syncContent.ts` - Remove duplicate interfaces:
  - `StoreInterface`
  - `SyncContext`
- [x] `src/methods/syncPages.ts` - Remove duplicate interfaces:
  - `StoreInterface`

### Type Files
These files contain the canonical type definitions and should be kept:
- [x] `src/types/content-definition.ts`
- [x] `src/types/container.ts`
- [x] `src/types/content-item.ts`
- [x] `src/types/store-interface.ts`
- [x] `src/types/save-item-params.ts`
- [x] `src/types/delete-item-params.ts`
- [x] `src/types/get-item-params.ts`
- [x] `src/types/media-asset.ts`
- [x] `src/types/merge-item-to-list-params.ts`
- [x] `src/types/sync-content-response.ts`
- [x] `src/types/sync-context.ts`
- [x] `src/types/container-list.ts`
- [x] `src/types/get-file-path-params.ts`
- [x] `src/types/media-gallery-list.ts`
- [x] `src/types/sync-pages-response.ts`
- [x] `src/types/store.ts`
- [x] `src/types/media-gallery.ts`
- [x] `src/types/media-folder.ts`
- [x] `src/types/media-gallery-item.ts`
- [x] `src/types/client-config.ts`
- [x] `src/types/sync-state.ts`
- [x] `src/types/client-object.ts`
- [x] `src/types/agility-client.ts`

## Progress Tracking
- [x] Phase 1: Remove duplicate interfaces from store interface files
  - [x] `src/store-interface.ts` - Completed
  - [x] `src/store-interface-console.ts` - Completed
  - [x] `src/store-interface-filesystem.ts` - Completed
- [x] Phase 2: Remove duplicate interfaces from method files
  - [x] `src/methods/syncModels.ts` - Completed
  - [x] `src/methods/syncAssets.ts` - Completed
  - [x] `src/methods/runSync.ts` - Completed
  - [x] `src/methods/syncGalleries.ts` - Completed
  - [x] `src/methods/syncContainers.ts` - Completed
  - [x] `src/methods/syncContent.ts` - Completed
  - [x] `src/methods/syncPages.ts` - Completed
- [x] Phase 3: Update imports in all files
  - [x] `src/methods/syncModels.ts` - Completed
  - [x] `src/methods/syncAssets.ts` - Completed
  - [x] `src/methods/runSync.ts` - Completed
  - [x] `src/methods/syncGalleries.ts` - Completed
  - [x] `src/methods/syncContainers.ts` - Completed
  - [x] `src/methods/syncContent.ts` - Completed
  - [x] `src/methods/syncPages.ts` - Completed
- [x] Phase 4: Verify all type imports are correct
- [x] Phase 5: Run type checking to ensure no regressions

## Test Implementation Plan
- [x] Phase 6: Set up test environment
  - [x] Install testing dependencies (Vitest)
  - [x] Configure test environment
  - [x] Create test utilities and mocks
- [ ] Phase 7: Implement test suites
  - [x] Store Interface Tests
    - [x] `store-interface-filesystem.ts` - Basic tests implemented
    - [x] `store-interface-console.ts` - Basic tests implemented
  - [ ] Sync Method Tests
    - [x] `syncModels.ts` - Basic tests implemented
    - [ ] `syncAssets.ts`
    - [ ] `syncContainers.ts`
    - [ ] `syncContent.ts`
    - [ ] `syncPages.ts`
    - [ ] `syncGalleries.ts`
    - [ ] `runSync.ts`
  - [ ] Integration Tests
    - [ ] End-to-end sync scenarios
    - [ ] Error handling
    - [ ] Edge cases

## Notes
- All type definitions should be imported from the `types/` directory
- No duplicate interface definitions should remain in implementation files
- Ensure all imports use proper file extensions (.ts)
- Maintain backward compatibility with existing code
- Some interfaces may need to be moved to the `types/` directory if they don't already exist there
