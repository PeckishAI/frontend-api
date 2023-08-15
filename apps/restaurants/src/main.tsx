import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import 'shared-ui/styles/common.css';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes/routes';
import './translation/i18n';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
