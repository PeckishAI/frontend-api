import { config } from "../config/config";
const BASE_URL = config.apiBaseUrl;

export const userService = {
  async getUserProfile(userUuid: string): Promise<any> {
    try {
      const accessToken = localStorage.getItem("accessToken");
      const response = await fetch(`${BASE_URL}/auth/v2/me`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
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
      console.error("Failed to fetch user:", error);
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
