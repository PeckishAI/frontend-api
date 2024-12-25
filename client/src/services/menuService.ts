import { Product } from "@/types/menu";

import { config } from "../config/config";
const BASE_URL = config.apiBaseUrl;

export const menuService = {
  async createProduct(
    restaurantUuid: string,
    product: Partial<Product>,
  ): Promise<Product> {
    try {
      const response = await fetch(
        `${BASE_URL}/menu/v2/restaurant/${restaurantUuid}/products`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(product),
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error("Failed to create product");
      }
      return data.data;
    } catch (error) {
      console.error("Failed to create product:", error);
      throw error;
    }
  },

  async updateProduct(
    restaurantUuid: string,
    product: Partial<Product>,
  ): Promise<Product> {
    try {
      const response = await fetch(
        `${BASE_URL}/menu/v2/restaurant/${restaurantUuid}/products/${product.product_uuid}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(product),
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error("Failed to update product");
      }
      return data.data;
    } catch (error) {
      console.error("Failed to update product:", error);
      throw error;
    }
  },

  async getRestaurantProducts(restaurantUuid: string): Promise<Product[]> {
    try {
      const response = await fetch(
        `${BASE_URL}/menu/v2/restaurant/${restaurantUuid}/products`,
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
        throw new Error("Failed to fetch products");
      }
      return data.data;
    } catch (error) {
      console.error("Failed to fetch restaurant products:", error);
      throw error;
    }
  },

  async getRestaurantPreparations(restaurantUuid: string): Promise<Product[]> {
    try {
      const response = await fetch(
        `${BASE_URL}/menu/v2/restaurant/${restaurantUuid}/preparations`,
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
        throw new Error("Failed to fetch preparations");
      }
      return data.data;
    } catch (error) {
      console.error("Failed to fetch restaurant preparations:", error);
      throw error;
    }
  },
};
