import axios from './index';

let restaurantUUIDExemple = '514db708-3b64-4cb0-a048-ae1a001e68ad';

let getIngredientList = async () => {
  const res = await axios.get('/inventory/' + restaurantUUIDExemple);
  console.log('inventory request status', res.status);
  const convertedData = Object.keys(res.data).map((key) => ({
    id: key,
    theoriticalStock: 0, // Tempoprary till API implementation
    ...res.data[key],
  }));
  return { data: convertedData, requestStatus: res.status };
};

let addIngredient = (ingredient) => {
  return axios.post('/inventory/' + restaurantUUIDExemple, ingredient);
};

let updateIngredient = (ingredient) => {
  const ingredientFormated = Object.keys(ingredient)
    .filter((key) => key !== 'id' && key !== 'theoriticalStock')
    .reduce((obj, key) => {
      obj[key] = ingredient[key];
      return obj;
    }, {});
  console.log('without remove id :', ingredient);
  console.log('with remove id :', ingredientFormated);
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
