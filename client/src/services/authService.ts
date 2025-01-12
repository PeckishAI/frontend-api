import axios from 'axios';
import { type User, type SignInCredentials, type SignUpCredentials, type AuthResult, type SocialSignInResult } from '@/types/user';
import { type Restaurant } from '@/types/restaurant';

const apiClient = axios.create({
  baseURL: '/api/auth',
  withCredentials: true
});

export type SignInResult = {
  user: User;
  restaurants: Restaurant[];
  accessToken: string;
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

// Helper function to validate auth state and throw if not authenticated
const requireAuth = async () => {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Not authenticated');
  }
  return user;
};

export const authService = {
  signIn,
  signUp,
  googleSignIn,
  appleSignIn,
  signOut,
  getCurrentUser,
  getUserRestaurants,
  requireAuth
};