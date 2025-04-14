import { ContentDefinition, ContentDefinitionList } from './content-definition.ts';
import { MediaAsset, MediaList } from './media-asset.ts';
import { MediaFolder, MediaFolderList } from './media-folder.ts';
import { MediaGallery } from './media-gallery.ts';
import { MediaGalleryList } from './media-gallery-list.ts';
import { Container } from './container.ts';
import { ContainerList } from './container-list.ts';
import { SyncContentResponse } from './sync-content-response.ts';
import { SyncPagesResponse } from './sync-pages-response.ts';

/**
 * Interface defining the Agility CMS client functionality.
 */
export interface AgilityClient {
    /**
     * Management API functionality
     */
    management: {
        /**
         * Gets a content definition by reference name
         * @param params - Parameters for getting the content definition
         * @param params.referenceName - The reference name of the content definition
         * @returns The content definition
         */
        getContentDefinition: (params: { 
            referenceName: string;
        }) => Promise<ContentDefinition>;

        /**
         * Gets a list of all content definitions
         * @returns The list of content definitions
         */
        getContentDefinitionList: () => Promise<ContentDefinitionList>;

        /**
         * Gets a list of media assets
         * @param params - Parameters for getting the media list
         * @param params.folderID - Optional folder ID to filter by
         * @param params.take - Number of items to take
         * @param params.skip - Number of items to skip
         * @returns The list of media assets
         */
        getMediaList: (params: { 
            folderID?: number;
            take?: number;
            skip?: number;
        }) => Promise<MediaList>;

        /**
         * Gets a list of media folders
         * @returns The list of media folders
         */
        getMediaFolderList: () => Promise<MediaFolderList>;

        /**
         * Gets a list of media galleries
         * @param params - Parameters for getting the media gallery list
         * @param params.take - Number of items to take
         * @param params.skip - Number of items to skip
         * @returns The list of media galleries
         */
        getMediaGalleryList: (params: { 
            take?: number;
            skip?: number;
        }) => Promise<MediaGalleryList>;

        /**
         * Gets a media gallery by ID
         * @param params - Parameters for getting the media gallery
         * @param params.galleryID - The ID of the media gallery
         * @returns The media gallery
         */
        getMediaGallery: (params: {
            galleryID: number;
        }) => Promise<MediaGallery>;

        /**
         * Gets a container by reference name
         * @param params - Parameters for getting the container
         * @param params.referenceName - The reference name of the container
         * @returns The container
         */
        getContainer: (params: { 
            referenceName: string;
        }) => Promise<Container>;

        /**
         * Gets a list of all containers
         * @returns The list of containers
         */
        getContainerList: () => Promise<ContainerList>;
    };

    /**
     * Gets sync content
     * @param params - Parameters for getting sync content
     * @param params.syncToken - The sync token
     * @param params.pageSize - The page size
     * @param params.languageCode - The language code
     * @returns The sync content response
     */
    getSyncContent: (params: {
        syncToken: number;
        pageSize: number;
        languageCode: string;
    }) => Promise<SyncContentResponse>;

    /**
     * Gets sync pages
     * @param params - Parameters for getting sync pages
     * @param params.syncToken - The sync token
     * @param params.pageSize - The page size
     * @param params.languageCode - The language code
     * @returns The sync pages response
     */
    getSyncPages: (params: {
        syncToken: number;
        pageSize: number;
        languageCode: string;
    }) => Promise<SyncPagesResponse>;
} 