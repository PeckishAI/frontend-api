import { useEffect } from 'react';
import {
  Outlet,
  useSearchParams,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import { GLOBAL_CONFIG } from 'shared-config';
import { Lottie } from 'shared-ui';
import { useUserStore } from './store';
import { userSession } from './session';
import { userService } from './service';
import { Permissions, User } from './types';

type Props = {
  clientType: User['client_type'];
};

// Route overlay that requires authentication
export const ProtectedRoute = (props: Props) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { storeAccessToken, setUser, logout, user } = useUserStore();

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // If user already stored in store, no need to check
    if (user) return;

    // Get from URL otherwise from localStorage
    const token = searchParams.get('token') ?? userSession.get();

    if (!token) {
      window.location.href =
        GLOBAL_CONFIG.authentificationUrl + '?from=' + location.pathname;
      return;
    }

    const rememberMe = !!searchParams.get('rememberMe');

    userService
      .getMe(token)
      .then((user) => {
        if (
          !user ||
          !user.user ||
          user?.user.client_type !== props.clientType
        ) {
          logout();
          return;
        }

        const path = location.pathname.slice(1) as keyof Permissions;
        const basePath = path.split('/')[0] as keyof Permissions;

        // TODO: move the permissions check to an appropriate place (HOC or Route Wrapper)
        // Check for permissions
        const hasPermission =
          user?.permissions[basePath] === true ||
          user?.permissions[path] === true;

        if (!hasPermission) {
          navigate('/');
        }

        userSession.save(token, rememberMe);
        storeAccessToken(token);
        setUser(user);
      })
      .catch((err) => {
        console.log('Error retrieving user', err);
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
