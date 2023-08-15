import Cookies from 'js-cookie';
import { useEffect } from 'react';
import useUserStore from './useUserStore';
import { Lottie } from 'shared-ui';
import { useNavigate } from 'react-router-dom';

export const LoginHandler = () => {
  const { setAccessToken } = useUserStore();
  const navigate = useNavigate();

  useEffect(() => {
    const accessToken = Cookies.get('accessToken');
    if (accessToken) {
      // TODO: Fetch user data
      setAccessToken(accessToken);
      navigate('/');
    } else window.location.href = 'app.localhost:5123';
  }, [setAccessToken, navigate]);

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
};
