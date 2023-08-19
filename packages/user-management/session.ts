import Cookies from 'js-cookie';
import { GLOBAL_CONFIG } from 'shared-config';

const storeAuthentification = (accessToken: string) => {
  Cookies.set('accessToken', accessToken, {
    // allow share with subdomains
    domain: GLOBAL_CONFIG.cookieDomain,
    // https only
    secure: true,
    // prevent CSRF attacks
    sameSite: 'strict',
    // duration in days
    expires: 7,
  });
};

const removeAuthentification = () => {
  Cookies.remove('accessToken', { domain: GLOBAL_CONFIG.cookieDomain });
};

export const userSession = {
  storeAuthentification,
  deleteAuthentification: removeAuthentification,
};
