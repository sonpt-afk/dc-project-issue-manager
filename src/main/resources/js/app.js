import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './components/App';
import '@atlaskit/css-reset';

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('react-app-root');
  const root = createRoot(container);
  root.render(<App />);
});