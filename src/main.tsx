import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import AuthGate from './auth/AuthGate';
import { ToastProvider } from './components/Toast';
import { initSmoothScroll } from './lib/smoothScroll';
import './styles.css';

initSmoothScroll();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ToastProvider>
      <AuthGate>
        <App />
      </AuthGate>
    </ToastProvider>
  </StrictMode>,
);
