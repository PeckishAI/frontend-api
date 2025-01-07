import { config } from "../config/config";
const BASE_URL = config.apiBaseUrl;

export interface Unit {
  unit_uuid?: string;
  unit_name?: string;
}

export interface ReceiveQuantity {
  uuid?: string;
  ingredient_uuid?: string;
  ingredient_name?: string;
  quantity?: number;
  unit?: Unit;
}

export interface ReceiveIngredients {
  receive_uuid?: string;
  receivedIngredients?: ReceiveQuantity[];
}

export const quantityService = {
  async createReceiveQuantities(
    restaurantUuid: string,
    receiveIngredients: ReceiveIngredients,
  ): Promise<any> {
    try {
      const response = await fetch(
        `${BASE_URL}/quantity/v2/restaurant/${restaurantUuid}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(receiveIngredients),
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error("Failed to create unit");
      }
      return result.data;
    } catch (error) {
      console.error("Failed to create unit:", error);
      throw error;
    }
  },

  async getSupplierIngredientUnits(
    restaurantUuid: string,
    supplierUuid: string,
  ): Promise<any> {
    try {
      const response = await fetch(
        `${BASE_URL}/units/v2/restaurant/${restaurantUuid}/supplier/${supplierUuid}/ingredients`,
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

      const result = await response.json();
      if (!result.success) {
        throw new Error("Failed to fetch supplier ingredient units");
      }
      return result.data;
    } catch (error) {
      console.error("Failed to fetch supplier ingredient units:", error);
      throw error;
    }
  },

  async getConversionFactor(
    ingredientUuid: string,
    fromUnitUuid: string,
    toUnitUuid: string,
  ): Promise<any> {
    try {
      const response = await fetch(
        `${BASE_URL}/units/v2/conversions/from/${fromUnitUuid}/to/${toUnitUuid}/ingredient/${ingredientUuid}`,
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

      const result = await response.json();
      if (!result.success) {
        throw new Error("Failed to create unit");
      }
      return result.data;
    } catch (error) {
      console.error("Failed to create unit:", error);
      throw error;
    }
  },

  async getPreparationConversionFactor(
    preparationUuid: string,
    fromUnitUuid: string,
    toUnitUuid: string,
  ): Promise<any> {
    try {
      const response = await fetch(
        `${BASE_URL}/units/v2/conversions/from/${fromUnitUuid}/to/${toUnitUuid}/preparations/${preparationUuid}`,
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

      const result = await response.json();
      if (!result.success) {
        throw new Error("Failed to create unit");
      }
      return result.data;
    } catch (error) {
      console.error("Failed to create unit:", error);
      throw error;
    }
  },
};
