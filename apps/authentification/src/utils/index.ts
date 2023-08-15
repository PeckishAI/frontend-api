import Cookie from 'js-cookie';

export const handleRedirect = (
  accessToken: string,
  app: 'supplier' | 'restaurant'
) => {
  Cookie.set('accessToken', accessToken, {
    domain: 'app.localhost',
    secure: true,
    sameSite: 'strict',
    expires: 7, // 7 days
  });
  if (app === 'restaurant')
    window.location.href = 'http://restaurant.app.localhost:5124';
  else window.location.href = 'http://supplier.app.localhost:5125';
};
