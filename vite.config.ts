import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import { resolve } from 'path';
import mimeTypeFix from './vite-plugin-mime-fix.js';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
  ],
  base: './',
  server: {
    port: 3000,
    open: true,
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
    sourcemap: true,
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

});
