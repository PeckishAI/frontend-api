import axios, { AxiosInstance } from 'axios';
import { User } from './types';
import { GLOBAL_CONFIG } from 'shared-config';
import { useUserStore } from './store';

const axiosClient = axios.create({
  baseURL: GLOBAL_CONFIG.apiUrl + '/auth',
});

type UserResponse = {
  client_type: 'supplier' | 'restaurant';
  created_at: string;
  data: object;
  email: string;
  name: string;
  onboarded: boolean;
  premium: boolean;
  telephone: string;
  user_uuid: string;
};

const getMe = (): Promise<User> => {
  const accessToken = useUserStore.getState().accessToken;
  return axiosClient
    .get<UserResponse>('/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
    .then((res) => {
      return {
        ...res.data,
        uuid: res.data.user_uuid,
        created_at: new Date(res.data.created_at),
      };
    });
};

// Apply axios interceptors to handle authentification
export const applyAxiosInterceptors = (instance: AxiosInstance) => {
  // Request interceptor for API calls
  instance.interceptors.request.use(async (config) => {
    const accessToken = useUserStore.getState().accessToken;
    config.headers.Authorization = `Bearer ${accessToken}`;
    return config;
  });

  // Response interceptor for API calls
  instance.interceptors.response.use(
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
};

export const userService = {
  getMe,
};
