import * as React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// Function to handle the root element and render the app
function renderApp() {
  const rootElement = document.getElementById('root');
  
  if (!rootElement) {
    console.error('Failed to find the root element');
    document.body.innerHTML = `
      <div style="
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        flex-direction: column;
        padding: 2rem;
        text-align: center;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      ">
        <h1 style="color: #ef4444; font-size: 1.5rem; margin-bottom: 1rem;">Application Error</h1>
        <p style="color: #4b5563; margin-bottom: 1.5rem;">
          Failed to initialize the application. The root element was not found.
        </p>
        <button 
          onclick="window.location.reload()" 
          style="
            background-color: #10b981;
            color: white;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 0.375rem;
            cursor: pointer;
            font-weight: 500;
          "
        >
          Reload Page
        </button>
      </div>
    `;
    return;
  }

  try {
    const root = createRoot(rootElement);
    root.render(<App />);
    
    // Remove any existing service worker registrations
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        for (const registration of registrations) {
          registration.unregister();
        }
      });
    }
  } catch (error) {
    console.error('Failed to render the application:', error);
    rootElement.innerHTML = `
      <div style="
        padding: 2rem;
        color: #ef4444;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      ">
        <h1>Application Error</h1>
        <p>${error instanceof Error ? error.message : 'An unknown error occurred'}</p>
        <button 
          onclick="window.location.reload()"
          style="
            margin-top: 1rem;
            padding: 0.5rem 1rem;
            background-color: #ef4444;
            color: white;
            border: none;
            border-radius: 0.375rem;
            cursor: pointer;
          "
        >
          Reload Page
        </button>
      </div>
    `;
  }
}

// Start the app when the DOM is fully loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderApp);
} else {
  renderApp();
}

// Add a global error handler
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error || event.message);
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});
