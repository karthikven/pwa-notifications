import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register service worker for both production and development
serviceWorkerRegistration.register()
  .then(registration => {
    console.log('Service Worker registered successfully:', registration);
  })
  .catch(error => {
    console.error('Service Worker registration failed:', error);
  });