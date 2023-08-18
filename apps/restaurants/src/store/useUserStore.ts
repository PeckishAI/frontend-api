import Cookies from 'js-cookie';
import { create } from 'zustand';

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

type UserStore = {
  accessToken?: string;
  storeAccessToken: (accessToken: string) => void;
  logout: () => void;
  user?: User;
  setUser: (user: User) => void;
};

const useUserStore = create<UserStore>()((set) => ({
  accessToken: undefined,
  user: undefined,
  logout: () => {
    Cookies.remove('accessToken', { domain: 'app.localhost' });
    set({ user: undefined, accessToken: undefined });
  },
  storeAccessToken: (accessToken: string) => {
    set({ accessToken });
  },
  setUser: (user: User) => {
    set({ user });
  },
  // fetchData: async () => {
  //   // Call user api & get user
  //   // set((state) => ({ ...state, loading: true }));
  // },
}));

export default useUserStore;
