export * from './inventory.service';

import { config } from '../local_config/config';
import axios from 'axios';
import useUserStore from '../store/useUserStore';

const axiosClient = axios.create({
  baseURL: config.API_URL,
});

// Request interceptor for API calls
axiosClient.interceptors.request.use(async (config) => {
  const accessToken = useUserStore.getState().accessToken;
  config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

// Response interceptor for API calls
axiosClient.interceptors.response.use(
  (res) => res,
  async function (error) {
    if (!axios.isAxiosError(error)) return Promise.reject(error);

    // const originalRequest = error.config;
    if (
      error.response &&
      error.response.status === 401
      // && !originalRequest._retry
    ) {
      // TODO : refresh access token with the refreshToken
      // originalRequest._retry = true;
      // const access_token = await refreshAccessToken();
      // axios.defaults.headers.common['Authorization'] = 'Bearer ' + access_token;
      // return Axios(error.config);

      // For the moment, we just logout the user
      useUserStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
