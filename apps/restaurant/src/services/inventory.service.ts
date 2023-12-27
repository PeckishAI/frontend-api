import axios, { Ingredient } from './index';

export type Invoice = {
  documentUUID?: string;
  created_at?: string;
  date?: string;
  supplier?: string;
  image?: string;
  ingredients: {
    detectedName?: string;
    mappedName?: string;
    mappedUUID?: string;
    quantity?: number;
    unitPrice?: number;
    unit?: string;
    totalPrice?: number;
  }[];
  restaurantUUID?: string;
  path?: string;
  amount?: number;
};

const getDocument = async (restaurantUUID: string): Promise<Invoice[]> => {
  const res = await axios.get('/documents/' + restaurantUUID);

  // Check if res.data is an object
  if (typeof res.data !== 'object' || res.data === null) {
    console.error('res.data is not an object:', res.data);
    return [];
  }

  const convertedData: Invoice[] = Object.keys(res.data).map<Invoice>((key) => {
    const documentData = res.data[key];

    // Map over ingredients directly
    return {
      ...documentData,
      uuid: key,
      ingredients: documentData.ingredients.map((ingredient: any) => ({
        mappedUUID: ingredient['mapping_uuid'],
        detectedName: ingredient['ingredient_name'],
        mappedName: ingredient['mapping_name'],
        quantity: ingredient['quantity'],
        unit: ingredient['unit'],
        totalPrice: ingredient['total_price'],
        unitPrice: ingredient['unitPrice'],
      })),
    };
  });

  console.log('Converted Data:', convertedData);
  return convertedData;
};

type FormDocument = {
  date: string;
  supplier: string;
  path: string;
  ingredients: {
    detectedName: string;
    mappedName: string;
    mappedUUID: string;
    unitPrice: number;
    quantity: number;
    unit: string;
    totalPrice: number;
  }[];
};

const convertToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const updateDocument = (
  restaurantUUID: string,
  documentUUID: string,
  data: FormDocument
) => {
  return axios.post('/documents/' + documentUUID + '/update', {
    restaurant_uuid: restaurantUUID,
    date: data.date,
    supplier: data.supplier,
    ingredients: data.ingredients,
  });
};

const deleteDocument = (documentId: string) => {
  return axios.post('/documents/' + documentId + '/delete');
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
  console.log('formated ingredient : ', ingredientFormated);

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

  const base64 = await convertToBase64(file);

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
    amount: res.data.amount,
    supplier: res.data.supplier,
    image: base64,
    ingredients: res.data.ingredients.map((ingredient) => ({
      mappedUUID: ingredient.mappedUUID,
      detectedName: ingredient.detectedName,
      mappedName: ingredient.mappedName,
      quantity: ingredient.quantity,
      totalPrice: ingredient.totalPrice,
      unit: ingredient.unit,
      unitPrice: ingredient.unitPrice,
    })),
  };
};

const submitInvoice = (restaurantUUID: string, invoiceData: Invoice) => {
  return axios.post('/invoices/' + restaurantUUID, invoiceData);
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
  getDocument,
  updateDocument,
  deleteDocument,
};
