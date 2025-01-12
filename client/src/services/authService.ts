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
  const response = await apiClient.post('/v2/signin', credentials);
  return response.data.data; // Extract data from APIResponse wrapper
};

const signUp = async (credentials: SignUpCredentials): Promise<SignInResult> => {
  const response = await apiClient.post('/v2/signup', credentials);
  return response.data.data;
};

const googleSignIn = async (accessToken: string): Promise<SignInResult> => {
  const response = await apiClient.post('/v2/google/signin', { access_token: accessToken });
  return response.data.data;
};

const appleSignIn = async (
  identityToken: string,
  name: {firstName: string, lastName: string} | null
): Promise<SignInResult> => {
  const response = await apiClient.post('/v2/apple/signin', {
    identity_token: identityToken,
    name: name ? `${name.firstName} ${name.lastName}` : null,
  });
  return response.data.data;
};

const signOut = async (): Promise<void> => {
  await apiClient.post('/v2/signout');
};

const getCurrentUser = async (): Promise<User | null> => {
  try {
    const response = await apiClient.get('/v2/me');
    return response.data.data.user;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      return null;
    }
    throw error;
  }
};

const getUserRestaurants = async (userUuid: string): Promise<Restaurant[]> => {
  const response = await apiClient.get(`/v2/me`);
  return response.data.data.restaurants;
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