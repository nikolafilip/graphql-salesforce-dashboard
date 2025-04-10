// src/index.js
import React from 'react';
import { createRoot } from 'react-dom/client';
import ApolloProvider from './ApolloProvider';
import Dashboard from './Dashboard';

const root = createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ApolloProvider>
      <Dashboard />
    </ApolloProvider>
  </React.StrictMode>
);
