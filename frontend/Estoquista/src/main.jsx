import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import '@fontsource-variable/geist';
import './styles.css';
import './page-layout.css';

createRoot(document.getElementById('root')).render(
  <StrictMode><App /></StrictMode>
);
