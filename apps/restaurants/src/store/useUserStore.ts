import { create } from 'zustand';

type User = {
  created_at: string;
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
  accessToken: string;
  setAccessToken: (accessToken: string) => void;
  user?: User;
};

const useUserStore = create<UserStore>()((set) => ({
  accessToken: '',
  user: undefined,

  setAccessToken: (accessToken: string) => {
    set({ accessToken });
  },

  fetchData: async () => {
    // Call user api & get user
    // set((state) => ({ ...state, loading: true }));
  },
}));

export default useUserStore;
