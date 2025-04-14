/**
 * Interface defining the configuration for a client in Agility CMS.
 */
export interface ClientConfig {
    /**
     * Array of language codes to sync
     */
    languages: string[];

    /**
     * Array of channel names to sync
     */
    channels: string[];

    /**
     * Whether to use preview mode
     */
    isPreview: boolean;
} 