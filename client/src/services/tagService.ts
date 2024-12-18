import { config } from "../config/config";
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

  async createTag(
    tag: { tag_name: string },
    restaurantUuid: string,
  ): Promise<any> {
    try {
      const response = await fetch(
        `${BASE_URL}/tags/v2/restaurant/${restaurantUuid}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(tag),
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Tag Created : ", result.data);
      if (!result.success) {
        throw new Error("Failed to create tag");
      }
      return result.data;
    } catch (error) {
      console.error("Failed to create tag:", error);
      throw error;
    }
  },
};
