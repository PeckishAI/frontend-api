
import axios from 'axios';
import { GLOBAL_CONFIG } from '../config/config';

const apiClient = axios.create({
  baseURL: GLOBAL_CONFIG.apiUrl + '/auth', 
});

export type LogInResult = {
  access_token: string;
  user: {
    name: string;
    email: string;
  };
};

export const authService = {
  async logIn(email: string, password: string): Promise<LogInResult> {
    const res = await apiClient.post('/login', { email, password });
    return res.data;
  },

  async googleLogIn(accessToken: string): Promise<LogInResult> {
    const res = await apiClient.post('/google/login', {
      access_token: accessToken
    });
    return res.data;
  },
  
  async appleLogIn(identityToken: string): Promise<LogInResult> {
    const res = await apiClient.post('/apple/login', {
      identity_token: identityToken
    });
    return res.data;
  },

  async register(name: string, email: string, password: string): Promise<LogInResult> {
    const res = await apiClient.post('/register', {
      name,
      email,
      password,
    });
    return res.data;  
  },

  async resetPassword(token: string, password: string): Promise<void> {
    await apiClient.post('/reset-password', {
      token,
      password,
    });
  },

  async requestPasswordReset(email: string): Promise<void> {
    await apiClient.post('/forgot-password', { email });
  }
};
