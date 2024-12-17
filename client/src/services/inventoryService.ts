
import { InventoryItem } from '../lib/types';

const BASE_URL = "https://76032c8e-3d86-413b-9c48-7b818a8ffaa3-00-9k9j5uta5z7r.janeway.replit.dev";

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
        }
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

  async updateInventoryItem(restaurantUuid: string, itemId: string, itemData: Partial<InventoryItem>): Promise<any> {
    try {
      const response = await fetch(
        `${BASE_URL}/inventory/v2/restaurant/${restaurantUuid}/item/${itemId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(itemData),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error("Failed to update inventory item:", error);
      throw error;
    }
  },

  async createInventoryItem(restaurantUuid: string, itemData: Omit<InventoryItem, 'id'>): Promise<any> {
    try {
      const response = await fetch(
        `${BASE_URL}/inventory/v2/restaurant/${restaurantUuid}/item`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(itemData),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error("Failed to create inventory item:", error);
      throw error;
    }
  }
};
