import axios from './index';

const getRecipes = async (restaurantUUID: string) => {
  const res = await axios.get('/restaurant/recipe/' + restaurantUUID);
  const convertedData = Object.keys(res.data).map((key) => ({
    id: key,
    ...res.data[key],
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
    '/restaurant/recipe/' + recipeId + '/update',
    ingredientsWithRestaurantUUID
  );
};

const deleteRecipe = (recipeId) => {
  return axios.post('/restaurant/recipe/' + recipeId + '/delete');
};

const addIngredient = (restaurantUUID: string, recipeId, ingredient) => {
  const ingredientWithRestaurantUUID = {
    ...ingredient,
    restaurant_uuid: restaurantUUID,
    ingredient_uuid: ingredient.ingredient_uuid,
  };
  return axios.post(
    '/restaurant/recipe/' + recipeId + '/add',
    ingredientWithRestaurantUUID
  );
};

const deleteIngredient = (recipeId, ingredientUuid) => {
  return axios.post(
    '/restaurant/recipe/' + recipeId + '/' + ingredientUuid + '/delete'
  );
};

export const recipesService = {
  getRecipes,
  updateRecipe,
  deleteRecipe,
  addIngredient,
  deleteIngredient,
};
