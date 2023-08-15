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
    console.log(accessToken);

    if (accessToken) {
      // TODO: Fetch user data
      setAccessToken(accessToken);
      navigate('/');
    } else {
      window.location.href = 'http://app.localhost:5123';
      console.log('redirect');
    }
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
