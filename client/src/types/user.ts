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