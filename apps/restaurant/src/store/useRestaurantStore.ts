import { create } from 'zustand';
import { restaurantService } from '../services';
import { User, useUserStore } from '@peckishai/user-management';
import i18n from '../translation/i18n';
import supplierService from '../services/supplier.service';

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

export type Supplier = {
  label: string;
  value: string;
  supplier_uuid: string;
};

type RestaurantStore = {
  selectedRestaurantUUID?: string;
  restaurants: Restaurant[];
  suppliers: Supplier[]; // Add suppliers array
  loadSuppliers: (restaurantUUID: string) => void; // Method to load suppliers

  restaurantsLoading: boolean;
  setSelectedRestaurantUUID: (uuid: string) => void;
  loadRestaurants: () => void;
  addRestaurant: (restaurant: Restaurant) => void;
};

export const useRestaurantStore = create<RestaurantStore>()((set) => ({
  restaurants: [],
  suppliers: [], // Initialize suppliers
  selectedRestaurantUUID: undefined,
  restaurantsLoading: false,

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

    // Retrieve last selected restaurant from local storage
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
  loadSuppliers: async (restaurantUUID: string) => {
    if (!restaurantUUID) return;

    set({ suppliersLoading: true });

    try {
      const res = await supplierService.getRestaurantSuppliers(restaurantUUID);
      const suppliersList = res.map((supplier) => ({
        label: supplier.name,
        value: supplier.supplier_uuid,
        supplier_uuid: supplier.supplier_uuid,
      }));
      set({ suppliers: suppliersList });
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    } finally {
      set({ suppliersLoading: false });
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
