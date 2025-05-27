import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { initAnalytics } from '@/lib/analytics';
import { logError } from '@/utils/debugPanel';

// Simple MSW provider component
const MSWProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const initMocks = async () => {
      if (process.env.NODE_ENV === 'development') {
        try {
          const { worker } = await import('@/mocks/browser');
          await worker.start({
            onUnhandledRequest: 'bypass',
            serviceWorker: {
              url: '/mockServiceWorker.js',
            },
          });
          console.log('MSW worker started');
        } catch (error) {
          console.error('Failed to start MSW worker', error);
        }
      }
      setReady(true);
    };

    initMocks();
  }, []);

  if (!ready) {
    return <div>Loading mock service worker...</div>;
  }

  return <>{children}</>;
};

// Add window loaded event to help debug loading issues
window.addEventListener('load', () => {
  console.log('[CropGenius] Window loaded successfully');
});

// Initialize analytics
initAnalytics();

// Log that main.tsx is being executed
console.log('[CropGenius] main.tsx is executing');

// Track app load time
const appStartTime = performance.now();

const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error('[CropGenius] Failed to find the root element');
  throw new Error('Failed to find the root element');
}

// Start rendering the app
console.log('[CropGenius] Mounting React app');
ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <MSWProvider>
        <App />
      </MSWProvider>
    </BrowserRouter>
  </React.StrictMode>
);

// Log when the app is rendered
const appLoadTime = performance.now() - appStartTime;
console.log(`[CropGenius] React app mounted in ${appLoadTime.toFixed(2)}ms`);

// Log app load performance
console.log('App loaded with performance metrics:', {
  load_time: appLoadTime,
  user_agent: navigator.userAgent,
  screen_resolution: `${window.screen.width}x${window.screen.height}`,
});

// Global error handler for uncaught errors
window.addEventListener('error', (event) => {
  const error = event.error || new Error(event.message);
  logError({
    type: 'global-error',
    severity: 'error',
    message: error.message,
    stack: error.stack,
    origin: event.filename,
    context: {
      line: event.lineno,
      column: event.colno,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    },
  });
  
  if (analytics) {
    analytics.capture('error_occurred', {
      message: error.message,
      type: 'unhandled_error',
      file: event.filename,
      line: event.lineno,
      column: event.colno,
    });
  }
});
