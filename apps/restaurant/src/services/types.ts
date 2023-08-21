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
  price: number;
  currency: string;
  ingredients: IngredientForRecipe[];
};
export type IngredientForRecipe = {
  ingredient_uuid: string;
  ingredient_name: string;
  quantity: number;
  unit: string;
};
