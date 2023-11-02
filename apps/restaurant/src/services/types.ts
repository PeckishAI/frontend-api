export type Ingredient = {
  id: string;
  name: string;
  theoreticalStock: number;
  quantity: number;
  unit: string;
  supplier: string;
  cost: number;
  actions: void;
};

export type Recipe = {
  id: string;
  name: string;
  category: string;
  price: number;
  cost: number;
  margin: number;
  currency: string;
  ingredients: IngredientForRecipe[];
  isOnboarded: boolean;
};
export type IngredientForRecipe = {
  ingredient_uuid: string;
  ingredient_name: string;
  quantity: number;
  unit: string;
};
