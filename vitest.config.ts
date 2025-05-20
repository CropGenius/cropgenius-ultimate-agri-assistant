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
    setupFiles: ['./src/test/setup.ts'],
    exclude: [...configDefaults.exclude, '**/e2e/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        '**/node_modules/**',
        '**/test/**',
        '**/*.d.ts',
        '**/*.test.{ts,tsx}',
        '**/*.config.*',
        '**/src/test/**',
        '**/src/types/**',
      ],
      // Coverage thresholds are configured directly within the c8/istanbul options
      all: true,  // Include all files, not just the ones with tests
      perFile: true, // Apply thresholds per-file
      lines: 80,
      functions: 80,
      branches: 80,
      statements: 80
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});
