export interface User {
  id: number;
  username: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  role: 'admin' | 'user';
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
  avatar_url: string | null;
}

export interface AuthResult {
  user: User;
  accessToken: string;
}
