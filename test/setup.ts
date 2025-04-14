import { vi } from 'vitest';

// Mock the fs module
vi.mock('fs', () => ({
    default: {
        existsSync: vi.fn(),
        mkdirSync: vi.fn(),
        writeFileSync: vi.fn(),
        readFileSync: vi.fn(),
        unlinkSync: vi.fn(),
        rmSync: vi.fn(),
    },
}));

// Mock the path module
vi.mock('path', () => ({
    default: {
        join: vi.fn(),
        dirname: vi.fn(),
    },
}));

// Mock the proper-lockfile module
vi.mock('proper-lockfile', () => ({
    lockSync: vi.fn(),
    unlockSync: vi.fn(),
    checkSync: vi.fn(),
    check: vi.fn(),
})); 