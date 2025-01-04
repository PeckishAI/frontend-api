import { config } from "../config/config";
const BASE_URL = config.apiBaseUrl;

export interface Unit {
  unit_uuid: string;
  unit_name: string;
  unit_type?: string;
}

export const unitService = {
  async getReferenceUnit(): Promise<any> {
    try {
      const response = await fetch(`${BASE_URL}/units/v2/unit_reference`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error("Failed to fetch units");
      }

      // Transform the data as per the new format
      return result.data.map((unit: any) => ({
        unit_uuid: unit.unit_uuid,
        unit_name: unit.unit_name,
        category: "reference",
      }));
    } catch (error) {
      console.error("Failed to fetch restaurant units:", error);
      throw error;
    }
  },

  async getRestaurantUnit(restaurantUuid: string): Promise<any> {
    try {
      const response = await fetch(
        `${BASE_URL}/units/v2/restaurant/${restaurantUuid}`,
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

  async createUnit(
    unit: { unit_name: string },
    restaurantUuid: string,
  ): Promise<any> {
    try {
      const response = await fetch(
        `${BASE_URL}/units/v2/restaurant/${restaurantUuid}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(unit),
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
      console.log("Result: ", result);
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
      console.log("Conversion factor:", result.data);
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
