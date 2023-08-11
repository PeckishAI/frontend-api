import axios from './index';

let restaurantUUIDExemple = '514db708-3b64-4cb0-a048-ae1a001e68ad';

let getIngredientList = () => {
  return axios.get('/inventory/' + restaurantUUIDExemple);
};

let addIngredient = (ingredient) => {
  return axios.post('/inventory/' + restaurantUUIDExemple, ingredient);
};

let updateIngredient = (ingredient) => {
  const ingredientFormated = Object.keys(ingredient)
    .filter(
      (key) =>
        key !== 'id' &&
        key !== 'theoriticalStock' &&
        ingredient[key] !== null &&
        ingredient[key] !== undefined &&
        ingredient[key] !== ''
    )
    .reduce((obj, key) => {
      obj[key] = ingredient[key];
      return obj;
    }, {});
  return axios.post(
    '/inventory/' + ingredient.id + '/update',
    ingredientFormated
  );
};

let getIngredientPreview = (ingredient) => {
  return axios.get('/inventory/' + ingredient.id + '/preview');
};

let deleteIngredient = (id) => {
  console.log('delete request');
  return axios.post('/inventory/' + id + '/delete');
};

export const inventoryService = {
  getIngredientList,
  addIngredient,
  updateIngredient,
  getIngredientPreview,
  deleteIngredient,
};
