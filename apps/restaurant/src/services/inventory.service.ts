import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRestaurantStore } from '../store/useRestaurantStore';
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
      date: documentData.date ? new Date(documentData.date) : undefined,
      supplier_uuid: documentData.supplier_uuid,
      supplier: documentData.supplier,
      sync_status: documentData.sync_status,
      ingredients: documentData.ingredients
        .map((ingredient: any) => ({
          mappedUUID: ingredient['mapping_uuid'],
          detectedName: ingredient['ingredient_name'],
          tag_name: ingredient['tag_name'],
          mappedName: ingredient['mapping_name'],
          quantity: ingredient['quantity'],
          received_qty: ingredient['received_qty'],
          unit_uuid: ingredient['unit_uuid'],
          unitPrice: ingredient['unit_price'],
          totalPrice: ingredient['total_price'],
        }))
        .sort((a: any, b: any) => {
          if (a.mappedName < b.mappedName) {
            return -1;
          }
          if (a.mappedName > b.mappedName) {
            return 1;
          }
          return 0;
        }),
    };
  });
  return convertedData;
};

export type FormDocument = {
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
  console.log(res.data);

  const ingredients = Object.keys(res.data).map<Ingredient>((key) => ({
    ingredientUUID: key,
    ingredientName: res.data[key]['ingredient_name'],
    parLevel: res.data[key]['par_level'],
    quantity: res.data[key]['stock_history'][0]['quantity'] || 0,
    unitUUID: res.data[key]['unit_uuid'],
    unitName: res.data[key]['unit_name'],
    tagDetails: res.data[key]['tag_details'].map((tag: any) => ({
      tagUUID: tag['uuid'],
      tagName: tag['name'],
    })),
    supplierDetails: res.data[key]['supplier_details'].map((supplier: any) => ({
      supplierUUID: supplier['supplier_uuid'],
      supplierName: supplier['supplier_name'],
      supplierUnitCost: supplier['supplier_unit_cost'] || 0,
      supplierUnitName: supplier['supplier_unit_name'] || 0,
      supplierUnitUUID: supplier['supplier_unit_uuid'] || 0,
      conversionFactor: supplier['conversion_factor'] || 0,
    })),
    type: res.data[key]['type'],
    volumeUnitName: res.data[key]['volume_unit_name'],
    volumeUnitUUID: res.data[key]['volume_unit_uuid'],
    volumeQuantity: res.data[key]['volume_quantity'],
  }));

  console.log(ingredients);

  return ingredients;
};

const addIngredient = (restaurantUUID: string, ingredient: Ingredient) => {
  const FormattedIngredient = {
    ingredient_uuid: ingredient.ingredientUUID,
    name: ingredient.ingredientName,
    tag_details:
      ingredient.tagDetails?.map(
        (tag: { tagUUID: string; tagName: string }) => ({
          tag_uuid: tag.tagUUID,
          tag_name: tag.tagName,
        })
      ) || [],
    par_level: ingredient.parLevel,
    quantity: ingredient.quantity,
    unit_name: ingredient.unitName,
    unit_uuid: ingredient.unitUUID,
    supplier_details:
      ingredient.supplierDetails?.map((supplier) => ({
        supplier_uuid: supplier.supplierUUID,
        supplier_name: supplier.supplierName,
        supplier_unit_cost: supplier.supplierUnitCost,
        supplier_unit_uuid: supplier.supplierUnitUUID,
        supplier_unit_name: supplier.supplierUnitName,
        conversion_factor: supplier.conversionFactor,
      })) || [],
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
    ingredientUUID: key,
    ingredientName: res.data[key]['name'],
    unitUUID: res.data[key]['unit_uuid'],
    unitName: res.data[key]['unit_name'],
    type: res.data[key]['type'],
  }));
};

