export type Permissions = {
  my_restaurants: boolean;
  overview: boolean;
  inventory: boolean;
  recipes: boolean;
  documents: boolean;
  integrations: boolean;
};

export type Users = {
  created_at: Date;
  data: object | null;
  email: string;
  name: string;
  onboarded: boolean;
  client_type?: 'supplier' | 'restaurant';
  premium: boolean;
  telephone: string;
  user_uuid: string;
  picture?: string;
};

export type User = {
  User: Users;
  Permissions: Permissions;
};
