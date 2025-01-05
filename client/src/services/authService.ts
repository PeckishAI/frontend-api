
import axios from 'axios';
import { config } from '@/config/config';

const apiClient = axios.create({
  baseURL: config.apiGateway + '/auth'
});

export type LogInResult = {
  data: {
    access_token: string;
    user: {
      client_type?: 'supplier' | 'restaurant'
    }
  }
}

const logIn = async (email: string, password: string): Promise<LogInResult> => {
  const res = await apiClient.post('/sign-in', {
    email,
    password,
  });
  return res.data;
};

const googleLogIn = async (accessToken: string): Promise<LogInResult> => {
  const res = await apiClient.post('/google/sign-in', {
    access_token: accessToken,
  });
  return res.data;
};

const appleLogIn = async (
  identityToken: string,
  name: {firstName: string, lastName: string} | null
): Promise<LogInResult> => {
  const res = await apiClient.post('/apple/sign-in', {
    identity_token: identityToken,
    name: name ? `${name.firstName} ${name.lastName}` : null,
  });
  return res.data;
};

export const authService = {
  logIn,
  googleLogIn, 
  appleLogIn
};
