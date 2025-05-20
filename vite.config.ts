import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    // This will be the base URL for all assets
    base: './', // Use relative paths for better compatibility
    
    // Development server configuration
    server: {
      host: "0.0.0.0", // Listen on all network interfaces
      port: 8080,
      strictPort: true, // Exit if port is already in use
      open: true, // Open the browser on server start
    },
    
    // Preview server configuration
    preview: {
      port: 8080,
      strictPort: true,
    },
    
    // Build configuration
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: mode === 'development', // Enable source maps in development
      minify: mode === 'production' ? 'esbuild' : false, // Minify in production only
      emptyOutDir: true,
      rollupOptions: {
        input: {
          app: path.resolve(__dirname, 'index.html'),
        },
        output: {
          // Ensure consistent chunk naming
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: 'assets/[ext]/[name]-[hash][extname]'
        }
      },
      // Force Vite to generate JS files even with TypeScript errors
      commonjsOptions: {
        transformMixedEsModules: true,
      }
    },
    
    // Plugins
    plugins: [
      react({
        // Enable Fast Refresh (enabled by default in @vitejs/plugin-react-swc)
      }),
      mode === 'development' && componentTagger(),
    ].filter(Boolean),
    
    // Module resolution
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    
    // CSS configuration
    css: {
      devSourcemap: mode === 'development',
      modules: {
        generateScopedName: mode === 'development' 
          ? '[name]__[local]__[hash:base64:5]' 
          : '[hash:base64:5]'
      },
      preprocessorOptions: {
        scss: {
          // Add global SCSS variables/mixins here if needed
          additionalData: `@import "@/styles/variables.scss";`
        }
      }
    },
    
    // Environment variables
    define: {
      'process.env': { ...process.env, ...env },
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    },
    
    // Optimize dependencies
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        '@tanstack/react-query',
        '@emotion/react',
        '@emotion/styled'
      ],
      exclude: ['lovable-tagger'],
      esbuildOptions: {
        // Target ES2020 for better performance
        target: 'es2020',
        // Add global names for external dependencies
        define: {
          global: 'globalThis',
        },
        // Add support for JSX in dependencies
        loader: {
          '.js': 'jsx',
        },
      },
    },
  };
});
