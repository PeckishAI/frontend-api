import axios from './index';

let restaurantUUIDExemple = '514db708-3b64-4cb0-a048-ae1a001e68ad';

let getIngredientList = () => {
  return axios.get('/restaurant/inventory/' + restaurantUUIDExemple);
};

let addIngredient = (ingredient) => {
  return axios.post(
    '/restaurant/inventory/' + restaurantUUIDExemple,
    ingredient
  );
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
    '/restaurant/inventory/' + ingredient.id + '/update',
    ingredientFormated
  );
};

let getIngredientPreview = (ingredient) => {
  return axios.get('/restaurant/inventory/' + ingredient.id + '/preview');
};

let deleteIngredient = (id) => {
  console.log('delete request');
  return axios.post('/restaurant/inventory/' + id + '/delete');
};

let uploadCsvFile = (file) => {
  let formData = new FormData();
  formData.append('file', file);
  return axios.post(
    '/restaurant/inventory/' + restaurantUUIDExemple + '/upload/smart_reader',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
};

let getPreviewUploadedCsv = (file, headerValues) => {
  let formData = new FormData();
  formData.append('file', file);
  formData.append('ingredient', headerValues.ingredient);
  formData.append('quantity', headerValues.quantity);
  formData.append('unit', headerValues.unit);
  return axios.post(
    '/inventory/' + restaurantUUIDExemple + '/upload/preview',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
};

let validUploadedCsv = (file, headerValues) => {
  let formData = new FormData();
  formData.append('file', file);
  formData.append('ingredient', headerValues.ingredient);
  formData.append('quantity', headerValues.quantity);
  formData.append('unit', headerValues.unit);
  return axios.post(
    '/inventory/' + restaurantUUIDExemple + '/upload',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
};

export const inventoryService = {
  getIngredientList,
  addIngredient,
  updateIngredient,
  getIngredientPreview,
  deleteIngredient,
  uploadCsvFile,
  getPreviewUploadedCsv,
  validUploadedCsv,
};
