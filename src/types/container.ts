/**
 * Interface defining a container in Agility CMS
 */
export interface Container {
    /**
     * The unique identifier for the container
     */
    containerID: number;

    /**
     * The reference name of the container
     */
    referenceName: string;

    /**
     * The name of the container
     */
    name: string;

    /**
     * Additional properties of the container
     */
    properties: {
        /**
         * Dynamic index signature to allow for flexible properties
         */
        [key: string]: any;
    };
} 