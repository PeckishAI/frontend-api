import axios from './index';

const restaurantUUIDExemple = '514db708-3b64-4cb0-a048-ae1a001e68ad';

let getRecipes = async () => {
  const res = await axios.get('/restaurant/recipe/' + restaurantUUIDExemple);
  const convertedData = Object.keys(res.data).map((key) => ({
    id: key,
    ...res.data[key],
  }));
  return convertedData;
};

let updateRecipe = (ingredients, recipeId) => {
  const ingredientsWithRestaurantUUID = ingredients.map((ingredient) => ({
    ...ingredient,
    restaurant_uuid: restaurantUUIDExemple,
    ingredient_uuid: ingredient.ingredient_uuid,
  }));
  console.log('update recipe with : ', ingredientsWithRestaurantUUID);
  return axios.post(
    '/restaurant/recipe/' + recipeId + '/update',
    ingredientsWithRestaurantUUID
  );
};

let deleteRecipe = (recipeId) => {
  return axios.post('/restaurant/recipe/' + recipeId + '/delete');
};

let addIngredient = (recipeId, ingredient) => {
  const ingredientWithRestaurantUUID = {
    ...ingredient,
    restaurant_uuid: restaurantUUIDExemple,
    ingredient_uuid: ingredient.ingredient_uuid,
  };
  console.log('add ingredient to recipe : ', ingredientWithRestaurantUUID);
  return axios.post(
    '/restaurant/recipe/' + recipeId + '/add',
    ingredientWithRestaurantUUID
  );
};

let deleteIngredient = (recipeId, ingredientUuid) => {
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
