import { create } from 'zustand';
import { restaurantService, transferService } from '../services';
import { User, useUserStore } from '@peckishai/user-management';
import i18n from '../translation/i18n';

export type Restaurant = {
  uuid: string;
  name: string;
  address: string;
  city: string;
  country: string;
  created_at: Date;
  users: Pick<User, 'email' | 'user_uuid' | 'name' | 'picture'>[];
  currency: string | null;
  provider: {
    xero: boolean;
  }[];
};

type RestaurantStore = {
  selectedRestaurantUUID?: string;
  restaurants: Restaurant[];
  restaurantsLoading: boolean;
  transferHistory: any[];
  setSelectedRestaurantUUID: (uuid: string) => void;
  loadRestaurants: () => void;
  addRestaurant: (restaurant: Restaurant) => void;
  loadTransferHistory: (restaurantId: string) => void;
};

export const useRestaurantStore = create<RestaurantStore>()((set) => ({
  restaurants: [],
  selectedRestaurantUUID: undefined,
  restaurantsLoading: false,
  transferHistory: [],

  setSelectedRestaurantUUID: (uuid: string) => {
    localStorage.setItem('selectedRestaurantUUID', uuid);
    set({ selectedRestaurantUUID: uuid });
  },

  loadRestaurants: async () => {
    const user = useUserStore.getState().user;
    if (!user) return;

    set({
      restaurantsLoading: true,
    });

    const restaurants = await restaurantService.getUserRestaurants(
      user?.user?.user_uuid
    );

    const storedSelectedRestaurantUUID = localStorage.getItem(
      'selectedRestaurantUUID'
    );

    if (
      storedSelectedRestaurantUUID &&
      restaurants.some((r) => r.uuid === storedSelectedRestaurantUUID)
    ) {
      set({ selectedRestaurantUUID: storedSelectedRestaurantUUID });
    } else {
      set({ selectedRestaurantUUID: restaurants[0]?.uuid ?? undefined });
    }

    set({
      restaurants,
      restaurantsLoading: false,
    });
  },

  addRestaurant: (restaurant: Restaurant) => {
    set((state) => ({ restaurants: [...state.restaurants, restaurant] }));
  },

  loadTransferHistory: async (restaurantId: string) => {
    try {
      const history = await transferService.getTransferHistory(restaurantId);
      set({ transferHistory: history }); // Update transferHistory in store
    } catch (error) {
      console.error('Error fetching transfer history:', error);
    }
  },
}));

export const useRestaurantCurrency = () => {
  const currencyISO = useRestaurantStore((state) => {
    return (
      state.restaurants.find((r) => r.uuid === state.selectedRestaurantUUID)
        ?.currency || 'EUR'
    );
  });

  const getSymbol = (currency: string) => {
    const symbol = new Intl.NumberFormat(i18n.language, {
      style: 'currency',
      currency,
    })
      .formatToParts(0)
      .find((x) => x.type === 'currency');
    return symbol && symbol.value;
  };

  return { currencyISO, currencySymbol: getSymbol(currencyISO) };
};
