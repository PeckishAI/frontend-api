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
};
