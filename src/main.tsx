import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Immediately initialize the app without any async delays
const rootElement = document.getElementById("root");

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

// Service worker registration is now handled by Vite PWA plugin
