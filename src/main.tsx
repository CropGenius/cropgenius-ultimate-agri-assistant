import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

// Add window loaded event to help debug loading issues
window.addEventListener('load', () => {
  console.log('[CropGenius] Window loaded successfully');
});

// Log that main.tsx is being executed
console.log('[CropGenius] main.tsx is executing');

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
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

// Log when the app is rendered
console.log('[CropGenius] React app mounted');
