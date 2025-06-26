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
    include: ['src/**/*.test.{ts,tsx}', 'src/**/*.spec.{ts,tsx}'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/**',
        '**/*.d.ts',
        '**/*.test.{ts,tsx}',
        '**/types.ts',
      ],
    },
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
    // Add support for React Testing Library and Vitest types
    deps: {
      inline: ['@testing-library/user-event', '@testing-library/react', '@testing-library/jest-dom'],
    },
    // Add type definitions
    typeCheck: true,
    esm: {
      namedExport: true,
    },
    css: false,
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
        replacement: fileURLToPath(new URL('./src/$1', import.meta.url)),
      },
    ],
    // Add support for React Testing Library
    deps: {
      inline: ['@testing-library/user-event'],
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});
