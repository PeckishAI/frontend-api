import {
  Unit,
  Stocktake,
  StocktakeDocument,
  StocktakeIngredient,
  Invoices,
} from "../lib/DocumentTypes";

import { config } from "../config/config";
const BASE_URL = config.apiBaseUrl;

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const documentService = {
  async getInvoice(
    restaurantUuid: string,
    invoiceUuid: string,
  ): Promise<Invoices> {
    try {
      const response = await fetch(
        `${BASE_URL}/documents/v2/restaurant/${restaurantUuid}/invoices/invoice/${invoiceUuid}`,
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
        throw new Error("Failed to fetch invoice");
      }
      return data.data;
    } catch (error) {
      console.error("Failed to fetch invoice:", error);
      throw error;
    }
  },

  async updateInvoice(
    restaurantUuid: string,
    invoiceUuid: string,
    invoice: any,
  ): Promise<Invoices> {
    try {
      const response = await fetch(
        `${BASE_URL}/documents/v2/restaurant/${restaurantUuid}/invoices/invoice/${invoiceUuid}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(invoice),
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error("Failed to fetch invoice");
      }
      return data.data;
    } catch (error) {
      console.error("Failed to fetch invoice:", error);
      throw error;
    }
  },

  async deleteInvoice(
    restaurantUuid: string,
    invoiceUuid: string,
  ): Promise<Invoices> {
    try {
      const response = await fetch(
        `${BASE_URL}/documents/v2/restaurant/${restaurantUuid}/invoices/invoice/${invoiceUuid}`,
        {
          method: "DELETE",
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
        throw new Error("Failed to fetch invoice");
      }
      return data;
    } catch (error) {
      console.error("Failed to fetch invoice:", error);
      throw error;
    }
  },

  async getRestaurantInvoices(restaurantUuid: string): Promise<Invoices[]> {
    try {
      const url = `${BASE_URL}/documents/v2/restaurant/${restaurantUuid}/invoices`;
      const response = await fetch(
        `${BASE_URL}/documents/v2/restaurant/${restaurantUuid}/invoices`,
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

      const data: ApiResponse<Invoices[]> = await response.json();
      if (!data.success) {
        throw new Error("Failed to fetch invoices");
      }
      return data.data;
    } catch (error) {
      console.error("Failed to fetch restaurant invoices:", error);
      throw error;
    }
  },
  async getRestaurantStocktakes(restaurantUuid: string): Promise<any> {
    try {
      const response = await fetch(
        `${BASE_URL}/documents/v2/restaurant/${restaurantUuid}/stocktakes`,
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
        throw new Error("Failed to fetch inventory");
      }
      return data.data;
    } catch (error) {
      console.error("Failed to fetch restaurant inventory:", error);
      throw error;
    }
  },
  async getRestaurantStocktake(
    restaurantUuid: string,
    stocktakeUuid: string,
  ): Promise<any> {
    try {
      const response = await fetch(
        `${BASE_URL}/documents/v2/restaurant/${restaurantUuid}/stocktakes/stocktake/${stocktakeUuid}`,
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
        throw new Error("Failed to fetch inventory");
      }
      return data.data;
    } catch (error) {
      console.error("Failed to fetch restaurant inventory:", error);
      throw error;
    }
  },
};
