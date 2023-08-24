import { User } from './types';
import { create } from 'zustand';
import { userSession } from './session';
import { GLOBAL_CONFIG } from 'shared-config';

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
    userSession.clear();
    set({ user: undefined, accessToken: undefined });
    window.location.href = GLOBAL_CONFIG.authentificationUrl + '/logout';
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
