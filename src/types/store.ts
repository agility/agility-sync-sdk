export interface StoreInterface {
  rootPath: string;
  init(): Promise<void>;
  getItem(key: string): Promise<any>;
  setItem(key: string, value: any): Promise<void>;
  removeItem(key: string): Promise<void>;
  clear(): Promise<void>;
  keys(): Promise<string[]>;
}

export interface SyncStatus {
  status: 'init' | 'progress' | 'done';
  current?: number;
  total?: number;
  filePath?: string;
}

export interface SyncOptions {
  rootPath: string;
  locale?: string;
  force?: boolean;
}

export interface SyncResult {
  success: boolean;
  error?: Error;
  stats?: {
    total: number;
    processed: number;
    errors: number;
  };
} 