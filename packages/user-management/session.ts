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
};

export const userSession = {
  save,
  clear,
  get,
};
