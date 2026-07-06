import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import { ToastProvider } from './components/ui/Toast';
import { RealDataProvider } from './state/RealDataContext';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <RealDataProvider>
          <App />
        </RealDataProvider>
      </ToastProvider>
    </BrowserRouter>
  </StrictMode>,
);
