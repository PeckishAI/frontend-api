export type User = {
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

// Permissions used to check if user has access to a specific page
export type Permissions = {
  my_restaurants: boolean;
  overview: boolean;
  inventory: boolean;
  recipes: boolean;
  documents: boolean;
  integrations: boolean;
};

export type GetMe = {
  user: User;
  permissions: Permissions;
};
