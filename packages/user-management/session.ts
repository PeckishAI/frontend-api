// const storeAuthentification = (accessToken: string) => {
//   Cookies.set('accessToken', accessToken, {
//     // allow share with subdomains
//     domain: GLOBAL_CONFIG.cookieDomain,
//     // https only
//     secure: true,
//     // prevent CSRF attacks
//     sameSite: 'strict',
//     // duration in days
//     expires: 7,
//   });
// };

// const getAuthentification = () => {
//   return { accessToken: Cookies.get('accessToken') };
// };

// const removeAuthentification = () => {
//   Cookies.remove('accessToken', { domain: GLOBAL_CONFIG.cookieDomain });
// };

const save = (accessToken: string, persist: boolean) => {
  if (persist) {
    localStorage.setItem('accessToken', accessToken);
  } else {
    // Test
    sessionStorage.setItem('accessToken', accessToken);
  }
};

const get = () => {
  return (
    localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken')
  );
};

const clear = () => {
  localStorage.removeItem('accessToken');
  sessionStorage.removeItem('accessToken');
  // Cookies.remove('accessToken', { domain: GLOBAL_CONFIG.cookieDomain });
};

export const userSession = {
  save,
  clear,
  get,
};
