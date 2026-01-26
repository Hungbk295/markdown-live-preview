import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Import GitHub markdown CSS
import 'github-markdown-css/github-markdown.css';

ReactDOM.createRoot(document.getElementById('app')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
