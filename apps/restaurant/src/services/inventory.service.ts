import {
  axiosClient,
  axiosIntegrationClient,
  Ingredient,
  Invoice,
  InvoiceIngredient,
  Unit,
} from './index';

const getDocument = async (restaurantUUID: string): Promise<Invoice[]> => {
  const res = await axiosClient.get('/documents/' + restaurantUUID);

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
      documentUUID: key,
      supplier_uuid: documentData.supplier_uuid,
      supplier: documentData.supplier,
      sync_status: documentData.sync_status,
      ingredients: documentData.ingredients.map((ingredient: any) => ({
        mappedUUID: ingredient['mapping_uuid'],
        detectedName: ingredient['ingredient_name'],
        tag_name: ingredient['tag_name'],
        mappedName: ingredient['mapping_name'],
        quantity: ingredient['quantity'],
        received_qty: ingredient['received_qty'],
        unit: ingredient['unit'],
        unitPrice: ingredient['unit_price'],
        totalPrice: ingredient['total_price'],
      })),
    };
  });
  return convertedData;
};

type FormDocument = {
  date: string;
  supplier: string;
  supplier_uuid: string;
  amount: number;
  path: string;
  ingredients: InvoiceIngredient[];
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
  return axiosClient.post('/documents/' + documentUUID + '/update', {
    restaurant_uuid: restaurantUUID,
    date: data.date,
    supplier_uuid: data.supplier_uuid,
    supplier: data.supplier,
    ingredients: data.ingredients,
    amount: data.amount,
  });
};

interface DocumentData {
  supplier_uuid: string;
  documentUUID: string;
}

const sendInvoice = async (restaurantUUID: string, data: DocumentData[]) => {
  try {
    const response = await axiosIntegrationClient.post(
      `/accounting/xero/send-invoice/${restaurantUUID}`,
      data
    );
    return response.data;
  } catch (error) {
    console.error(
      'Error adding ingredient:',
      error.response?.data || error.message
    );
    throw error;
  }
};

const deleteDocument = async (documentId: string) => {
  try {
    const response = await axiosClient.post(`/documents/${documentId}/delete`);
    return response.data;
  } catch (error) {
    console.error('Error deleting document:', error);
    throw error;
  }
};

const getIngredientList = async (
  restaurantUUID: string
): Promise<Ingredient[]> => {
  const res = await axiosClient.get('/inventory/' + restaurantUUID);

  return Object.keys(res.data).map<Ingredient>((key) => ({
    id: key,
    name: res.data[key]['name'],
    parLevel: res.data[key]['par_level'],
    actualStock: res.data[key]['actual_stock'],
    theoriticalStock: res.data[key]['theoritical_stock'],
    unit: res.data[key]['unit'],
    unit_name: res.data[key]['unit_name'],
    unit_uuid: res.data[key]['unit_uuid'],
    recipe_count: res.data[key]['recipe_count'],
    unitCost: res.data[key]['cost'],
    tagUUID: res.data[key]['tag_uuid']?.map((uuid: string) => uuid) || [],
    supplier_details: res.data[key]['supplier_details'].map(
      (supplier: any) => ({
        supplier_id: supplier['supplier_id'],
        supplier_name: supplier['supplier_name'],
        supplier_cost: supplier['supplier_cost'],
        supplier_unit: supplier['supplier_unit'],
        supplier_unit_name: supplier['supplier_unit_name'],
        conversion_factor: supplier['conversion_factor'],
      })
    ),
    stock_history: res.data[key]['stock_history'],
    recipes: res.data[key]['recipes'].map((recipe: any) => ({
      conversion_factor: recipe['conversion_factor'],
      quantity: recipe['quantity'],
      from_unit_name: recipe['from_unit_name'],
      to_unit_name: recipe['to_unit_name'],
      recipe_name: recipe['recipe_name'],
      unit_name: recipe['unit_name'],
      unit_uuid: recipe['unit_uuid'],
    })),
    amount: res.data[key]['amount'],
    type: res.data[key]['type'],
    quantity: res.data[key]['quantity'],
  }));
};

// stock_history: res.data[key]['stock_history'].map((stock: any) => ({
//   event_type: stock['event_type'],
//   quantity: stock['quantity'],
//   unit_name: stock['unit_name'],
// })),

