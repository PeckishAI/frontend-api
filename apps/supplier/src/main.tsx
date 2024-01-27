import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.scss';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes/routes';

import './translation/i18n';
import { userService } from '@peckishai/user-management';
import { GLOBAL_CONFIG } from 'shared-config';

userService.setConfig(GLOBAL_CONFIG);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
