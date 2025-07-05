// MIME Type Fix for JavaScript Modules
(function() {
  'use strict';
  
  // Override fetch to fix MIME types
  const originalFetch = window.fetch;
  window.fetch = function(input, init) {
    return originalFetch(input, init).then(response => {
      const url = typeof input === 'string' ? input : input.url;
      
      // Fix JavaScript module MIME types
      if (url && (url.endsWith('.js') || url.endsWith('.mjs') || url.includes('assets/'))) {
        const headers = new Headers(response.headers);
        headers.set('Content-Type', 'application/javascript; charset=utf-8');
        
        return response.blob().then(blob => {
          return new Response(blob, {
            status: response.status,
            statusText: response.statusText,
            headers: headers
          });
        });
      }
      
      return response;
    });
  };
  
  // Fix dynamic imports
  const originalImport = window.__vitePreload || function() {};
  window.__vitePreload = function(baseModule, deps) {
    return originalImport.call(this, baseModule, deps).catch(error => {
      console.warn('Import failed, retrying:', error);
      return originalImport.call(this, baseModule, deps);
    });
  };
})();