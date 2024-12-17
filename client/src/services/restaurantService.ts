
import { Restaurant } from "../types/restaurant";

import { config } from '../config/config';
const BASE_URL = config.apiBaseUrl;

export const restaurantService = {
  async getRestaurants(): Promise<Restaurant[]> {
    try {
      const response = await fetch(`${BASE_URL}/restaurants/v2/user/7d5844cc-74f1-4f50-b63e-7324fdedf57c`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.data as Restaurant[];
    } catch (error) {
      console.error("Failed to fetch restaurants:", error);
      throw error;
    }
  },
};

export const inventoryService = {
  async getRestaurantInventory(restaurantUuid: string): Promise<any> {
    try {
      const response = await fetch(
        `${BASE_URL}/inventory/v2/restaurant/${restaurantUuid}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error("Failed to fetch restaurant inventory:", error);
      throw error;
    }
  },
};
