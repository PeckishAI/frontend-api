import { InventoryItem } from "../lib/types";

import { config } from '../config/config';
const BASE_URL = config.apiBaseUrl;

export const inventoryService = {
  async getRestaurantInventory(restaurantUuid: string): Promise<any> {
    try {
      const response = await fetch(
        `${BASE_URL}/ingredients/v2/restaurant/${restaurantUuid}`,
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
      if (!data.success) {
        throw new Error("Failed to fetch inventory");
      }
      return data;
    } catch (error) {
      console.error("Failed to fetch restaurant inventory:", error);
      throw error;
    }
  },

  async updateInventoryItem(
    restaurantUuid: string,
    itemId: string,
    itemData: Partial<InventoryItem>,
  ): Promise<any> {
    try {
      const response = await fetch(
        `${BASE_URL}/ingredients/v2/restaurant/${restaurantUuid}/item/${itemId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(itemData),
        },
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

  async createInventoryItem(
    restaurantUuid: string,
    itemData: Omit<InventoryItem, "id">,
  ): Promise<any> {
    try {
      const response = await fetch(
        `${BASE_URL}/ingredients/v2/restaurant/${restaurantUuid}/item`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(itemData),
        },
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
  },
};
