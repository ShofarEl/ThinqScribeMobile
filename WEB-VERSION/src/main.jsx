import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { AppLoadingProvider } from './context/AppLoadingContext.jsx';

// Fix Ant Design React compatibility warning
if (React.version.startsWith('19')) {
  // Suppress the warning for React 19
  const originalConsoleWarn = console.warn;
  console.warn = (...args) => {
    if (args[0] && typeof args[0] === 'string' && args[0].includes('antd: compatible')) {
      return; // Suppress Ant Design compatibility warning
    }
    originalConsoleWarn.apply(console, args);
  };
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppLoadingProvider>
      <App />
    </AppLoadingProvider>
  </React.StrictMode>
);
