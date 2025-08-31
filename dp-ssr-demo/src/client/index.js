import React from 'react';
import { hydrateRoot } from 'react-dom/client';
import App from '../shared/components/App.js';


const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);
root.render(<App />);
// hydrateRoot(container, <App />);
