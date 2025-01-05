import { Restaurant } from "../types/restaurant";

import { config } from "../config/config";
const BASE_URL = config.apiBaseUrl;

export const restaurantService = {
  async getRestaurants(): Promise<Restaurant[]> {
    try {
      const response = await fetch(
        `${BASE_URL}/restaurants/v2/user/7d5844cc-74f1-4f50-b63e-7324fdedf57c`,
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
      return data.data as Restaurant[];
    } catch (error) {
      console.error("Failed to fetch restaurants:", error);
      throw error;
    }
  },

  async getRestaurantCurrency(restaurantUuid: string): Promise<any> {
    console.log("Restaurant Service - Fetching currency for UUID:", restaurantUuid);
    try {
      const response = await fetch(
        `${BASE_URL}/restaurants/v2/restaurant/${restaurantUuid}/currency`,
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
      const currencyISO = data.data.currency;

      const getSymbol = (currency: string) => {
        try {
          const symbol = new Intl.NumberFormat('en-US', {
            style: "currency",
            currency,
          })
            .formatToParts(0)
            .find((x) => x.type === "currency");
          return symbol?.value || currency;
        } catch {
          // Fallback symbols for common currencies
          const symbols: {[key: string]: string} = {
            'USD': '$',
            'EUR': '€',
            'GBP': '£'
          };
          return symbols[currency] || currency;
        }
      };

      const symbol = getSymbol(currencyISO?.currency || 'USD');
      return { 
        currencyISO: currencyISO?.currency || 'USD', 
        currencySymbol: symbol 
      };
    } catch (error) {
      console.error("Failed to fetch restaurants:", error);
      throw error;
    }
  },
};
