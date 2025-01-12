import axios from 'axios';
import { config } from '@/config/config';
import { type User, type Restaurant } from '@/types';

const apiClient = axios.create({
  baseURL: '/api/auth',
  withCredentials: true
});

export type SignInResult = {
  user: User;
  restaurants: Restaurant[];
  accessToken: string;
}

export type SignInCredentials = {
  email: string;
  password: string;
}

export type SignUpCredentials = SignInCredentials & {
  name: string;
}

const signIn = async (credentials: SignInCredentials): Promise<SignInResult> => {
  const response = await apiClient.post('/signin', credentials);
  return response.data;
};

const signUp = async (credentials: SignUpCredentials): Promise<SignInResult> => {
  const response = await apiClient.post('/signup', credentials);
  return response.data;
};

const googleSignIn = async (accessToken: string): Promise<SignInResult> => {
  const response = await apiClient.post('/google/signin', { accessToken });
  return response.data;
};

const appleSignIn = async (
  identityToken: string,
  name: {firstName: string, lastName: string} | null
): Promise<SignInResult> => {
  const response = await apiClient.post('/apple/signin', {
    identityToken,
    name: name ? `${name.firstName} ${name.lastName}` : null,
  });
  return response.data;
};

const signOut = async (): Promise<void> => {
  await apiClient.post('/signout');
};

const getCurrentUser = async (): Promise<User | null> => {
  try {
    const response = await apiClient.get('/me');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      return null;
    }
    throw error;
  }
};

const getUserRestaurants = async (): Promise<Restaurant[]> => {
  const response = await apiClient.get('/restaurants');
  return response.data;
};

export const authService = {
  signIn,
  signUp,
  googleSignIn,
  appleSignIn,
  signOut,
  getCurrentUser,
  getUserRestaurants
};