const getUnits = async (restaurantUUID: string): Promise<Unit[]> => {
  try {
    const res = await axiosClient.get(`/units/${restaurantUUID}`);

    // Check if the response data is valid
    if (!Array.isArray(res.data)) {
      console.error('Unexpected response format:', res.data);
      return [];
    }

    // Map the response data to the Unit array
    const units: Unit[] = res.data.map((unitData: any) => ({
      unit_name: unitData.unit_name,
      unit_uuid: unitData.unit_uuid,
    }));

    return units;
  } catch (error) {
    console.error('Error fetching units:', error);
    return [];
  }
};

const addIngredient = (restaurantUUID: string, ingredient: Ingredient) => {
  const FormattedIngredient = {
    id: ingredient.id,
    name: ingredient.name,
    tag_details: ingredient.tag_details,
    par_level: ingredient.parLevel,
    actual_stock: ingredient.actualStock,
    unit: ingredient.unit,
    supplier_details: ingredient.supplier_details,
    cost: ingredient.unitCost,
  };

  return axiosClient.post('/inventory/' + restaurantUUID, FormattedIngredient);
};

const getOnlyIngredientList = async (
  restaurantUUID: string
): Promise<Ingredient[]> => {
  const res = await axiosClient.get(
    '/ingredients-list/' + restaurantUUID + '?fetch_preparations=false'
  );

  return Object.keys(res.data).map<Ingredient>((key) => ({
    id: key,
    name: res.data[key]['name'],
    unit: res.data[key]['unit'],
    unitCost: res.data[key]['cost'],
    type: res.data[key]['type'],
  }));
};

const updateIngredient = (ingredient: Ingredient) => {
  const ingredientFormated = {
    id: ingredient.id,
    name: ingredient.name,
    tag_details: ingredient.tag_details,
    par_level: ingredient.parLevel,
    actual_stock: ingredient.actualStock,
    unit: ingredient.unit,
    supplier_details: ingredient.supplier_details,
    recipes: ingredient.recipes,
    cost: ingredient.unitCost,
    unit_name: ingredient.unit_name,
    unit_uuid: ingredient.unit_uuid,
    restaurant_uuid: ingredient.restaurantUUID,
  };

  return axiosClient.post(
    '/inventory/' + ingredient.id + '/update',
    ingredientFormated
  );
};

const getIngredientPreview = (ingredientId: string) => {
  return axiosClient.get<string[]>('/inventory/' + ingredientId + '/preview');
};

const deleteIngredient = (id: string) => {
  return axiosClient.post('/inventory/' + id + '/delete');
};

export type ColumnsNameMapping = {
  ingredient: string;
  quantity: string;
  unit: string;
  cost: string;
  supplier: string;
  sync_supplier_data: string;
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

  const res = await axiosClient.post(
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

const getFormData = (
  file: File,
  headerValues: ColumnsNameMapping,
  selectedValues: any
) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('ingredient', headerValues.ingredient);
  formData.append('quantity', headerValues.quantity);
  formData.append('unit', headerValues.unit);
  formData.append('cost', headerValues.cost);
  formData.append('supplier', headerValues.supplier);
  formData.append('sync_supplier_data', JSON.stringify(selectedValues));
  return formData;
};

const getPreviewUploadedCsv = async (
  restaurantUUID: string,
  file: File,
  headerValues: ColumnsNameMapping
) => {
  const formData = getFormData(file, headerValues, null);
  const res = await axiosClient.post(
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
  headerValues: ColumnsNameMapping,
  selectedValues: any
) => {
  const formData = getFormData(file, headerValues, selectedValues);

  return axiosClient.post(
    '/inventory/' + restaurantUUID + '/upload',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
};

const uploadImgFile = async (
  restaurantUUID: string,
  file: File
): Promise<Invoice | null> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('restaurant_uuid', restaurantUUID);

  const base64 = await convertToBase64(file);

  const res = await axiosClient.post(
    'https://invoices-api-k2w3p2ptza-ew.a.run.app/api/v1/extract',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  console.log('invoice res.data : ', res.data);
  console.log('typeof res.data : ', typeof res.data);
  // Check if res.data is xan object
  if (typeof res.data !== 'object' || res.data === null) {
    console.error('res.data is not an object:', res.data);
    return null;
  }

  return {
    amount: res.data.amount,
    supplier: res.data.supplier,
    image: base64,
    ingredients: res.data.ingredients,
  };
};

const submitInvoice = (restaurantUUID: string, invoiceData: Invoice) => {
  console.log('inboiceData: ', invoiceData);

  return axiosClient.post('/documents/' + restaurantUUID, invoiceData);
};

export const inventoryService = {
  getIngredientList,
  getUnits,
  getOnlyIngredientList,
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
  sendInvoice,
};
