import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import { App } from './app/App';
import { GlobalToastProvider } from './components/feedback/GlobalToastProvider';
import './pwa/register-sw';
import './styles.css';

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <BrowserRouter>
      <GlobalToastProvider>
        <App />
      </GlobalToastProvider>
    </BrowserRouter>
  </StrictMode>,
);
