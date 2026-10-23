import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App';
import AuthGate from './auth/AuthGate';
import { ToastProvider } from './components/Toast';
import './styles.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ToastProvider>
      <AuthGate>
        {/* Hash routing works on any static host (Amplify included) with no rewrite rules. */}
        <HashRouter>
          <App />
        </HashRouter>
      </AuthGate>
    </ToastProvider>
  </StrictMode>,
);
