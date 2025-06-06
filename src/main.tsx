import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { initOfflineSync } from './services/offlineSyncService';
import './index.css';

// Immediately initialize the app without any async delays
const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error('Root element not found! Creating one...');
  const newRoot = document.createElement('div');
  newRoot.id = 'root';
  document.body.appendChild(newRoot);
  createRoot(newRoot).render(<App />);
} else {
  // Instant render with no loading screens
  createRoot(rootElement).render(<App />);
}

// Register service worker without blocking main thread
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('ServiceWorker registered with scope:', registration.scope);
        // Initialize offline sync after service worker is ready
        initOfflineSync().catch((syncError) => {
          console.error('Offline sync initialization failed:', syncError);
        });
      })
      .catch((error) => {
        console.error('ServiceWorker registration failed:', error);
      });
  });
}
