import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const PRELOAD_RELOAD_KEY = 'jpd113_vite_preload_reload_at';

// Recover automatically once when an open tab requests a stale hashed chunk after a fresh deploy.
window.addEventListener('vite:preloadError', (event) => {
  event.preventDefault();
  try {
    const lastReloadAt = Number(window.sessionStorage.getItem(PRELOAD_RELOAD_KEY) || 0);
    const now = Date.now();
    if (now - lastReloadAt < 15000) {
      return;
    }
    window.sessionStorage.setItem(PRELOAD_RELOAD_KEY, String(now));
    window.location.reload();
  } catch {
    window.location.reload();
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
