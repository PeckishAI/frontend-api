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

  console.log('Res', res.data);

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
          item_uuid: ingredient['item_uuid'],
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
  console.log('Document', data);
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
    name: res.data[key]['ingredient_name'],
    parLevel: res.data[key]['par_level'],
    actualStock: res.data[key]['actual_stock'],
    unit_name: res.data[key]['unit_name'],
    unit_uuid: res.data[key]['unit_uuid'],
    recipe_count: res.data[key]['recipe_count'],
    unitCost: res.data[key]['cost'],
    tagUUID: res.data[key]['tag_uuid']?.map((uuid: string) => uuid) || [],
    tag_details:
      res.data[key]['tag_details']?.map((tag: any) => ({
        uuid: tag['uuid'],
        name: tag['name'],
      })) || [],
    supplier_details:
      res.data[key]['supplier_details']?.map((supplier: any) => ({
        supplier_uuid: supplier['supplier_uuid'],
        supplier_name: supplier['supplier_name'],
        supplier_cost: supplier['supplier_cost'],
        supplier_unit: supplier['supplier_unit_uuid'],
        supplier_unit_name: supplier['supplier_unit_name'],
        conversion_factor: supplier['conversion_factor'],
        supplier_unit_cost: supplier['supplier_unit_cost'],
        product_code: supplier['product_code'],
      })) || [],
    stock_history: res.data[key]['stock_history'],
    recipes:
      res.data[key]['recipes']?.map((recipe: any) => ({
        conversion_factor: recipe['conversion_factor'],
        quantity: recipe['quantity'],
        from_unit_name: recipe['from_unit_name'],
        to_unit_name: recipe['to_unit_name'],
        recipe_name: recipe['recipe_name'],
        recipe_uuid: recipe['recipe_uuid'],
        unit_name: recipe['unit_name'],
        unit_uuid: recipe['unit_uuid'],
      })) || [],
    amount: res.data[key]['amount'],
    type: res.data[key]['type'],
    quantity: res.data[key]['quantity'],
    volume_unit_uuid: res.data[key]['volume_unit_uuid'],
    volume_unit_name: res.data[key]['volume_unit_name'],
    volume_quantity: res.data[key]['volume_quantity'],
  }));
};

// stock_history: res.data[key]['stock_history'].map((stock: any) => ({
//   event_type: stock['event_type'],
//   quantity: stock['quantity'],
//   unit_name: stock['unit_name'],
// })),

type NewIngredient = Omit<Ingredient, 'id'>;

const addIngredient = (restaurantUUID: string, ingredient: NewIngredient) => {
  console.log(ingredient);
  const FormattedIngredient = {
    name: ingredient.name,
    tag_details: ingredient.tag_details,
    par_level: ingredient.parLevel,
    actual_stock: ingredient.actualStock,
    unit_name: ingredient.unit_name,
    unit_uuid: ingredient.unit_uuid,
    supplier_details: ingredient.supplier_details,
  };
  console.log(FormattedIngredient);
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
    unit_uuid: res.data[key]['unit_uuid'],
    unit_name: res.data[key]['unit_name'],
    cost: res.data[key]['cost'] || 0,
    type: res.data[key]['type'],
  }));
};

const updateIngredient = (restaurantUUID: string, ingredient: Ingredient) => {
  const ingredientFormated = {
    id: ingredient.id,
    ingredient_name: ingredient.name,
    tag_details: ingredient.tag_details?.map((tag) => ({
      tag_uuid: tag.uuid,
    })),
    par_level: ingredient.parLevel,
    quantity: ingredient.actualStock.quantity,
    supplier_details: ingredient.supplier_details?.map((supplier) => ({
      supplier_uuid: supplier.supplier_uuid,
      supplier_cost: supplier.supplier_cost,
      supplier_unit_uuid: supplier.supplier_unit,
      conversion_factor: supplier.conversion_factor,
      product_code: supplier.product_code,
    })),
    deleted_recipe_ingredient_data: ingredient?.deleted_recipe_ingredient_data,
    recipes: ingredient.recipes,
    unit_uuid: ingredient.unit_uuid,
    volume_unit_uuid: ingredient.volume_unit_uuid,
    volume_quantity: ingredient.volume_quantity,
  };

  return axiosClient.post(
    `/inventory/${restaurantUUID}/${ingredient.id}/update`,
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
      unit_name: unitData.unit_name,
      unit_uuid: unitData.unit_uuid,
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
