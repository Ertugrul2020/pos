
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

// تسجيل الـ Service Worker بمسار نسبي لضمان التوافق
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(err => {
      console.log('ServiceWorker registration failed: ', err);
    });
  });
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element");
}

const root = ReactDOM.createRoot(rootElement);
root.render(<App />);
