import { Restaurant } from "../types/restaurant";

// Using relative URL since backend is served through the same Express server
export const restaurantService = {
  async getRestaurants(): Promise<Restaurant[]> {
    try {
      const response = await fetch("/api/restaurants/v2", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Error response:', errorData);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.data as Restaurant[];
    } catch (error) {
      console.error("Failed to fetch restaurants:", error);
      throw error;
    }
  },
};