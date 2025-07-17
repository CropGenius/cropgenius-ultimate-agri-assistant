/// <reference types="vitest" />
/// <reference types="vite/client" />

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'url';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/e2e/**'],
    
    // Enhanced coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov', 'clover'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/',
        'src/test/**',
        'src/test-utils/**',
        'src/test-assets/**',
        '**/*.d.ts',
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}',
        '**/types.ts',
        '**/index.ts',
        'src/main.tsx',
        'src/vite-env.d.ts',
        'src/setupTests.js',
        '**/__tests__/**',
        '**/__mocks__/**',
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
        // Critical components require higher coverage
        'src/components/market-data/**': {
          branches: 90,
          functions: 90,
          lines: 90,
          statements: 90,
        },
        'src/hooks/**': {
          branches: 85,
          functions: 85,
          lines: 85,
          statements: 85,
        },
        'src/utils/**': {
          branches: 95,
          functions: 95,
          lines: 95,
          statements: 95,
        },
      },
    },
    
    // Performance and timeout configuration
    testTimeout: 10000,
    hookTimeout: 10000,
    teardownTimeout: 5000,
    
    // Enhanced test environment
    alias: [
      {
        find: /^@\/(.*)/,
        replacement: fileURLToPath(new URL('./src/$1', import.meta.url)),
      },
    ],
    
    // Dependency optimization
    deps: {
      inline: [
        '@testing-library/user-event',
        '@testing-library/react',
        '@testing-library/jest-dom',
      ],
    },
    
    // Reporter configuration
    reporters: ['verbose', 'json', 'html'],
    outputFile: {
      json: './test-results/results.json',
      html: './test-results/index.html',
    },
    
    // Parallel execution
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false,
        isolate: true,
      },
    },
    
    // Watch mode configuration
    watchExclude: ['**/node_modules/**', '**/dist/**', '**/coverage/**'],
  },
  
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});
