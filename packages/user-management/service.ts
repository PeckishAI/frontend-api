import axios, { AxiosInstance } from 'axios';
import { User } from './types';
import { useUserStore } from './store';
import { toast } from 'react-hot-toast';

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

export const userService = {
  config: null as { apiUrl: string; authentificationUrl?: string } | null,
  axiosClient: null as AxiosInstance | null,

  setConfig: function (config: {
    apiUrl: string;
    authentificationUrl?: string;
  }) {
    this.config = config;
    this.initialize(config.apiUrl);
  },

  initialize: function (apiUrl: string) {
    this.axiosClient = axios.create({
      baseURL: apiUrl + '/auth',
    });
    applyAxiosInterceptors(this.axiosClient);
  },
  getMe: function (token: string): Promise<User> {
    if (!this.axiosClient) throw new Error('User service not initialized');

    return this.axiosClient
      .get<UserResponse>('/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        applyAccessToken: false,
      })
      .then((res) => {
        return {
          ...res.data,
          uuid: res.data.user_uuid,
          created_at: new Date(res.data.created_at),
        };
      });
  },
};

// Apply axios interceptors to handle authentification
export const applyAxiosInterceptors = (instance: AxiosInstance) => {
  // Request interceptor for API calls
  instance.interceptors.request.use(async (config) => {
    if (config.applyAccessToken === false) return config;

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

        // For the moment, we just logout the user directly
        useUserStore.getState().logout();
      }

      if (toast) {
        toast.error('An error occured, please try again later');
      }
      return Promise.reject(error);
    }
  );
};

declare module 'axios' {
  export interface AxiosRequestConfig {
    applyAccessToken?: boolean;
  }
}
