import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:8000/auth', // kong url
});

type ApiResult<T> = {
  data: T;
  message: string;
};

type User = {
  created_at: string;
  data: object | null;
  email: string;
  name: string;
  onboarded: boolean;
  client_type?: 'supplier' | 'restaurant';
  premium: boolean;
  telephone: string;
  user_uuid: string;
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
