import agility from '@agility/content-fetch';
import syncContent from './methods/syncContent';
import clearSync from './methods/clearSync';
import syncPages from './methods/syncPages';
import runSync from './methods/runSync';
import storeInterfaceFileSystem from './store-interface-filesystem';
import { ExtendedStoreInterface } from './types/extended-store-interface';

export interface SyncClientConfig {
  baseUrl?: string | null;
  isPreview?: boolean;
  guid: string;
  apiKey: string;
  languages?: string[];
  channels?: string[];
  debug?: boolean;
  logLevel?: string;
  store?: {
    interface: typeof storeInterfaceFileSystem;
    options: {
      rootPath: string;
    };
  };
}

export interface SyncClient {
  config: SyncClientConfig;
  agilityClient: any; // TODO: Import proper type from @agility/content-fetch
  syncContent: typeof syncContent;
  syncPages: typeof syncPages;
  clearSync: typeof clearSync;
  runSync: typeof runSync;
  store: ExtendedStoreInterface;
}

const defaultConfig: SyncClientConfig = {
  baseUrl: null,
  isPreview: false,
  guid: '',
  apiKey: '',
  languages: [],
  channels: [],
  debug: false,
  logLevel: 'warning',
  store: {
    interface: storeInterfaceFileSystem,
    options: {
      rootPath: '.agility-files'
    }
  }
};

function validateConfigParams(configParams: Partial<SyncClientConfig>): void {
  if (!configParams.guid || configParams.guid.length === 0) {
    throw new TypeError('You must provide a guid.');
  } else if (!configParams.apiKey || configParams.apiKey.length === 0) {
    throw new TypeError('You must provide an access token.');
  }
}

function createSyncClient(userConfig: Partial<SyncClientConfig>): SyncClient {
  const config: SyncClientConfig = {
    ...defaultConfig,
    ...userConfig,
    store: {
      interface: userConfig.store?.interface || defaultConfig.store!.interface,
      options: {
        ...defaultConfig.store!.options,
        ...(userConfig.store?.options || {})
      }
    }
  };

  process.env.AGILITY_LOG_LEVEL = config.logLevel;

  const agilityClient = agility.getApi({
    guid: config.guid,
    apiKey: config.apiKey,
    isPreview: config.isPreview,
    debug: config.debug,
    baseUrl: config.baseUrl
  });

  // Initialize the store with the provided interface and options
  const store = config.store!.interface;
  store.setOptions(config.store!.options);

  return {
    config,
    agilityClient,
    syncContent,
    syncPages,
    clearSync,
    runSync,
    store
  };
}

export function getSyncClient(userConfig: Partial<SyncClientConfig>): SyncClient {
  validateConfigParams(userConfig);
  return createSyncClient(userConfig);
}

export default { getSyncClient }; 