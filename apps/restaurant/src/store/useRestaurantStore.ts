import { create } from 'zustand';
import { restaurantService } from '../services';
import { User, useUserStore } from 'user-management';

export type Restaurant = {
  uuid: string;
  name: string;
  address: string;
  city: string;
  country: string;
  created_at: Date;
  users: Pick<User, 'email' | 'user_uuid' | 'name' | 'picture'>[];
  currency: string | null;
};

type RestaurantStore = {
  selectedRestaurantUUID?: string;
  restaurants: Restaurant[];
  restaurantsLoading: boolean;
  setSelectedRestaurantUUID: (uuid: string) => void;
  loadRestaurants: () => void;
  addRestaurant: (restaurant: Restaurant) => void;
};

export const useRestaurantStore = create<RestaurantStore>()((set) => ({
  restaurants: [],
  selectedRestaurantUUID: undefined,
  restaurantsLoading: false,

  setSelectedRestaurantUUID: (uuid: string) => {
    set({ selectedRestaurantUUID: uuid });
  },
  loadRestaurants: async () => {
    const user = useUserStore.getState().user;
    if (!user) return;

    set({
      restaurantsLoading: true,
    });

    const restaurants = await restaurantService.getUserRestaurants(
      user.user_uuid
    );

    set({
      restaurants,
      selectedRestaurantUUID: restaurants[0]?.uuid ?? undefined,
      restaurantsLoading: false,
    });
  },
  addRestaurant: (restaurant: Restaurant) => {
    set((state) => ({ restaurants: [...state.restaurants, restaurant] }));
  },
}));
