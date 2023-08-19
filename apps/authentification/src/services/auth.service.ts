import axios from 'axios';
import { GLOBAL_CONFIG } from 'shared-config';
import { User } from 'user-management';

const apiClient = axios.create({
  baseURL: GLOBAL_CONFIG.apiUrl + '/auth',
});

type ApiResult<T> = {
  data: T;
  message: string;
};

export type LogInResult = ApiResult<{
  access_token: string;
  user: User;
}>;

const logIn = async (email: string, password: string): Promise<LogInResult> => {
  const res = await apiClient.post<LogInResult>('/sign-in', {
    email,
    password,
  });

  return res.data;
};

const googleLogIn = async (accessToken: string): Promise<LogInResult> => {
  const res = await apiClient.post<LogInResult>('/google/sign-in', {
    access_token: accessToken,
  });

  return res.data;
};

const register = async (
  name: string,
  // phone: string,
  email: string,
  password: string
): Promise<LogInResult> => {
  const res = await apiClient.post<LogInResult>('/sign-up', {
    email,
    password,
    name,
  });

  return res.data;
};

const googleRegister = async (accessToken: string): Promise<LogInResult> => {
  const res = await apiClient.post<LogInResult>('/google/sign-up', {
    access_token: accessToken,
  });

  return res.data;
};

const chooseUsage = async (
  usageType: 'supplier' | 'restaurant',
  accessToken: string
): Promise<LogInResult> => {
  const res = await apiClient.post<LogInResult>(
    '/usage',
    {
      usage_type: usageType,
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  return res.data;
};

export default {
  logIn,
  register,
  googleLogIn,
  googleRegister,
  chooseUsage,
};
