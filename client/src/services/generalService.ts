import { config } from "../config/config";
const BASE_URL = config.apiBaseUrl;

export const generalService = {
  async getRestaurantSales(
    restaurantUuid: string,
    dates: object,
  ): Promise<any> {
    try {
      const response = await fetch(
        `${BASE_URL}/metrics/v2/restaurant/${restaurantUuid}/sales`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dates),
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

  async getRestaurantInventoryValue(
    restaurantUuid: string,
    dates: object,
  ): Promise<any> {
    try {
      const response = await fetch(
        `${BASE_URL}/metrics/v2/restaurant/${restaurantUuid}/inventory_value`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dates),
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

  async getRestaurantCostOfSales(
    restaurantUuid: string,
    dates: object,
  ): Promise<any> {
    try {
      const response = await fetch(
        `${BASE_URL}/metrics/v2/restaurant/${restaurantUuid}/cost_of_sales`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dates),
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

  async getRestaurantProcurementCost(
    restaurantUuid: string,
    dates: object,
  ): Promise<any> {
    try {
      const response = await fetch(
        `${BASE_URL}/metrics/v2/restaurant/${restaurantUuid}/procurement_cost`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dates),
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
};
