import { config } from "../config/config";
const BASE_URL = config.apiBaseUrl;

export const userService = {
  async getUserProfile(userUuid: string): Promise<any> {
    try {
      userUuid = "7d5844cc-74f1-4f50-b63e-7324fdedf57c";
      const response = await fetch(`${BASE_URL}/users/v2/user/${userUuid}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error("Failed to fetch categories");
      }
      console.log("user: ", data);
      return data.data;
    } catch (error) {
      console.error("Failed to fetch restaurant categories:", error);
      throw error;
    }
  },

  async updateUserProfile(
    userUuid: string,
    data: object | FormData,
  ): Promise<any> {
    const headers: HeadersInit = {};

    if (data instanceof FormData) {
      // Don't set Content-Type for FormData, browser will set it with boundary
    } else {
      headers["Content-Type"] = "application/json";
      data = JSON.stringify(data);
    }
    try {
      userUuid = "7d5844cc-74f1-4f50-b63e-7324fdedf57c";
      const response = await fetch(`${BASE_URL}/users/v2/user/${userUuid}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error("Failed to fetch categories");
      }
      return data.data;
    } catch (error) {
      console.error("Failed to fetch restaurant categories:", error);
      throw error;
    }
  },
};