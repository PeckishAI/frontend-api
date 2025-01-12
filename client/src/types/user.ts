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

interface Restaurant {
  // Placeholder for Restaurant interface - needs to be defined based on backend model.
  id: number;
  name: string;
}

export interface AuthResult {
  user: User;
  restaurants: Restaurant[];
  accessToken: string;
}