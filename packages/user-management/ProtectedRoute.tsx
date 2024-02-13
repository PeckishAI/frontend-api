import { useEffect } from 'react';
import { Outlet, useSearchParams, useLocation } from 'react-router-dom';
import { GLOBAL_CONFIG } from 'shared-config';
import { Lottie } from 'shared-ui';
import { useUserStore } from './store';
import { userSession } from './session';
import { userService } from './service';
import { User } from './types';
type Props = {
  clientType: User['client_type'];
};

// Route overlay that requires authentication
export const ProtectedRoute = (props: Props) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { storeAccessToken, setUser, logout, user } = useUserStore();
  const location = useLocation();

  useEffect(() => {
    // If user already stored in store, no need to check
    if (user) return;

    // Get from url ortherwise from localstorage
    const token = searchParams.get('token') ?? userSession.get();
    // const token = accessToken ?? userSession.get();

    if (!token) {
      console.log('No token, redirect to authentification');
      window.location.href =
        GLOBAL_CONFIG.authentificationUrl + '?from=' + location.pathname;
      return;
    }

    const rememberMe = !!searchParams.get('rememberMe');

    userService
      .getMe(token)
      .then((user) => {
        if (user.client_type != props.clientType) {
          logout();
          return;
        }

        userSession.save(token, rememberMe);
        storeAccessToken(token);
        setUser(user);
      })
      .catch((err) => {
        console.log('Error retrieve user', err);
        logout();
      })
      .finally(() => {
        if (searchParams.get('token')) searchParams.delete('token');
        if (searchParams.get('rememberMe')) searchParams.delete('rememberMe');
        setSearchParams(searchParams);
      });
  }, []);

  if (!user) {
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

  return <Outlet />;
};
