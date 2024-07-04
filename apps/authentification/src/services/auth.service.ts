import axios from 'axios';
import { GLOBAL_CONFIG } from 'shared-config';
import { User } from '@peckishai/user-management';

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

const resetPassword = async (
  token: string | null,
  password: string
): Promise<void> => {
  if (!token) throw new Error('Token is required');
  await apiClient.post('/reset_password', {
    token,
    password,
  });
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

const appleLogIn = async (
  identityToken: string,
  name: {
    firstName: string;
    lastName: string;
  } | null
): Promise<LogInResult> => {
  const res = await apiClient.post<LogInResult>('/apple/sign-in', {
    identity_token: identityToken,
    name: name ? `${name.firstName} ${name.lastName}` : null,
  });

  return res.data;
};

export default {
  logIn,
  register,
  googleLogIn,
  googleRegister,
  chooseUsage,
  appleLogIn,
  resetPassword,
};
