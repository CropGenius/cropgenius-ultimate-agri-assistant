/// <reference types="vitest" />
/// <reference types="vite/client" />

import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';
import url from 'url';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/tests/setupTests.ts'],
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules', 'src/**/*.d.ts', 'src/**/*.tsx']
    }
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
