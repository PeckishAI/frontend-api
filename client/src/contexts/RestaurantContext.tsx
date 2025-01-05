
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Restaurant } from "@/types/restaurant";
import { restaurantService } from "@/services/restaurantService";

type CurrencyInfo = {
  currencyISO: string;
  currencySymbol: string;
};

type RestaurantContextType = {
  currentRestaurant: Restaurant | null;
  setCurrentRestaurant: (restaurant: Restaurant | null) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  currencyInfo: CurrencyInfo | null;
};

const RestaurantContext = createContext<RestaurantContextType | undefined>(
  undefined,
);

export function RestaurantProvider({ children }: { children: ReactNode }) {
  const [currentRestaurant, setCurrentRestaurant] = useState<Restaurant | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [currencyInfo, setCurrencyInfo] = useState<CurrencyInfo | null>(null);

  useEffect(() => {
    async function fetchCurrencyInfo() {
      console.log("Restaurant Context - Current Restaurant:", currentRestaurant);
      if (currentRestaurant?.restaurant_uuid) {
        try {
          console.log("Restaurant Context - Fetching currency for UUID:", currentRestaurant.restaurant_uuid);
          const currency = await restaurantService.getRestaurantCurrency(
            currentRestaurant.restaurant_uuid,
          );
          console.log("Restaurant Context - Received currency data:", currency);
          console.log("Restaurant Context - Currency ISO:", currency.currencyISO);
          console.log("Restaurant Context - Currency Symbol:", currency.currencySymbol);
          setCurrencyInfo({
            currencyISO: currency.currencyISO,
            currencySymbol: currency.currencySymbol
          });
        } catch (error) {
          console.error("Failed to fetch currency info:", error);
          setCurrencyInfo(null);
        }
      } else {
        setCurrencyInfo(null);
      }
    }

    fetchCurrencyInfo();
  }, [currentRestaurant?.restaurant_uuid]);

  return (
    <RestaurantContext.Provider
      value={{
        currentRestaurant,
        setCurrentRestaurant,
        isLoading,
        setIsLoading,
        currencyInfo,
      }}
    >
      {children}
    </RestaurantContext.Provider>
  );
}

export function useRestaurantContext() {
  const context = useContext(RestaurantContext);
  if (context === undefined) {
    throw new Error(
      "useRestaurantContext must be used within a RestaurantProvider",
    );
  }
  return context;
}
