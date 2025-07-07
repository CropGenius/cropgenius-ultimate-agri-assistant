import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
    open: true,
    headers: {
      'Content-Type': 'application/javascript; charset=utf-8'
    }
  },
  build: {
    rollupOptions: {
      output: {
        format: 'es',
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': ['@/components/ui'],
          'vendor-maps': ['mapbox-gl', 'react-map-gl'],
          'vendor-charts': ['recharts', 'chart.js'],
          'vendor-utils': ['@/utils'],
          'ai-agents': ['@/agents'],
          'dashboard-core': ['@/components/dashboard'],
          'field-management': ['@/features/fields'],
          'auth-system': ['@/features/auth'],
          'weather-system': ['@/features/weather']
        }
      }
    },
    target: 'es2018',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false,
        drop_debugger: true
      }
    },
    chunkSizeWarningLimit: 800,
    sourcemap: false
  }
})