/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { configDefaults } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test-utils/setup.ts'],
    exclude: [...configDefaults.exclude, '**/e2e/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      exclude: [
        '**/node_modules/**',
        '**/test/**',
        '**/*.d.ts',
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}',
        '**/*.config.*',
        '**/src/test-utils/**',
        '**/src/types/**',
        '**/src/**/*.stories.{ts,tsx}',
        '**/src/main.tsx',
        '**/src/App.tsx',
        '**/src/vite-env.d.ts',
      ],
      // Coverage thresholds
      all: true,
      perFile: true,
      lines: 80,
      functions: 80,
      branches: 80,
      statements: 80,
    },
    // Mock timers
    fakeTimers: {
      toFake: [
        'setTimeout',
        'setInterval',
        'clearInterval',
        'clearTimeout',
        'Date',
        'requestAnimationFrame',
        'cancelAnimationFrame',
        'hrtime',
      ],
    },
    // Test timeout
    testTimeout: 30000,
    // Watch mode
    watch: false,
    // UI mode
    ui: false,
    // Enable threads for faster tests
    threads: true,
    // Isolate environment for each test file
    isolate: true,
    // Force Rerun tests on watch mode
    passWithNoTests: true,
  },
  resolve: {
    alias: [
      {
        find: '@',
        replacement: resolve(__dirname, './src'),
      },
    ],
  },
  // Optimize deps for testing
  optimizeDeps: {
    include: ['@testing-library/react'],
  },
});
