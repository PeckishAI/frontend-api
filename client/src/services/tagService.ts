
import { config } from '../config/config';
const BASE_URL = config.apiBaseUrl;

export interface Tag {
  tag_uuid: string;
  tag_name: string;
}

export const tagService = {
  async getRestaurantTags(restaurantUuid: string): Promise<any> {
    try {
      const response = await fetch(
        `${BASE_URL}/tags/v2/restaurant/${restaurantUuid}`,
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
        throw new Error("Failed to fetch tags");
      }
      return data;
    } catch (error) {
      console.error("Failed to fetch restaurant tags:", error);
      throw error;
    }
  },
};
