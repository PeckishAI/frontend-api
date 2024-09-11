import {
  axiosClient,
  axiosIntegrationClient,
  Ingredient,
  Invoice,
  InvoiceIngredient,
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
  supplier_uuid: string,
  data: FormDocument
) => {
  return axiosClient.post('/documents/' + documentUUID + '/update', {
    restaurant_uuid: restaurantUUID,
    date: data.date,
    supplier: data.supplier,
    supplier_uuid: supplier_uuid,
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
    unitCost: res.data[key]['cost'],
    tagUUID: res.data[key]['tag_uuid']?.map((uuid: string) => uuid) || [],
    supplier_details: res.data[key]['supplier_details'].map(
      (supplier: any) => ({
        supplier_id: supplier['supplier_id'],
        supplier_name: supplier['supplier_name'],
        supplier_cost: supplier['supplier_cost'],
      })
    ),
    amount: res.data[key]['amount'],
    type: res.data[key]['type'],
    quantity: res.data[key]['quantity'],
  }));
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
  const res = await axiosClient.get('/ingredients-list/' + restaurantUUID);

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
    cost: ingredient.unitCost,
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

// const uploadImgFile = async (
//   restaurantUUID: string,
//   files: File[]
// ): Promise<Invoice | null> => {
//   try {
//     const formData = new FormData();

//     // Append each file to FormData under the 'images' key, similar to curl
//     files.forEach((file) => {
//       formData.append('images', file); // This replicates the curl --form behavior
//     });

//     const res = await axiosClient.post(
//       `https://integrations-api-167544806451.europe-west1.run.app/tools/openai/invoices/${restaurantUUID}`,
//       formData,
//       {
//         headers: {
//           'Content-Type': 'multipart/form-data',
//         },
//       }
//     );

//     console.log('Invoice response data:', res.data);

//     if (typeof res.data !== 'object' || res.data === null) {
//       console.error('Response is not an object:', res.data);
//       return null;
//     }

//     return {
//       amount: res.data.amount,
//       supplier: res.data.supplier,
//       ingredients: res.data.ingredients,
//     };
//   } catch (error) {
//     console.error('Error uploading images:', error);
//     return null;
//   }
// };

const uploadImgFile = async (
  restaurantUUID: string,
  files: File[]
): Promise<any> => {
  try {
    const formData = new FormData();

    // Append each file to FormData under the 'images' key, similar to curl
    files.forEach((file) => {
      formData.append('images', file);
    });

    const res = await axiosClient.post(
      `https://integrations-api-167544806451.europe-west1.run.app/tools/openai/invoices/${restaurantUUID}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    console.log('Invoice response data:', res.data);

    return res.data;
  } catch (error) {
    console.error('Error uploading images:', error);
    return null;
  }
};

export default uploadImgFile;

const submitInvoice = (restaurantUUID: string, invoiceData: Invoice) => {
  // Ensure the amount is a number (fallback to 0 if not provided)
  const formattedInvoiceData: Invoice = {
    ...invoiceData,
    amount: invoiceData.amount ? Number(invoiceData.amount) : 0,
    supplier_name: invoiceData.supplier_name ?? '',
    supplier_uuid: invoiceData.supplier_uuid ?? '',
    date: invoiceData.date ?? '',
    ingredients: invoiceData.ingredients.map((ing) => ({
      ...ing,
      quantity: Number(ing.quantity),
      unitPrice: Number(ing.unitPrice),
      totalPrice: Number(ing.totalPrice),
      mappedUUID: ing.mappedUUID ?? '',
      given_name: ing.given_name,
      unit: ing.unit ?? '',
    })),
  };

  console.log('Formatted Invoice Data: ', formattedInvoiceData);

  // Submit the formatted invoice data to the API
  return axiosClient.post(`/documents/${restaurantUUID}`, formattedInvoiceData);
};

export const inventoryService = {
  getIngredientList,
  getOnlyIngredientList,
  addIngredient,
  updateIngredient,
  getIngredientPreview,
  deleteIngredient,
  convertToBase64,
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
