# Type Centralization Workflow

## Goal
Centralize all TypeScript types into a single index file for easier imports and better maintainability.

## Plan

1. **Create Type Index File**
   - [x] Create `src/types/index.ts`
   - [x] Export all types from individual files
   - [x] Verify exports

2. **Files to Update**
   - [x] src/methods/syncContent.ts
     - [x] Replace individual type imports with single import from types/index
     - [x] Update import paths to remove .ts extensions
     - [x] Verify no type errors
   - [x] src/methods/runSync.ts
     - [x] Replace individual type imports with single import from types/index
     - [x] Update import paths to remove .ts extensions
     - [x] Verify no type errors
   - [x] src/methods/syncPages.ts
     - [x] Replace individual type imports with single import from types/index
     - [x] Update import paths to remove .ts extensions
     - [x] Verify no type errors
   - [ ] src/store-interface-console.ts
     - [ ] Replace individual type imports with single import from types/index
     - [ ] Update import paths to remove .ts extensions
     - [ ] Verify no type errors
   - [ ] src/store-interface-filesystem.ts
     - [ ] Replace individual type imports with single import from types/index
     - [ ] Update import paths to remove .ts extensions
     - [ ] Verify no type errors
   - [ ] src/sync-client.ts
     - [ ] Replace individual type imports with single import from types/index
     - [ ] Update import paths to remove .ts extensions
     - [ ] Verify no type errors

3. **Type Files to Consolidate**
   - [x] src/types/store-options.ts
   - [x] src/types/save-item-params.ts
   - [x] src/types/delete-item-params.ts
   - [x] src/types/merge-item-to-list-params.ts
   - [x] src/types/get-item-params.ts
   - [x] src/types/clear-items-params.ts
   - [x] src/types/get-file-path-params.ts
   - [x] src/types/store-interface.ts
   - [x] src/types/extended-store-interface.ts
   - [x] src/types/sync-state.ts
   - [x] src/types/content-item.ts
   - [x] src/types/page-item.ts
   - [x] src/types/sitemap.ts
   - [x] src/types/content-list-result.ts
   - [x] src/types/agility-client.ts
   - [x] src/types/sync-context.ts
   - [x] src/types/sync-content-response.ts
   - [x] src/types/sync-pages-response.ts
   - [x] src/types/client-config.ts
   - [x] src/types/client-object.ts
   - [x] src/types/store.ts

## Progress

### Phase 1: Create Type Index
- [x] Create index.ts
- [x] Export all types
- [x] Verify exports

### Phase 2: Update Imports
- [x] Update method files
  - [x] syncContent.ts
  - [x] runSync.ts
  - [x] syncPages.ts
- [ ] Update store interface files
  - [ ] store-interface-console.ts
  - [ ] store-interface-filesystem.ts
- [ ] Update client files
  - [ ] sync-client.ts

### Phase 3: Testing
- [ ] Run type checks
  - [ ] After each file update
  - [ ] After all files updated
- [ ] Run tests
  - [ ] After each file update
  - [ ] After all files updated
- [ ] Verify no regressions
  - [ ] Check all functionality
  - [ ] Verify type safety

## Notes
- Keep original type files for now
- Update imports gradually
- Test after each major change
- Consider removing original type files after successful migration
- Order of updates:
  1. Core sync methods (syncContent, runSync, syncPages)
  2. Store interfaces (console, filesystem)
  3. Client implementation
- Testing strategy:
  1. Run type check after each file update
  2. Run tests for updated file
  3. Run full test suite after all updates
  4. Verify no regressions in functionality
