import {
  Unit,
  Stocktake,
  StocktakeDocument,
  StocktakeIngredient,
} from "../lib/DocumentTypes";

import { config } from "../config/config";
const BASE_URL = config.apiBaseUrl;

export const documentService = {
  async getRestaurantStocktakes(restaurantUuid: string): Promise<any> {
    try {
      const response = await fetch(
        `${BASE_URL}/documents/v2/restaurant/${restaurantUuid}/stocktakes`,
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
      return data.data;
    } catch (error) {
      console.error("Failed to fetch restaurant inventory:", error);
      throw error;
    }
  },
  async getRestaurantStocktake(
    restaurantUuid: string,
    stocktakeUuid: string,
  ): Promise<any> {
    try {
      const response = await fetch(
        `${BASE_URL}/documents/v2/restaurant/${restaurantUuid}/stocktakes/stocktake/${stocktakeUuid}`,
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
      return data.data;
    } catch (error) {
      console.error("Failed to fetch restaurant inventory:", error);
      throw error;
    }
  },
};
