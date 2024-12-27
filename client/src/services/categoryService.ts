import { config } from "../config/config";
const BASE_URL = config.apiBaseUrl;

export const categoryService = {
  async getRestaurantCategories(restaurantUuid: string): Promise<any> {
    try {
      const response = await fetch(
        `${BASE_URL}/categories/v2/restaurant/${restaurantUuid}`,
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
        throw new Error("Failed to fetch categories");
      }
      return data.data;
    } catch (error) {
      console.error("Failed to fetch restaurant categories:", error);
      throw error;
    }
  },

  async createCategory(
    restaurantUuid: string,
    category: { category_name: string; emoji: string },
  ): Promise<any> {
    try {
      const response = await fetch(
        `${BASE_URL}/categories/v2/restaurant/${restaurantUuid}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(category),
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Category: ", data);
      if (!data.success) {
        throw new Error("Failed to create category");
      }
      return data.data;
    } catch (error) {
      console.error("Failed to create category:", error);
      throw error;
    }
  },
};
