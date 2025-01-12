import type {
  User,
  SignInCredentials,
  SignUpCredentials,
  AuthResult,
  SocialSignInResult,
} from "@/types/user";
import { config } from "@/config/config";

const BASE_URL = config.apiBaseUrl;

const signIn = async (credentials: SignInCredentials): Promise<AuthResult> => {
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

    return data.data;
  } catch (error: any) {
    console.error("Sign in error:", error);
    throw error;
  }
};

const signUp = async (credentials: SignUpCredentials): Promise<AuthResult> => {
  try {
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

    return data.data;
  } catch (error: any) {
    console.error("Sign up error:", error);
    throw error;
  }
};

const googleSignIn = async (accessToken: string): Promise<AuthResult> => {
  try {
    const response = await fetch(`${BASE_URL}/auth/v2/google/signin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ access_token: accessToken }),
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || "Failed to sign in with Google");
    }

    return data.data;
  } catch (error: any) {
    console.error("Google sign in error:", error);
    throw error;
  }
};

const appleSignIn = async (
  identityToken: string,
  name: { firstName: string; lastName: string } | null,
): Promise<AuthResult> => {
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

    return data.data;
  } catch (error: any) {
    console.error("Apple sign in error:", error);
    throw error;
  }
};

const signOut = async (): Promise<void> => {
  try {
    const response = await fetch(`${BASE_URL}/auth/v2/signout`, {
      method: "POST",
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || "Failed to sign out");
    }
  } catch (error: any) {
    console.error("Sign out error:", error);
    throw error;
  }
};

const getCurrentUser = async () => {
  try {
    const accessToken = localStorage.getItem("accessToken");
    const response = await fetch(`${BASE_URL}/auth/v2/me`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${accessToken}`
      }
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
  } catch (error: any) {
    console.error("Get current user error:", error);
    if (error.response?.status === 401) {
      return null;
    }
    throw error;
  }
};

export const authService = {
  signIn,
  signUp,
  googleSignIn,
  appleSignIn,
  signOut,
  getCurrentUser,
};
