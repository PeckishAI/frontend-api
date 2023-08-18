import Axios from '.';
import { User } from '../store/useUserStore';

type UserResponse = {
  client_type: 'supplier' | 'restaurant';
  created_at: string;
  data: object;
  email: string;
  name: string;
  onboarded: boolean;
  premium: boolean;
  telephone: string;
  user_uuid: string;
};

const getMe = (): Promise<User> => {
  return Axios.get<UserResponse>('/auth/me').then((res) => {
    return {
      ...res.data,
      uuid: res.data.user_uuid,
      created_at: new Date(res.data.created_at),
    };
  });
};

export default {
  getMe,
};
