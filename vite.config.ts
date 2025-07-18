import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { componentTagger } from "lovable-tagger"

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [
      react(),
      mode === 'development' && componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": resolve(__dirname, "./src"),
      },
    },
    server: {
      host: "::",
      port: 8080,
      open: true,
      headers: {
        'Content-Type': 'application/javascript; charset=utf-8'
      }
    },
    build: {
      rollupOptions: {
        output: {
          format: 'es',
          // 🔥 NUCLEAR CACHE-BUSTING - FORCE NEW FILENAMES WITH TIMESTAMP
          entryFileNames: `[name]-${Date.now()}.js`,
          chunkFileNames: `[name]-${Date.now()}.js`,
          assetFileNames: `[name]-${Date.now()}.[ext]`
        }
      }
    },
    define: {
      'process.env': env
    }
  }
})