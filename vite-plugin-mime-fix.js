// Vite plugin to fix MIME type issues
import { createFilter } from 'vite';

export default function viteMimeFixPlugin() {
  return {
    name: 'mime-fix',
    enforce: 'pre',
    
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url.endsWith('.js')) {
          res.setHeader('Content-Type', 'application/javascript');
        } else if (req.url.endsWith('.mjs')) {
          res.setHeader('Content-Type', 'application/javascript');
        } else if (req.url.endsWith('.wasm')) {
          res.setHeader('Content-Type', 'application/wasm');
        }
        next();
      });
    },
    
    transformIndexHtml(html) {
      return html.replace(
        /(<script\s+[^>]*type=["']?module["']?[^>]*>)/g,
        (match) => {
          if (!match.includes('type=')) {
            return match.replace('>', ' type="module">');
          }
          return match;
        }
      );
    },
    
    transform(code, id) {
      if (id.endsWith('.js') || id.endsWith('.mjs')) {
        return {
          code,
          map: null,
          moduleSideEffects: 'no-treeshake'
        };
      }
    }
  };
}
