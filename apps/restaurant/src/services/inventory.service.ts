import axios, { Ingredient } from './index';

const getIngredientList = async (
  restaurantUUID: string
): Promise<Ingredient[]> => {
  const res = await axios.get('/restaurant/inventory/' + restaurantUUID);

  return Object.keys(res.data).map((key) => ({
    id: key,
    theoriticalStock: 0,
    ...res.data[key],
  }));
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

const getIngredientPreview = (ingredientId: string) => {
  return axios.get<string[]>(
    '/restaurant/inventory/' + ingredientId + '/preview'
  );
};

const deleteIngredient = (id: string) => {
  return axios.post('/restaurant/inventory/' + id + '/delete');
};

export type ColumnsNameMapping = {
  ingredient: string;
  quantity: string;
  unit: string;
  cost: string;
  supplier: string;
};

export type PreviewResponse = {
  detected_columns: ColumnsNameMapping;
  file_columns: string[];
};

const uploadCsvFile = (restaurantUUID: string, file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return axios.post<PreviewResponse>(
    '/restaurant/inventory/' + restaurantUUID + '/upload/smart_reader',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
};

const getFormData = (file: File, headerValues: ColumnsNameMapping) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('ingredient', headerValues.ingredient);
  formData.append('quantity', headerValues.quantity);
  formData.append('unit', headerValues.unit);
  formData.append('cost', headerValues.cost);
  formData.append('supplier', headerValues.supplier);
  return formData;
};

const getPreviewUploadedCsv = (
  restaurantUUID: string,
  file: File,
  headerValues: ColumnsNameMapping
) => {
  const formData = getFormData(file, headerValues);
  return axios.post(
    '/restaurant/inventory/' + restaurantUUID + '/upload/preview',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
};

const validUploadedCsv = (
  restaurantUUID: string,
  file: File,
  headerValues: ColumnsNameMapping
) => {
  const formData = getFormData(file, headerValues);

  return axios.post(
    '/restaurant/inventory/' + restaurantUUID + '/upload',
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
