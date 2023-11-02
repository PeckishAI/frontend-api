import { useEffect, useState } from 'react';
import { Ingredient } from './types';
import { inventoryService } from './inventory.service';
import { useRestaurantStore } from '../store/useRestaurantStore';

/**
 * Custom hook to fetch ingredients from the API easily
 * @returns  ingredients is an array of Ingredient objects, loading is a boolean, error is an Error object
 */
export const useIngredients = () => {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const restaurantUUID = useRestaurantStore(
    (state) => state.selectedRestaurantUUID
  );

  useEffect(() => {
    if (!restaurantUUID) return;

    setIsLoading(true);
    inventoryService
      .getIngredientList(restaurantUUID)
      .then(setIngredients)
      .catch((e) => {
        console.error('useIngredients error', e);
        setError(e);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [restaurantUUID]);

  return { ingredients, loading, error };
};
