import { Restaurant } from "../types/restaurant";
import { config } from "../config/config";
const BASE_URL = config.apiBaseUrl;

export const restaurantService = {
  async getRestaurants(): Promise<Restaurant[]> {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(
        `${BASE_URL}/auth/v2/restaurants`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          credentials: 'include',
        },
      );

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Unauthorized access to restaurants");
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || "Failed to fetch restaurants");
      }
      return data.data;
    } catch (error) {
      console.error("Failed to fetch restaurants:", error);
      throw error;
    }
  },

  async createRestaurant(restaurant: Omit<Restaurant, "restaurant_uuid">): Promise<Restaurant> {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(`${BASE_URL}/auth/v2/restaurants`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(restaurant),
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Unauthorized to create restaurant");
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || "Failed to create restaurant");
      }
      return data.data;
    } catch (error) {
      console.error("Failed to create restaurant:", error);
      throw error;
    }
  },

  async updateRestaurant(restaurantUuid: string, restaurant: Partial<Restaurant>): Promise<Restaurant> {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(
        `${BASE_URL}/auth/v2/restaurants/${restaurantUuid}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify(restaurant),
          credentials: 'include',
        },
      );

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Unauthorized to update restaurant");
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || "Failed to update restaurant");
      }
      return data.data;
    } catch (error) {
      console.error("Failed to update restaurant:", error);
      throw error;
    }
  },

  async getRestaurantCurrency(restaurantUuid: string): Promise<any> {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(
        `${BASE_URL}/auth/v2/restaurants/${restaurantUuid}/currency`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          credentials: 'include',
        },
      );

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Unauthorized to access restaurant currency");
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || "Failed to fetch restaurant currency");
      }

      const currencyISO = data.data.currency;
      const getSymbol = (currency: string) => {
        try {
          const symbol = new Intl.NumberFormat("en-US", {
            style: "currency",
            currency,
          })
            .formatToParts(0)
            .find((x) => x.type === "currency");
          return symbol?.value || currency;
        } catch {
          const symbols: { [key: string]: string } = {
            USD: "$",
            EUR: "€",
            GBP: "£",
          };
          return symbols[currency] || currency;
        }
      };

      const symbol = getSymbol(currencyISO?.currency || "USD");
      return {
        currencyISO: currencyISO?.currency || "USD",
        currencySymbol: symbol,
      };
    } catch (error) {
      console.error("Failed to fetch restaurant currency:", error);
      throw error;
    }
  },
};