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

const signIn = async (credentials: SignInCredentials): Promise<SignInResult> => {
  try {
    const response = await fetch(`${BASE_URL}/api/auth/v2/signin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
      credentials: 'include'
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to sign in");
    }

    if (!data.success) {
      throw new Error(data.message || "Failed to sign in");
    }

    return data.data;
  } catch (error) {
    console.error("Sign in error:", error);
    throw error;
  }
};

const signUp = async (credentials: SignUpCredentials): Promise<SignInResult> => {
  try {
    const response = await fetch(`${BASE_URL}/api/auth/v2/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
      credentials: 'include'
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to sign up");
    }

    if (!data.success) {
      throw new Error(data.message || "Failed to sign up");
    }

    return data.data;
  } catch (error) {
    console.error("Sign up error:", error);
    throw error;
  }
};

const googleSignIn = async (accessToken: string): Promise<SignInResult> => {
  try {
    console.log("Attempting Google sign in with token");
    const response = await fetch(`${BASE_URL}/api/auth/v2/google/signin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        access_token: accessToken,
      }),
      credentials: 'include'
    });

    const data = await response.json();
    console.log("Google sign in response:", data);

    if (!response.ok) {
      throw new Error(data.message || "Failed to sign in with Google");
    }

    if (!data.success) {
      throw new Error(data.message || "Failed to sign in with Google");
    }

    return data.data;
  } catch (error) {
    console.error("Google sign in error:", error);
    throw error;
  }
};

const appleSignIn = async (
  identityToken: string,
  name: { firstName: string; lastName: string } | null,
): Promise<SignInResult> => {
  try {
    const response = await fetch(`${BASE_URL}/api/auth/v2/apple/signin`, {
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
      credentials: 'include'
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to sign in with Apple");
    }

    if (!data.success) {
      throw new Error(data.message || "Failed to sign in with Apple");
    }

    return data.data;
  } catch (error) {
    console.error("Apple sign in error:", error);
    throw error;
  }
};

const signOut = async (): Promise<void> => {
  try {
    const response = await fetch(`${BASE_URL}/api/auth/signout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: 'include'
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to sign out");
    }

    if (!data.success) {
      throw new Error(data.message || "Failed to sign out");
    }
  } catch (error) {
    console.error("Sign out error:", error);
    throw error;
  }
};

const getCurrentUser = async (): Promise<User | null> => {
  try {
    const response = await fetch(`${BASE_URL}/api/auth/v2/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: 'include'
    });

    if (response.status === 401) {
      return null;
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to get user");
    }

    return data.data.user;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      return null;
    }
    throw error;
  }
};

const getUserRestaurants = async (): Promise<Restaurant[]> => {
  const response = await fetch(`${BASE_URL}/api/auth/v2/me`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: 'include'
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch user restaurants");
  }

  if (!data.success) {
    throw new Error(data.message || "Failed to fetch user restaurants");
  }

  return data.data.restaurants;
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