declare module 'proper-lockfile' {
    export function lockSync(file: string): void;
    export function unlockSync(file: string): void;
    export function checkSync(file: string): boolean;
    export function check(file: string): Promise<boolean>;
} 