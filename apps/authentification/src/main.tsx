import React from 'react';
import ReactDOM from 'react-dom/client';
import { SignIn } from './pages/SignIn.js';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { SignUp } from './pages/SignUp';
import { TitleRoute } from './components/TitleRoute';
import { ChooseUsage } from './pages/ChooseUsage';
import { GLOBAL_CONFIG } from 'shared-config';
import './translation/i18n';
import './index.scss';

const GOOGLE_CLIENT_ID = GLOBAL_CONFIG.GOOGLE_CLIENT_ID;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <Routes>
          <Route index element={<Navigate to={'sign-in'} />} />
          <Route path="/" element={<TitleRoute />}>
            <Route path="sign-in" element={<SignIn />} />
            <Route path="sign-up" element={<SignUp />} />
            <Route path="choose-usage" element={<ChooseUsage />} />
            <Route path="*" element={<Navigate to="/sign-in" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </GoogleOAuthProvider>
  </React.StrictMode>
);
