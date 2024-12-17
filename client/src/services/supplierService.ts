
import type { Supplier } from "@/lib/types";

const BASE_URL = "https://76032c8e-3d86-413b-9c48-7b818a8ffaa3-00-9k9j5uta5z7r.janeway.replit.dev";

export const supplierService = {
  async getRestaurantSuppliers(restaurantUuid: string): Promise<any> {
    try {
      const response = await fetch(
        `${BASE_URL}/suppliers/v2/restaurant/${restaurantUuid}`,
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
        throw new Error("Failed to fetch suppliers");
      }
      return data;
    } catch (error) {
      console.error("Failed to fetch restaurant suppliers:", error);
      throw error;
    }
  },
};
