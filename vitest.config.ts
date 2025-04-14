import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
        testTimeout: 120000, // 120 seconds
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            exclude: [
                'node_modules/',
                'dist/',
                '**/*.d.ts',
                '**/*.test.ts',
                '**/*.spec.ts',
            ],
        },
        include: ['src/**/*.test.ts', 'src/**/*.spec.ts', 'test/**/*.js'],
        setupFiles: ['./test/setup.ts'],
    },
}); 