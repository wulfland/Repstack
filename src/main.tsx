import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { initializeDatabase } from './db/index.ts';

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
