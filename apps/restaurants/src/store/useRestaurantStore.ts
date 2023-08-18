import { create } from 'zustand';
import useUserStore, { User } from './useUserStore';
import restaurantService from '../_services/restaurant.service';

export type Restaurant = {
  uuid: string;
  name: string;
  address: string;
  city: string;
  country: string;
  created_at: Date;
  users: Pick<User, 'email' | 'user_uuid' | 'name'>[];
};

type RestaurantStore = {
  selectedRestaurantUUID?: string;
  restaurants: Restaurant[];
  setSelectedRestaurantUUID: (uuid: string) => void;
  loadRestaurants: () => void;
  addRestaurant: (restaurant: Restaurant) => void;
};

export const useRestaurantStore = create<RestaurantStore>()((set) => ({
  restaurants: [],
  selectedRestaurantUUID: undefined,

  setSelectedRestaurantUUID: (uuid: string) => {
    set({ selectedRestaurantUUID: uuid });
  },
  loadRestaurants: async () => {
    const user = useUserStore.getState().user;
    if (!user) return;
    const restaurants = await restaurantService.getUserRestaurants(
      user.user_uuid
    );

    set({ restaurants, selectedRestaurantUUID: restaurants[0].uuid });
  },
  addRestaurant: (restaurant: Restaurant) => {
    set((state) => ({ restaurants: [...state.restaurants, restaurant] }));
  },
}));
