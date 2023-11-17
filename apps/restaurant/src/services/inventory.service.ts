import axios, { Ingredient } from './index';

export type Invoice = {
  items: {
    uuid: string;
    detectedName?: string;
    mappedName?: string;
    quantity?: number;
    totalPrice?: number;
    unitPrice?: number;
  }[];
  supplier?: string;
  amount?: number;
};

const getIngredientList = async (
  restaurantUUID: string
): Promise<Ingredient[]> => {
  const res = await axios.get('/inventory/' + restaurantUUID);

  return Object.keys(res.data).map<Ingredient>((key) => ({
    id: key,
    safetyStock: 0,
    unitCost: res.data[key]['cost'],
    ...res.data[key],
  }));
};

const addIngredient = (restaurantUUID: string, ingredient) => {
  return axios.post('/inventory/' + restaurantUUID, ingredient);
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
    '/inventory/' + ingredient.id + '/update',
    ingredientFormated
  );
};

const getIngredientPreview = (ingredientId: string) => {
  return axios.get<string[]>('/inventory/' + ingredientId + '/preview');
};

const deleteIngredient = (id: string) => {
  return axios.post('/inventory/' + id + '/delete');
};

export type ColumnsNameMapping = {
  ingredient: string;
  quantity: string;
  unit: string;
  cost: string;
  supplier: string;
};

export type PreviewCsvResponse = {
  detectedColumns: ColumnsNameMapping;
  fileColumns: string[];
};

const uploadCsvFile = async (
  restaurantUUID: string,
  file: File
): Promise<PreviewCsvResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  const res = await axios.post(
    '/inventory/' + restaurantUUID + '/upload/smart_reader',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return {
    fileColumns: res.data.file_columns,
    detectedColumns: res.data.detected_columns,
  };
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

const getPreviewUploadedCsv = async (
  restaurantUUID: string,
  file: File,
  headerValues: ColumnsNameMapping
) => {
  const formData = getFormData(file, headerValues);
  const res = await axios.post(
    '/inventory/' + restaurantUUID + '/upload/preview',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return res.data as ColumnsNameMapping[];
};

const validUploadedCsv = (
  restaurantUUID: string,
  file: File,
  headerValues: ColumnsNameMapping
) => {
  const formData = getFormData(file, headerValues);

  return axios.post('/inventory/' + restaurantUUID + '/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

const uploadImgFile = async (
  restaurantUUID: string,
  file: File
): Promise<Invoice> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('restaurant_uuid', restaurantUUID);

  console.log('file::: ', file);

  const res = await axios.post(
    'https://invoices-api-k2w3p2ptza-ew.a.run.app/api/v1/extract',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  console.log('invoice res : ', res);

  return {
    amount: res.data.total_amount,
    supplier: res.data.supplier,
    items: res.data.items.map((item) => ({
      uuid: item.uuid,
      detectedName: item.base,
      mappedName: item.name,
      quantity: item.quantity,
      totalPrice: item.total_price,
      unitPrice: item.unit_price,
    })),
  };
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
  uploadImgFile,
};