const updateIngredient = (restaurantUUID: string, ingredient: Ingredient) => {
  const ingredientFormated = {
    ingredient_uuid: ingredient.ingredientUUID,
    ingredient_name: ingredient.ingredientName,
    tag_details: (ingredient.tagDetails || []).map((tag: any) => ({
      tag_uuid: tag.tagUUID,
      tag_name: tag.tagName,
    })),
    par_level: ingredient.parLevel,
    quantity: ingredient.quantity,
    unit_uuid: ingredient.unitUUID,
    unit_name: ingredient.unitName,
    supplier_details: (ingredient.supplierDetails || []).map(
      (supplier: any) => ({
        supplier_uuid: supplier['supplierUUID'] || null,
        supplier_name: supplier['supplierName'],
        supplier_unit_cost: supplier['supplierUnitCost'] || 0,
        supplier_unit_uuid: supplier['supplierUnitUUID'] || null,
        supplier_unit_name: supplier['supplierUnitName'] || null,
        conversion_factor: supplier['conversionFactor'] || 0,
      })
    ),
    restaurant_uuid: restaurantUUID,
    volume_unit_uuid: ingredient.volumeUnitUUID,
    volume_unit_name: ingredient.volumeUnitName,
    volume_quantity: ingredient.volumeQuantity,
  };

  return axiosClient.post(
    '/inventory/' + ingredient.ingredientUUID + '/update',
    ingredientFormated
  );
};
const getUnitNew = async (restaurantUUID: string): Promise<Unit[]> => {
  if (!restaurantUUID) {
    throw new Error('Invalid restaurant UUID');
  }

  try {
    const res = await axiosClient.get(`/units/new/${restaurantUUID}`);
    // Rest of the logic
    return res;
  } catch (error) {
    console.error('Error fetching units:', error);
    return [];
  }
};

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
      unitName: unitData.unit_name,
      unitUUID: unitData.unit_uuid,
    }));

    return units;
  } catch (error) {
    console.error('Error fetching units:', error);
    return [];
  }
};

const getReferenceUnits = async (): Promise<Unit[]> => {
  try {
    const res = await axiosClient.get(`/units_reference`);

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

const createUnit = async (restaurantUUID: string, unit_name: string) => {
  const FormattedIngredient = {
    unit_name: unit_name,
  };
  const res = await axiosClient.post(
    `/units/${restaurantUUID}`,
    FormattedIngredient
  );
  return res.data as Promise<Unit>;
};

const fetchConversionFactor = async (
  itemUUID: string,
  fromUnitUUID: string,
  toUnitUUID: string,
  type: string
) => {
  if (type === 'preparation') {
    return axiosClient.get(
      `/recipes/${itemUUID}/conversion_factor/${fromUnitUUID}/${toUnitUUID}`
    );
  }
  return axiosClient.get(
    `/inventory/${itemUUID}/conversion_factor/${fromUnitUUID}/${toUnitUUID}`
  );
};

const submitInvoice = (restaurantUUID: string, invoiceData: Invoice) => {
  return axiosClient.post('/documents/' + restaurantUUID, invoiceData);
};

export const inventoryService = {
  getIngredientList,
  getUnits,
  getOnlyIngredientList,
  addIngredient,
  updateIngredient,
  getUnitNew,
  getIngredientPreview,
  deleteIngredient,
  uploadCsvFile,
  getReferenceUnits,
  getPreviewUploadedCsv,
  validUploadedCsv,
  uploadImgFile,
  submitInvoice,
  getDocument,
  updateDocument,
  deleteDocument,
  sendInvoice,
  createUnit,
  fetchConversionFactor,
};

/**
 * React Query hooks
 */

const unitQueryKeys = {
  all: ['units'],
  byRestaurant: (restaurant_uuid: string) => [
    ...unitQueryKeys.all,
    restaurant_uuid,
  ],
};

/**
 * Fetch the list of units
 * @returns The list of units
 */
export const useUnits = () => {
  const selectedRestaurantUUID = useRestaurantStore(
    (state) => state.selectedRestaurantUUID
  );

  return useQuery({
    queryKey: unitQueryKeys.byRestaurant(selectedRestaurantUUID),
    queryFn: () => getUnits(selectedRestaurantUUID!),
    initialData: [],
  });
};

/**
 * Create a new unit
 * @returns The mutation function
 */
export const useCreateUnit = () => {
  const queryClient = useQueryClient();
  const selectedRestaurantUUID = useRestaurantStore(
    (state) => state.selectedRestaurantUUID
  );

  return useMutation({
    mutationFn: (unitName: string) =>
      createUnit(selectedRestaurantUUID!, unitName),
    onSuccess: (data) => {
      // Update the unit in the cache with the new data
      queryClient.setQueryData(
        unitQueryKeys.byRestaurant(selectedRestaurantUUID),
        (oldData?: Unit[]) => (oldData ? [...oldData, data] : [data])
      );
    },
  });
};
