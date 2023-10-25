import { useEffect } from 'react';
import { create } from 'zustand';

type TitleState = {
  currentTitle: string;
  setCurrentTitle: (title: string) => void;
};

const useTitleStore = create<TitleState>((set) => ({
  currentTitle: '',
  setCurrentTitle: (title: string) => set({ currentTitle: title }),
}));

/**
 * Sets the document title and store it in store for the navbar use
 */
export function useTitle(title: string) {
  useEffect(() => {
    if (title.length <= 1) return;

    useTitleStore.setState({ currentTitle: title });

    document.title = `Peckish - ${title}`;
    return () => {
      useTitleStore.setState({ currentTitle: '' });
      document.title = 'Peckish';
    };
  }, [title]);
}

/**
 *
 * @returns the current page title stored
 */
export const useNavTitle = () => useTitleStore((state) => state.currentTitle);
