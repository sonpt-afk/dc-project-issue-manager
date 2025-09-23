import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';

// Render once AJS is initialized
AJS.toInit(() => {
  ReactDOM.render(
    <App />,
    document.getElementById('react-app-root')
  );
});