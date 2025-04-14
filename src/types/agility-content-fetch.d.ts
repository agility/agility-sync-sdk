declare module '@agility/content-fetch' {
    interface AgilityConfig {
        guid: string;
        apiKey: string;
        isPreview?: boolean;
        debug?: boolean;
        baseUrl?: string | null;
    }

    interface AgilityClient {
        getSyncContent: (params: { syncToken: number; pageSize: number; languageCode: string }) => Promise<any>;
        getSyncPages: (params: { syncToken: number; pageSize: number; languageCode: string }) => Promise<any>;
        getContentItem: (params: { contentID: number; languageCode: string }) => Promise<any>;
        getContentList: (params: { referenceName: string; languageCode: string }) => Promise<any>;
        getPage: (params: { pageID: number; languageCode: string }) => Promise<any>;
        getSitemap: (params: { channelName: string; languageCode: string }) => Promise<any>;
        getSitemapNested: (params: { channelName: string; languageCode: string }) => Promise<any>;
        getUrlRedirections: (params: { languageCode: string }) => Promise<any>;
    }

    export function getApi(config: AgilityConfig): AgilityClient;
    export default { getApi };
} 