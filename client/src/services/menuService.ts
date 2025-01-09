import { Product, Preparation, Modifier } from "@/types/menu";

import { config } from "../config/config";
const BASE_URL = config.apiBaseUrl;

export const menuService = {
  async getRestaurantModifiers(restaurantUuid: string): Promise<Modifier[]> {
    try {
      const response = await fetch(
        `${BASE_URL}/menu/v2/restaurant/${restaurantUuid}/modifiers`,
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
        throw new Error("Failed to fetch modifiers");
      }
      return data.data;
    } catch (error) {
      console.error("Failed to fetch restaurant modifiers:", error);
      throw error;
    }
  },

  async createModifier(
    restaurantUuid: string,
    modifier: Partial<Modifier>,
  ): Promise<Modifier> {
    try {
      const response = await fetch(
        `${BASE_URL}/menu/v2/restaurant/${restaurantUuid}/modifiers`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(modifier),
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error("Failed to create modifier");
      }
      return data.data;
    } catch (error) {
      console.error("Failed to create modifier:", error);
      throw error;
    }
  },

  async updateModifier(
    restaurantUuid: string,
    modifierUuid: string,
    modifier: Partial<Modifier>,
  ) {
    try {
      const response = await fetch(
        `${BASE_URL}/menu/v2/restaurant/${restaurantUuid}/modifiers/modifier/${modifierUuid}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(modifier),
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error("Failed to update modifier");
      }
      return data.data;
    } catch (error) {
      console.error("Failed to update modifier:", error);
      throw error;
    }
  },
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
        `${BASE_URL}/menu/v2/restaurant/${restaurantUuid}/products/product/${product.product_uuid}`,
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

  async getRestaurantPreparations(
    restaurantUuid: string,
  ): Promise<Preparation[]> {
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
      console.log("Preps: ", data);
      if (!data.success) {
        throw new Error("Failed to fetch preparations");
      }
      console.log("Preps: ", data.data);
      return data.data;
    } catch (error) {
      console.error("Failed to fetch restaurant preparations:", error);
      throw error;
    }
  },

  async updatePreparation(
    restaurantUuid: string,
    preparation: Preparation,
  ): Promise<Preparation> {
    try {
      const response = await fetch(
        `${BASE_URL}/menu/v2/restaurant/${restaurantUuid}/preparations/preparation/${preparation.preparation_uuid}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(preparation),
        },
      );

      if (!response.ok) {
        console.error("Server response not ok:", response.status);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error("Failed to update preparation");
      }
      return data.data;
    } catch (error) {
      console.error("Failed to update preparation:", error);
      throw error;
    }
  },

  async createPreparation(
    restaurantUuid: string,
    preparation: any,
  ): Promise<Preparation> {
    try {
      const response = await fetch(
        `${BASE_URL}/menu/v2/restaurant/${restaurantUuid}/preparations`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(preparation),
        },
      );

      if (!response.ok) {
        console.error("Server response not ok:", response.status);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error("Failed to create preparation");
      }
      return data.data;
    } catch (error) {
      console.error("Failed to create preparation:", error);
      throw error;
    }
  },
};
