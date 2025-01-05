import { createContext, useContext, useState, ReactNode } from "react";
import { Restaurant } from "@/types/restaurant";

type RestaurantContextType = {
  currentRestaurant: Restaurant | null;
  setCurrentRestaurant: (restaurant: Restaurant | null) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
};

const RestaurantContext = createContext<RestaurantContextType | undefined>(
  undefined,
);

export function RestaurantProvider({ children }: { children: ReactNode }) {
  const [currentRestaurant, setCurrentRestaurant] = useState<Restaurant | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);

  return (
    <RestaurantContext.Provider
      value={{
        currentRestaurant,
        setCurrentRestaurant,
        isLoading,
        setIsLoading,
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
