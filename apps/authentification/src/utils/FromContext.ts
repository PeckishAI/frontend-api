import { create } from 'zustand';

type FromState = {
  from: string;
  setFrom: (from: string) => void;
};

export const useFromStore = create<FromState>()((set) => ({
  from: '',
  setFrom: (from: string) => set({ from }),
}));
