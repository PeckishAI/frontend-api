import { useEffect, useState } from 'react';
import { useNavigate, Outlet, Navigate } from 'react-router-dom';
import { Lottie } from 'shared-ui';
import { GLOBAL_CONFIG } from 'shared-config';
import { useUserStore, userService, userSession } from 'user-management';

// Route overlay that requires authentication
export const ProtectedRoute = () => {
  const [loadingUser, setLoadingUser] = useState(false);
  const { storeAccessToken, user, setUser, logout } = useUserStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) return;

    const { accessToken } = userSession.getAuthentification();
    if (accessToken) {
      storeAccessToken(accessToken);
      console.log('accessToken', accessToken);

      setLoadingUser(true);
      userService
        .getMe()
        .then((user) => {
          setUser(user);
        })
        .catch((err) => {
          console.log('Error retrieve user', err);

          logout();
          window.location.href = GLOBAL_CONFIG.authentificationUrl;
        })
        .finally(() => {
          setLoadingUser(false);
        });
    } else {
      window.location.href = GLOBAL_CONFIG.authentificationUrl;
      console.log('redirect to login');
    }
  }, [storeAccessToken, navigate, user, setUser, logout]);

  if (loadingUser || !user) {
    return (
      <div
        style={{
          width: '100%',
          height: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <Lottie width="150px" type="loading" />
      </div>
    );
  }

  if (user && !user.onboarded) {
    return <Navigate to="/onboarding" />;
  }

  return <Outlet />;
};
