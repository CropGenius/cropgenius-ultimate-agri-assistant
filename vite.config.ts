import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import { resolve } from 'path';
import mimeTypeFix from './vite-plugin-mime-fix.js';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'automatic',
      jsxImportSource: 'react'
    }),
    ...(process.env.ANALYZE ? [visualizer({ filename: 'dist/stats.html', gzipSize: true, brotliSize: true })] : []),
  ],
  base: './',
  server: {
    port: 3000,
    host: '0.0.0.0',
    strictPort: true,
    open: true,
    cors: true,
    middlewareMode: false,
    fs: {
      strict: false
    },
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  },
  preview: {
    port: 3000,
    strictPort: true,
    host: '0.0.0.0',
    cors: true,
    headers: {
      'Cache-Control': 'public, max-age=600',
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: false,
    target: 'es2020',
    rollupOptions: {
      output: {
        format: 'es',
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name][extname]',
      },
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
    esbuildOptions: {
      target: 'es2020',
      jsx: 'automatic',
    },
  },
  esbuild: {
    target: 'es2020',
  },
  assetsInclude: ['**/*.js', '**/*.mjs', '**/*.ts', '**/*.tsx'],
});
