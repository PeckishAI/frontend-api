import React from 'react';
import ReactDOM from 'react-dom/client';
import { SignIn } from './pages/SignIn.js';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { SignUp } from './pages/SignUp';
import { TitleRoute } from './pages/TitleRoute.js';
import { ChooseUsage } from './pages/ChooseUsage';
import { GLOBAL_CONFIG } from 'shared-config';
import './translation/i18n';
import './index.scss';
import { Logout } from './pages/Logout.js';
import { FromHandler } from './pages/FromHandler.js';
import { userService } from '@peckishai/user-management';
import { ResetPassword } from './pages/ResetPassword.js';
import { EmailResetPassword } from './pages/EmailResetPassword.js';

const GOOGLE_CLIENT_ID = GLOBAL_CONFIG.GOOGLE_CLIENT_ID;

userService.setConfig(GLOBAL_CONFIG);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<FromHandler />}>
            <Route index element={<Navigate to={'sign-in'} replace />} />
            <Route path="logout" element={<Logout />} />
            <Route path="/" element={<TitleRoute />}>
              <Route path="sign-in" element={<SignIn />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route
                path="/email-reset-password"
                element={<EmailResetPassword />}
              />
              <Route path="sign-up" element={<SignUp />} />
              <Route path="choose-usage" element={<ChooseUsage />} />
              <Route path="*" element={<Navigate to="/sign-in" replace />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </GoogleOAuthProvider>
  </React.StrictMode>
);
