import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './components/App';

// Render once AJS is initialized
AJS.toInit(() => {
  const container = document.getElementById('react-app-root');
  const root = createRoot(container);
  root.render(<App />);
});