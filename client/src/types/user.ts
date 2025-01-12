import { z } from 'zod';

export interface User {
  user_uuid: string;
  username: string | null;
  email: string;
  name: string | null;
  picture: string | null;
  phone: string | null;
}

export interface SignInCredentials {
  email: string;
  password: string;
}

export interface SignUpCredentials extends SignInCredentials {
  name: string;
}

export interface SocialSignInResult {
  name: string | null;
  email: string;
  picture: string | null;
}

export interface Restaurant {
  restaurant_uuid: string;
  name: string;
  address: string | null;
  city: string | null;
  country: string | null;
  country_code: string | null;
  currency: string;
  email: string | null;
  latitude: number | null;
  longitude: number | null;
  logo_url: string | null;
  phone: string | null;
  postcode: string | null;
}

export interface AuthResult {
  user: User;
  restaurants: Restaurant[];
  accessToken: string;
}

// Zod schemas for form validation
export const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const signUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});