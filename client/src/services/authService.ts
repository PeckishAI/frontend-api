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
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || "Failed to sign in");
    }

    localStorage.setItem("accessToken", data.data.accessToken);
    localStorage.setItem("user", JSON.stringify(data.data.user));
    return data.data;
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
    console.log("Credentials: ", credentials);
    const response = await fetch(`${BASE_URL}/auth/v2/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || "Failed to sign up");
    }

    localStorage.setItem("accessToken", data.data.accessToken);
    localStorage.setItem("user", JSON.stringify(data.data.user));
    return data.data;
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
    const response = await fetch(`${BASE_URL}/auth/v2/google/signin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ access_token: accessToken }),
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || "Failed to sign in with Google");
    }

    localStorage.setItem("accessToken", data.data.accessToken);
    localStorage.setItem("user", JSON.stringify(data.data.user));
    return data.data;
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
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || "Failed to sign in with Apple");
    }

    localStorage.setItem("accessToken", data.data.accessToken);
    localStorage.setItem("user", JSON.stringify(data.data.user));
    return data.data;
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
    const response = await fetch(`${BASE_URL}/auth/v2/signout`, {
      method: "POST",
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || "Failed to sign out");
    }

    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
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
      credentials: "include",
    });

    if (!response.ok) {
      if (response.status === 401) {
        return null;
      }
      throw new Error(await response.text());
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || "Failed to get current user");
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
  const response = await fetch(`${BASE_URL}/auth/v2/me/restaurants`, {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  const data = await response.json();

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
