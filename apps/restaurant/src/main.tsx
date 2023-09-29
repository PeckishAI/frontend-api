import dayjs from 'dayjs';
import Calendar from 'dayjs/plugin/calendar';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { RouterProvider } from 'react-router-dom';
import './index.scss';
import { router } from './routes/routes';
import './translation/i18n';
import { userService } from '@peckishai/user-management';
import { GLOBAL_CONFIG } from 'shared-config';

dayjs.extend(Calendar);

userService.setConfig(GLOBAL_CONFIG);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SkeletonTheme baseColor="#e2dcdc">
      <RouterProvider router={router} />
    </SkeletonTheme>
    <Toaster />
  </React.StrictMode>
);
