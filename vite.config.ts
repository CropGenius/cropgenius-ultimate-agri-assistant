import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import { resolve } from 'path';
import fs from 'fs';

// Custom plugin to ensure proper MIME types
const fixMimeTypes = () => ({
  name: 'fix-mime-types',
  configureServer(server: any) {
    server.middlewares.use((req: any, res: any, next: () => void) => {
      // Proper MIME types for JavaScript modules
      if (req.url?.endsWith('.js') || req.url?.endsWith('.mjs') || req.url?.endsWith('.tsx') || req.url?.endsWith('.ts')) {
        res.setHeader('Content-Type', 'application/javascript');
      }
      next();
    });
  }
});

export default defineConfig({
  plugins: [
    fixMimeTypes(),
    react({
      babel: {
        plugins: [
          ['@babel/plugin-transform-react-jsx', { runtime: 'automatic' }],
        ],
      },
      // Ensure instant loading with no loading screens
      // fastRefresh option removed as it's not supported
    }),
    tsconfigPaths(),
  ],
  optimizeDeps: {
    // Force inclusion of all dependencies for faster loading
    include: ['react', 'react-dom', 'react-router-dom'],
    // Exclude problematic dependencies
    exclude: [],
  },
  esbuild: {
    // Ensure proper JSX handling
    jsxInject: `import React from 'react'`,
  },
  css: {
    // Optimize CSS for faster loading
    postcss: {}
  },
  server: {
    port: 3000,
    open: true,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  define: {
    'process.env': {},
  },
});
