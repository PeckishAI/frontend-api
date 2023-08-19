import Cookies from 'js-cookie';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet, useLocation } from 'react-router-dom';
import { redirectToApplication } from '../utils';

export const TitleRoute = () => {
  const { t } = useTranslation(['routes']);
  const { pathname } = useLocation();

  useEffect(() => {
    // Convert path to dot notation (ex :user.profile)
    let path = pathname;
    if (pathname.slice(-1) === '/') {
      path = pathname.slice(0, -1);
    }
    if (pathname.charAt(0) === '/') {
      path = path.substring(1);
    }
    path = path.replaceAll('/', '.');

    // Get possible translation
    const title = t(path as unknown as TemplateStringsArray, {
      defaultValue: '',
    });
    document.title = title !== '' ? `Peckish - ${title}` : 'Peckish';
  }, [t, pathname]);

  // TODO: get clientType to redirect to good app
  const auth = Cookies.get('accessToken');

  if (auth) redirectToApplication(auth, 'restaurant');

  return <Outlet />;
};
