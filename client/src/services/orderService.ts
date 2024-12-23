import type { Order } from "@/lib/OrderTypes";

import { config } from "../config/config";
const BASE_URL = config.apiBaseUrl;

export const orderService = {
  async getRestaurantOrders(restaurantUuid: string): Promise<Order[]> {
    try {
      const response = await fetch(
        `${BASE_URL}/orders/v2/restaurant/${restaurantUuid}`,
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
        throw new Error("Failed to fetch orders");
      }
      console.log("Orders : ", data);
      return data;
    } catch (error) {
      console.error("Failed to fetch restaurant orders:", error);
      throw error;
    }
  },
};
