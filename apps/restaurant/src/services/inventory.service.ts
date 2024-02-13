import axios, { Ingredient } from './index';

export type Invoice = {
  document_uuid?: string;
  created_at?: string;
  date?: string;
  supplier?: string;
  ingredients: {
    ingredient_name?: string;
    mapping_name?: string;
    mapping_uuid?: string;
    quantity?: number;
    unit?: string;
    total_price?: number;
  }[];
  restaurant_uuid?: string;
  path?: string;
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

  const res = await axios.post(
    'https://invoices-api-k2w3p2ptza-ew.a.run.app/api/v1/extract',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return {
    amount: res.data.total_amount,
    supplier: res.data.supplier_name,
    ingredients: res.data.ingredients.map((ingredient) => ({
      uuid: ingredient.mapping_uuid,
      detectedName: ingredient.ingredient_name,
      mappedName: ingredient.mapping_name,
      quantity: ingredient.quantity,
      totalPrice: ingredient.total_price,
      unit: ingredient.unit,
      unitPrice: ingredient.unit_price,
    })),
  };
};

const submitInvoice = (
  restaurantUUID: string,
  invoiceData: Invoice & { base64Image?: string }
) => {
  const payload = {
    ...invoiceData,
    image: invoiceData.base64Image,
  };

  return axios.post('/documents/' + restaurantUUID, payload);
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
  submitInvoice,
};
