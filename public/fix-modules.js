// Fix module loading issues
(function() {
  // Force correct MIME types for JavaScript modules
  if ('serviceWorker' in navigator) {
    // Override fetch to ensure JavaScript modules are properly loaded
    const originalFetch = window.fetch;
    window.fetch = function(input, init) {
      return originalFetch(input, init).then(response => {
        // Clone the response to avoid consuming it
        const clonedResponse = response.clone();
        
        // Check if the response is for a JavaScript module
        const url = typeof input === 'string' ? input : input.url;
        if (url && (url.endsWith('.js') || url.endsWith('.mjs') || url.endsWith('.tsx'))) {
          // Create a new response with the correct MIME type
          return clonedResponse.blob().then(blob => {
            return new Response(blob, {
              status: clonedResponse.status,
              statusText: clonedResponse.statusText,
              headers: new Headers({
                'Content-Type': 'application/javascript',
                ...Object.fromEntries(clonedResponse.headers.entries())
              })
            });
          });
        }
        
        // Return the original response for non-JavaScript resources
        return response;
      });
    };
  }
  
  // Remove any loading indicators immediately
  window.addEventListener('DOMContentLoaded', () => {
    // Find and remove any loading screens or spinners
    const possibleLoaders = [
      'loading', 'loader', 'spinner', 'splash', 'progress'
    ];
    
    possibleLoaders.forEach(className => {
      const elements = document.querySelectorAll(`.${className}`);
      elements.forEach(el => {
        el.style.display = 'none';
        el.remove();
      });
    });
    
    // Force render the root app immediately
    const root = document.getElementById('root');
    if (root) {
      // Make sure root is visible
      root.style.display = 'block';
    }
  });
})();
