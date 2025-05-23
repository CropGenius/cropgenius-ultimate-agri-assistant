// vite.config.ts
import { defineConfig, loadEnv } from "file:///C:/cropgenius-ultimate-agri-assistant/node_modules/vite/dist/node/index.js";
import react from "file:///C:/cropgenius-ultimate-agri-assistant/node_modules/@vitejs/plugin-react-swc/index.mjs";
import path from "path";
import { componentTagger } from "file:///C:/cropgenius-ultimate-agri-assistant/node_modules/lovable-tagger/dist/index.js";
var __vite_injected_original_dirname = "C:\\cropgenius-ultimate-agri-assistant";
var vite_config_default = defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    // This will be the base URL for all assets
    base: "./",
    // Use relative paths for better compatibility
    // Development server configuration
    server: {
      host: "0.0.0.0",
      // Listen on all network interfaces
      port: 8080,
      strictPort: true,
      // Exit if port is already in use
      open: true
      // Open the browser on server start
    },
    // Preview server configuration
    preview: {
      port: 8080,
      strictPort: true
    },
    // Build configuration
    build: {
      outDir: "dist",
      assetsDir: "assets",
      sourcemap: mode === "development",
      // Enable source maps in development
      minify: mode === "production" ? "esbuild" : false,
      // Minify in production only
      emptyOutDir: true,
      rollupOptions: {
        input: {
          app: path.resolve(__vite_injected_original_dirname, "index.html")
        },
        output: {
          // Ensure consistent chunk naming
          chunkFileNames: "assets/js/[name]-[hash].js",
          entryFileNames: "assets/js/[name]-[hash].js",
          assetFileNames: "assets/[ext]/[name]-[hash][extname]"
        }
      },
      // Force Vite to generate JS files even with TypeScript errors
      commonjsOptions: {
        transformMixedEsModules: true
      }
    },
    // Plugins
    plugins: [
      react({
        // Enable Fast Refresh (enabled by default in @vitejs/plugin-react-swc)
      }),
      mode === "development" && componentTagger()
    ].filter(Boolean),
    // Module resolution
    resolve: {
      alias: {
        "@": path.resolve(__vite_injected_original_dirname, "./src")
      }
    },
    // CSS configuration
    css: {
      devSourcemap: mode === "development",
      modules: {
        generateScopedName: mode === "development" ? "[name]__[local]__[hash:base64:5]" : "[hash:base64:5]"
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
      "process.env": { ...process.env, ...env },
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version)
    },
    // Optimize dependencies
    optimizeDeps: {
      include: [
        "react",
        "react-dom",
        "@tanstack/react-query",
        "@emotion/react",
        "@emotion/styled"
      ],
      exclude: ["lovable-tagger"],
      esbuildOptions: {
        // Target ES2020 for better performance
        target: "es2020",
        // Add global names for external dependencies
        define: {
          global: "globalThis"
        },
        // Add support for JSX in dependencies
        loader: {
          ".js": "jsx"
        }
      }
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxjcm9wZ2VuaXVzLXVsdGltYXRlLWFncmktYXNzaXN0YW50XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxjcm9wZ2VuaXVzLXVsdGltYXRlLWFncmktYXNzaXN0YW50XFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9jcm9wZ2VuaXVzLXVsdGltYXRlLWFncmktYXNzaXN0YW50L3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnLCBsb2FkRW52IH0gZnJvbSBcInZpdGVcIjtcclxuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdC1zd2NcIjtcclxuaW1wb3J0IHBhdGggZnJvbSBcInBhdGhcIjtcclxuaW1wb3J0IHsgY29tcG9uZW50VGFnZ2VyIH0gZnJvbSBcImxvdmFibGUtdGFnZ2VyXCI7XHJcblxyXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKHsgbW9kZSB9KSA9PiB7XHJcbiAgLy8gTG9hZCBlbnYgZmlsZSBiYXNlZCBvbiBgbW9kZWAgaW4gdGhlIGN1cnJlbnQgZGlyZWN0b3J5LlxyXG4gIC8vIFNldCB0aGUgdGhpcmQgcGFyYW1ldGVyIHRvICcnIHRvIGxvYWQgYWxsIGVudiByZWdhcmRsZXNzIG9mIHRoZSBgVklURV9gIHByZWZpeC5cclxuICBjb25zdCBlbnYgPSBsb2FkRW52KG1vZGUsIHByb2Nlc3MuY3dkKCksICcnKTtcclxuICBcclxuICByZXR1cm4ge1xyXG4gICAgLy8gVGhpcyB3aWxsIGJlIHRoZSBiYXNlIFVSTCBmb3IgYWxsIGFzc2V0c1xyXG4gICAgYmFzZTogJy4vJywgLy8gVXNlIHJlbGF0aXZlIHBhdGhzIGZvciBiZXR0ZXIgY29tcGF0aWJpbGl0eVxyXG4gICAgXHJcbiAgICAvLyBEZXZlbG9wbWVudCBzZXJ2ZXIgY29uZmlndXJhdGlvblxyXG4gICAgc2VydmVyOiB7XHJcbiAgICAgIGhvc3Q6IFwiMC4wLjAuMFwiLCAvLyBMaXN0ZW4gb24gYWxsIG5ldHdvcmsgaW50ZXJmYWNlc1xyXG4gICAgICBwb3J0OiA4MDgwLFxyXG4gICAgICBzdHJpY3RQb3J0OiB0cnVlLCAvLyBFeGl0IGlmIHBvcnQgaXMgYWxyZWFkeSBpbiB1c2VcclxuICAgICAgb3BlbjogdHJ1ZSwgLy8gT3BlbiB0aGUgYnJvd3NlciBvbiBzZXJ2ZXIgc3RhcnRcclxuICAgIH0sXHJcbiAgICBcclxuICAgIC8vIFByZXZpZXcgc2VydmVyIGNvbmZpZ3VyYXRpb25cclxuICAgIHByZXZpZXc6IHtcclxuICAgICAgcG9ydDogODA4MCxcclxuICAgICAgc3RyaWN0UG9ydDogdHJ1ZSxcclxuICAgIH0sXHJcbiAgICBcclxuICAgIC8vIEJ1aWxkIGNvbmZpZ3VyYXRpb25cclxuICAgIGJ1aWxkOiB7XHJcbiAgICAgIG91dERpcjogJ2Rpc3QnLFxyXG4gICAgICBhc3NldHNEaXI6ICdhc3NldHMnLFxyXG4gICAgICBzb3VyY2VtYXA6IG1vZGUgPT09ICdkZXZlbG9wbWVudCcsIC8vIEVuYWJsZSBzb3VyY2UgbWFwcyBpbiBkZXZlbG9wbWVudFxyXG4gICAgICBtaW5pZnk6IG1vZGUgPT09ICdwcm9kdWN0aW9uJyA/ICdlc2J1aWxkJyA6IGZhbHNlLCAvLyBNaW5pZnkgaW4gcHJvZHVjdGlvbiBvbmx5XHJcbiAgICAgIGVtcHR5T3V0RGlyOiB0cnVlLFxyXG4gICAgICByb2xsdXBPcHRpb25zOiB7XHJcbiAgICAgICAgaW5wdXQ6IHtcclxuICAgICAgICAgIGFwcDogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJ2luZGV4Lmh0bWwnKSxcclxuICAgICAgICB9LFxyXG4gICAgICAgIG91dHB1dDoge1xyXG4gICAgICAgICAgLy8gRW5zdXJlIGNvbnNpc3RlbnQgY2h1bmsgbmFtaW5nXHJcbiAgICAgICAgICBjaHVua0ZpbGVOYW1lczogJ2Fzc2V0cy9qcy9bbmFtZV0tW2hhc2hdLmpzJyxcclxuICAgICAgICAgIGVudHJ5RmlsZU5hbWVzOiAnYXNzZXRzL2pzL1tuYW1lXS1baGFzaF0uanMnLFxyXG4gICAgICAgICAgYXNzZXRGaWxlTmFtZXM6ICdhc3NldHMvW2V4dF0vW25hbWVdLVtoYXNoXVtleHRuYW1lXSdcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIC8vIEZvcmNlIFZpdGUgdG8gZ2VuZXJhdGUgSlMgZmlsZXMgZXZlbiB3aXRoIFR5cGVTY3JpcHQgZXJyb3JzXHJcbiAgICAgIGNvbW1vbmpzT3B0aW9uczoge1xyXG4gICAgICAgIHRyYW5zZm9ybU1peGVkRXNNb2R1bGVzOiB0cnVlLFxyXG4gICAgICB9XHJcbiAgICB9LFxyXG4gICAgXHJcbiAgICAvLyBQbHVnaW5zXHJcbiAgICBwbHVnaW5zOiBbXHJcbiAgICAgIHJlYWN0KHtcclxuICAgICAgICAvLyBFbmFibGUgRmFzdCBSZWZyZXNoIChlbmFibGVkIGJ5IGRlZmF1bHQgaW4gQHZpdGVqcy9wbHVnaW4tcmVhY3Qtc3djKVxyXG4gICAgICB9KSxcclxuICAgICAgbW9kZSA9PT0gJ2RldmVsb3BtZW50JyAmJiBjb21wb25lbnRUYWdnZXIoKSxcclxuICAgIF0uZmlsdGVyKEJvb2xlYW4pLFxyXG4gICAgXHJcbiAgICAvLyBNb2R1bGUgcmVzb2x1dGlvblxyXG4gICAgcmVzb2x2ZToge1xyXG4gICAgICBhbGlhczoge1xyXG4gICAgICAgIFwiQFwiOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcIi4vc3JjXCIpLFxyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIFxyXG4gICAgLy8gQ1NTIGNvbmZpZ3VyYXRpb25cclxuICAgIGNzczoge1xyXG4gICAgICBkZXZTb3VyY2VtYXA6IG1vZGUgPT09ICdkZXZlbG9wbWVudCcsXHJcbiAgICAgIG1vZHVsZXM6IHtcclxuICAgICAgICBnZW5lcmF0ZVNjb3BlZE5hbWU6IG1vZGUgPT09ICdkZXZlbG9wbWVudCcgXHJcbiAgICAgICAgICA/ICdbbmFtZV1fX1tsb2NhbF1fX1toYXNoOmJhc2U2NDo1XScgXHJcbiAgICAgICAgICA6ICdbaGFzaDpiYXNlNjQ6NV0nXHJcbiAgICAgIH0sXHJcbiAgICAgIHByZXByb2Nlc3Nvck9wdGlvbnM6IHtcclxuICAgICAgICBzY3NzOiB7XHJcbiAgICAgICAgICAvLyBBZGQgZ2xvYmFsIFNDU1MgdmFyaWFibGVzL21peGlucyBoZXJlIGlmIG5lZWRlZFxyXG4gICAgICAgICAgYWRkaXRpb25hbERhdGE6IGBAaW1wb3J0IFwiQC9zdHlsZXMvdmFyaWFibGVzLnNjc3NcIjtgXHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9LFxyXG4gICAgXHJcbiAgICAvLyBFbnZpcm9ubWVudCB2YXJpYWJsZXNcclxuICAgIGRlZmluZToge1xyXG4gICAgICAncHJvY2Vzcy5lbnYnOiB7IC4uLnByb2Nlc3MuZW52LCAuLi5lbnYgfSxcclxuICAgICAgX19BUFBfVkVSU0lPTl9fOiBKU09OLnN0cmluZ2lmeShwcm9jZXNzLmVudi5ucG1fcGFja2FnZV92ZXJzaW9uKSxcclxuICAgIH0sXHJcbiAgICBcclxuICAgIC8vIE9wdGltaXplIGRlcGVuZGVuY2llc1xyXG4gICAgb3B0aW1pemVEZXBzOiB7XHJcbiAgICAgIGluY2x1ZGU6IFtcclxuICAgICAgICAncmVhY3QnLFxyXG4gICAgICAgICdyZWFjdC1kb20nLFxyXG4gICAgICAgICdAdGFuc3RhY2svcmVhY3QtcXVlcnknLFxyXG4gICAgICAgICdAZW1vdGlvbi9yZWFjdCcsXHJcbiAgICAgICAgJ0BlbW90aW9uL3N0eWxlZCdcclxuICAgICAgXSxcclxuICAgICAgZXhjbHVkZTogWydsb3ZhYmxlLXRhZ2dlciddLFxyXG4gICAgICBlc2J1aWxkT3B0aW9uczoge1xyXG4gICAgICAgIC8vIFRhcmdldCBFUzIwMjAgZm9yIGJldHRlciBwZXJmb3JtYW5jZVxyXG4gICAgICAgIHRhcmdldDogJ2VzMjAyMCcsXHJcbiAgICAgICAgLy8gQWRkIGdsb2JhbCBuYW1lcyBmb3IgZXh0ZXJuYWwgZGVwZW5kZW5jaWVzXHJcbiAgICAgICAgZGVmaW5lOiB7XHJcbiAgICAgICAgICBnbG9iYWw6ICdnbG9iYWxUaGlzJyxcclxuICAgICAgICB9LFxyXG4gICAgICAgIC8vIEFkZCBzdXBwb3J0IGZvciBKU1ggaW4gZGVwZW5kZW5jaWVzXHJcbiAgICAgICAgbG9hZGVyOiB7XHJcbiAgICAgICAgICAnLmpzJzogJ2pzeCcsXHJcbiAgICAgICAgfSxcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgfTtcclxufSk7XHJcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBcVMsU0FBUyxjQUFjLGVBQWU7QUFDM1UsT0FBTyxXQUFXO0FBQ2xCLE9BQU8sVUFBVTtBQUNqQixTQUFTLHVCQUF1QjtBQUhoQyxJQUFNLG1DQUFtQztBQU16QyxJQUFPLHNCQUFRLGFBQWEsQ0FBQyxFQUFFLEtBQUssTUFBTTtBQUd4QyxRQUFNLE1BQU0sUUFBUSxNQUFNLFFBQVEsSUFBSSxHQUFHLEVBQUU7QUFFM0MsU0FBTztBQUFBO0FBQUEsSUFFTCxNQUFNO0FBQUE7QUFBQTtBQUFBLElBR04sUUFBUTtBQUFBLE1BQ04sTUFBTTtBQUFBO0FBQUEsTUFDTixNQUFNO0FBQUEsTUFDTixZQUFZO0FBQUE7QUFBQSxNQUNaLE1BQU07QUFBQTtBQUFBLElBQ1I7QUFBQTtBQUFBLElBR0EsU0FBUztBQUFBLE1BQ1AsTUFBTTtBQUFBLE1BQ04sWUFBWTtBQUFBLElBQ2Q7QUFBQTtBQUFBLElBR0EsT0FBTztBQUFBLE1BQ0wsUUFBUTtBQUFBLE1BQ1IsV0FBVztBQUFBLE1BQ1gsV0FBVyxTQUFTO0FBQUE7QUFBQSxNQUNwQixRQUFRLFNBQVMsZUFBZSxZQUFZO0FBQUE7QUFBQSxNQUM1QyxhQUFhO0FBQUEsTUFDYixlQUFlO0FBQUEsUUFDYixPQUFPO0FBQUEsVUFDTCxLQUFLLEtBQUssUUFBUSxrQ0FBVyxZQUFZO0FBQUEsUUFDM0M7QUFBQSxRQUNBLFFBQVE7QUFBQTtBQUFBLFVBRU4sZ0JBQWdCO0FBQUEsVUFDaEIsZ0JBQWdCO0FBQUEsVUFDaEIsZ0JBQWdCO0FBQUEsUUFDbEI7QUFBQSxNQUNGO0FBQUE7QUFBQSxNQUVBLGlCQUFpQjtBQUFBLFFBQ2YseUJBQXlCO0FBQUEsTUFDM0I7QUFBQSxJQUNGO0FBQUE7QUFBQSxJQUdBLFNBQVM7QUFBQSxNQUNQLE1BQU07QUFBQTtBQUFBLE1BRU4sQ0FBQztBQUFBLE1BQ0QsU0FBUyxpQkFBaUIsZ0JBQWdCO0FBQUEsSUFDNUMsRUFBRSxPQUFPLE9BQU87QUFBQTtBQUFBLElBR2hCLFNBQVM7QUFBQSxNQUNQLE9BQU87QUFBQSxRQUNMLEtBQUssS0FBSyxRQUFRLGtDQUFXLE9BQU87QUFBQSxNQUN0QztBQUFBLElBQ0Y7QUFBQTtBQUFBLElBR0EsS0FBSztBQUFBLE1BQ0gsY0FBYyxTQUFTO0FBQUEsTUFDdkIsU0FBUztBQUFBLFFBQ1Asb0JBQW9CLFNBQVMsZ0JBQ3pCLHFDQUNBO0FBQUEsTUFDTjtBQUFBLE1BQ0EscUJBQXFCO0FBQUEsUUFDbkIsTUFBTTtBQUFBO0FBQUEsVUFFSixnQkFBZ0I7QUFBQSxRQUNsQjtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUE7QUFBQSxJQUdBLFFBQVE7QUFBQSxNQUNOLGVBQWUsRUFBRSxHQUFHLFFBQVEsS0FBSyxHQUFHLElBQUk7QUFBQSxNQUN4QyxpQkFBaUIsS0FBSyxVQUFVLFFBQVEsSUFBSSxtQkFBbUI7QUFBQSxJQUNqRTtBQUFBO0FBQUEsSUFHQSxjQUFjO0FBQUEsTUFDWixTQUFTO0FBQUEsUUFDUDtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxNQUNGO0FBQUEsTUFDQSxTQUFTLENBQUMsZ0JBQWdCO0FBQUEsTUFDMUIsZ0JBQWdCO0FBQUE7QUFBQSxRQUVkLFFBQVE7QUFBQTtBQUFBLFFBRVIsUUFBUTtBQUFBLFVBQ04sUUFBUTtBQUFBLFFBQ1Y7QUFBQTtBQUFBLFFBRUEsUUFBUTtBQUFBLFVBQ04sT0FBTztBQUFBLFFBQ1Q7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
