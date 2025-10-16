import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './components/App';
import Login from './components/Login'; // keep this import if you need it elsewhere

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* <Main /> */}
    {/* Render App (which contains Router) instead of Login directly */}
    <App />
  </React.StrictMode>
);
 