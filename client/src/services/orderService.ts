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
      return data.data || [];
    } catch (error) {
      console.error("Failed to fetch restaurant orders:", error);
      throw error;
    }
  },

  async createOrder(
    restaurantUuid: string,
    order: Omit<Order, "order_uuid">,
  ): Promise<any> {
    try {
      const response = await fetch(
        `${BASE_URL}/orders/v2/restaurant/${restaurantUuid}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(order),
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error("Failed to create order:", error);
      throw error;
    }
  },

  async updateOrder(
    restaurantUuid: string,
    orderUuid: string,
    order: Partial<Order>,
  ): Promise<any> {
    try {
      const response = await fetch(
        `${BASE_URL}/orders/v2/restaurant/${restaurantUuid}/order/${orderUuid}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(order),
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error("Failed to update order:", error);
      throw error;
    }
  },
};
