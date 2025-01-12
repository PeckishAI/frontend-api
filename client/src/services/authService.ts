import axios from "axios";
import {
  type User,
  type SignInCredentials,
  type SignUpCredentials,
  type AuthResult,
  type SocialSignInResult,
} from "@/types/user";
import { type Restaurant } from "@/types/restaurant";
import { config } from "../config/config";
const BASE_URL = config.apiBaseUrl;

export type SignInResult = {
  user: User;
  restaurants: Restaurant[];
  accessToken: string;
};

const signIn = async (
  credentials: SignInCredentials,
): Promise<SignInResult> => {
  try {
    const response = await fetch(`${BASE_URL}/auth/v2/signin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });
    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to sign in");
    }
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Sign in error:", error.response?.data);
      throw new Error(error.response?.data?.message || "Failed to sign in");
    }
    throw error;
  }
};

const signUp = async (
  credentials: SignUpCredentials,
): Promise<SignInResult> => {
  try {
    const response = await fetch(`${BASE_URL}/auth/v2/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });
    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to sign up");
    }
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Sign up error:", error.response?.data);
      throw new Error(error.response?.data?.message || "Failed to sign up");
    }
    throw error;
  }
};

const googleSignIn = async (accessToken: string): Promise<SignInResult> => {
  try {
    console.log("Attempting Google sign in with token");
    const response = await fetch(`${BASE_URL}/auth/v2/google/signin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        access_token: accessToken,
      }),
    });

    console.log("Google sign in response:", response);

    if (!response) {
      throw new Error(response.data.message || "Failed to sign in with Google");
    }

    return response;
  } catch (error) {
    console.error("Google sign in error:", error);
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || "Failed to sign in with Google",
      );
    }
    throw error;
  }
};

const appleSignIn = async (
  identityToken: string,
  name: { firstName: string; lastName: string } | null,
): Promise<SignInResult> => {
  try {
    const response = await fetch(`${BASE_URL}/auth/v2/apple/signin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        identity_token: identityToken,
        name: name
          ? { firstName: name.firstName, lastName: name.lastName }
          : null,
      }),
    });
    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to sign in with Apple");
    }
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Apple sign in error:", error.response?.data);
      throw new Error(
        error.response?.data?.message || "Failed to sign in with Apple",
      );
    }
    throw error;
  }
};

const signOut = async (): Promise<void> => {
  try {
    const response = await fetch(`${BASE_URL}/auth/v2/apple/signin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        identity_token: identityToken,
        name: name
          ? { firstName: name.firstName, lastName: name.lastName }
          : null,
      }),
    });
    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to sign out");
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Sign out error:", error.response?.data);
      throw new Error(error.response?.data?.message || "Failed to sign out");
    }
    throw error;
  }
};

const getCurrentUser = async (): Promise<User | null> => {
  try {
    const response = await fetch(`${BASE_URL}/auth/v2/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data.data.user;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      return null;
    }
    throw error;
  }
};

const getUserRestaurants = async (): Promise<Restaurant[]> => {
  const response = await fetch(`${BASE_URL}/auth/v2/me`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!response.data.success) {
    throw new Error(
      response.data.message || "Failed to fetch user restaurants",
    );
  }
  return response.data.data.restaurants;
};

export const authService = {
  signIn,
  signUp,
  googleSignIn,
  appleSignIn,
  signOut,
  getCurrentUser,
  getUserRestaurants,
};
