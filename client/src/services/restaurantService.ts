
import { Restaurant } from "../types/restaurant";

const BASE_URL = "https://76032c8e-3d86-413b-9c48-7b818a8ffaa3-00-9k9j5uta5z7r.janeway.replit.dev";

export const restaurantService = {
  async getRestaurants(): Promise<Restaurant[]> {
    try {
      const response = await fetch(`${BASE_URL}/restaurants/v2`, {
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
