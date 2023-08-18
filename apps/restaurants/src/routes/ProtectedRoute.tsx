import { useEffect, useState } from 'react';
import useUserStore from '../store/useUserStore';
import { useNavigate, Outlet } from 'react-router-dom';
import Cookies from 'js-cookie';
import { Lottie } from 'shared-ui';
import userService from '../_services/user.service';

// Route overlay that requires authentication
export const ProtectedRoute = () => {
  const [loadingUser, setLoadingUser] = useState(false);
  const { storeAccessToken, user, setUser } = useUserStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) return;

    const accessToken = Cookies.get('accessToken');
    if (accessToken) {
      storeAccessToken(accessToken);

      setLoadingUser(true);
      userService
        .getMe()
        .then((user) => {
          setUser(user);
        })
        .catch((err) => {
          console.log('Error retrieve user', err);

          window.location.href = 'http://app.localhost:5123';
        })
        .finally(() => {
          setLoadingUser(false);
        });
    } else {
      window.location.href = 'http://app.localhost:5123';
      console.log('redirect to login');
    }
  }, [storeAccessToken, navigate, user, setUser]);

  if (loadingUser) {
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
