import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './i18n/index.js';   // initialise i18next before rendering
import './index.css';
import { disableDevTools } from './utils/disableDevTools';

// Disable DevTools, inspection shortcuts and right-click in production
disableDevTools();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
