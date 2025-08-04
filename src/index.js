// src/index.js

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// HAPUS SEMUA BARIS KONFIGURASI PDF.JS DARI SINI

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);