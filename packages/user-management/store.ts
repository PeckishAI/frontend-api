import { User } from './types';
import { create } from 'zustand';
import { userSession } from './session';

type UserStore = {
  accessToken?: string;
  storeAccessToken: (accessToken: string) => void;
  logout: () => void;
  user?: User;
  setUser: (user: User) => void;
};

export const useUserStore = create<UserStore>()((set) => ({
  accessToken: undefined,
  user: undefined,
  logout: () => {
    userSession.removeAuthentification();
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
