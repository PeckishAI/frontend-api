import axios from './index';

const getIngredientList = (restaurantUUID: string) => {
  return axios.get('/restaurant/inventory/' + restaurantUUID);
};

const addIngredient = (restaurantUUID: string, ingredient) => {
  return axios.post('/restaurant/inventory/' + restaurantUUID, ingredient);
};

const updateIngredient = (ingredient) => {
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

const getIngredientPreview = (ingredient) => {
  return axios.get('/restaurant/inventory/' + ingredient.id + '/preview');
};

const deleteIngredient = (id: string) => {
  return axios.post('/restaurant/inventory/' + id + '/delete');
};

const uploadCsvFile = (restaurantUUID: string, file) => {
  const formData = new FormData();
  formData.append('file', file);
  return axios.post(
    '/restaurant/inventory/' + restaurantUUID + '/upload/smart_reader',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
};

const getPreviewUploadedCsv = (restaurantUUID: string, file, headerValues) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('ingredient', headerValues.ingredient);
  formData.append('quantity', headerValues.quantity);
  formData.append('unit', headerValues.unit);
  return axios.post(
    '/inventory/' + restaurantUUID + '/upload/preview',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
};

const validUploadedCsv = (restaurantUUID: string, file, headerValues) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('ingredient', headerValues.ingredient);
  formData.append('quantity', headerValues.quantity);
  formData.append('unit', headerValues.unit);
  return axios.post('/inventory/' + restaurantUUID + '/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
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
