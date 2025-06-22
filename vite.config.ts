import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Generate bundle visualization when ANALYZE=1 vite build
    ...(process.env.ANALYZE ? [visualizer({ filename: 'dist/stats.html', gzipSize: true, brotliSize: true })] : []),
  ],
  base: '/',
  server: {
    port: 3000,
    host: '0.0.0.0',
    strictPort: true,
    open: true,
    cors: true
  },
  preview: {
    port: 3000,
    strictPort: true,
    host: '0.0.0.0',
    cors: true
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
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
      output: {
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash][extname]',
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          supabase: ['@supabase/supabase-js'],
          mapbox: ['mapbox-gl', '@mapbox/mapbox-sdk'],
          analytics: ['posthog-js', '@sentry/react'],
          leaflet: ['leaflet', 'react-leaflet'],
          icons: ['lucide-react'],
        },
      },
      external: []
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
  },
  esbuild: {
    jsxInject: `import React from 'react'`,
  },
});
