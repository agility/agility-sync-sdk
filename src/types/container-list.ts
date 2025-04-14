import { Container } from './container';

/**
 * Interface defining a list of containers with pagination information.
 */
export interface ContainerList {
    /**
     * Array of containers in the current page
     */
    items: Container[];

    /**
     * Total number of containers available across all pages
     */
    totalCount: number;
} 