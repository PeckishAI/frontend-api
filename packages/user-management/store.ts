import { userService } from './service';
import { userSession } from './session';
import { User } from './types';
import { create } from 'zustand';

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
    // TODO: Improve shared session management between mobile & web
    // If we are in the browser, clear the session
    if (typeof document !== 'undefined') {
      userSession.clear();
      if (userService.config?.authentificationUrl)
        window.location.href =
          userService.config.authentificationUrl + '/logout';
    }
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
