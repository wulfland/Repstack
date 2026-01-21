import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import './index.css';
import App from './App.tsx';
import { initializeDatabase } from './db/index.ts';

// Register service worker with auto-update
// When a new version is available, it will automatically reload the page
const updateSW = registerSW({
  onNeedRefresh() {
    // New content is available, reload to update
    if (confirm('New version available! Reload to update?')) {
      updateSW(true);
    }
  },
  onOfflineReady() {
    console.log('App ready to work offline');
  },
  onRegisteredSW(swUrl, registration) {
    // Check for updates every hour
    if (registration) {
      setInterval(() => {
        registration.update();
      }, 60 * 60 * 1000);
    }
    console.log('Service worker registered:', swUrl);
  },
});

// Initialize database with error recovery before rendering
initializeDatabase()
  .then(() => {
    createRoot(document.getElementById('root')!).render(
      <StrictMode>
        <App />
      </StrictMode>
    );
  })
  .catch((error) => {
    console.error('Failed to initialize database:', error);
    // Still render the app - it may show errors but at least shows something
    createRoot(document.getElementById('root')!).render(
      <StrictMode>
        <App />
      </StrictMode>
    );
  });
