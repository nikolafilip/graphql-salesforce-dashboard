// src/index.js
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ApolloProvider from './ApolloProvider';
import Dashboard from './Dashboard';
import Accounts from './Accounts';

const root = createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ApolloProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/accounts" element={<Accounts />} />
        </Routes>
      </BrowserRouter>
    </ApolloProvider>
  </React.StrictMode>
);
