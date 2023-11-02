import axios from './index';

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
  uuid: string;
  name: string;
  quantity: number;
  unit: string;
};

const getRecipes = async (restaurantUUID: string): Promise<Recipe[]> => {
  const res = await axios.get('/recipe/' + restaurantUUID);
  const convertedData: Recipe[] = Object.keys(res.data).map((key) => ({
    ...res.data[key],
    uuid: key,
    ingredients: res.data[key]['ingredients'].map((ingredient: any) => ({
      uuid: ingredient['ingredient_uuid'],
      name: ingredient['ingredient_name'],
      quantity: ingredient['quantity'],
      unit: ingredient['unit'],
    })),
  }));

  return convertedData;
};

const updateRecipe = (restaurantUUID: string, ingredients, recipeId) => {
  const ingredientsWithRestaurantUUID = ingredients.map((ingredient) => ({
    ...ingredient,
    restaurant_uuid: restaurantUUID,
    ingredient_uuid: ingredient.ingredient_uuid,
  }));
  return axios.post(
    '/recipe/' + recipeId + '/update',
    ingredientsWithRestaurantUUID
  );
};

const deleteRecipe = (recipeId) => {
  return axios.post('/recipe/' + recipeId + '/delete');
};

const addIngredient = (restaurantUUID: string, recipeId, ingredient) => {
  const ingredientWithRestaurantUUID = {
    ...ingredient,
    restaurant_uuid: restaurantUUID,
    ingredient_uuid: ingredient.ingredient_uuid,
  };
  return axios.post(
    '/recipe/' + recipeId + '/add',
    ingredientWithRestaurantUUID
  );
};

const deleteIngredient = (recipeId, ingredientUuid) => {
  return axios.post('/recipe/' + recipeId + '/' + ingredientUuid + '/delete');
};

export const recipesService = {
  getRecipes,
  updateRecipe,
  deleteRecipe,
  addIngredient,
  deleteIngredient,
};
