import axios from './index';

export type Document = {
  uuid: string;
  date?: string;
  path?: string;
  supplier_name?: string;
  ingredients: {
    uuid: string;
    detectedName?: string;
    mappedName?: string;
    quantity?: number;
    totalPrice?: number;
    unit?: string;
    unitPrice?: number;
  }[];
  amount?: number;
};

const getDocument = async (restaurantUUID: string): Promise<Document[]> => {
  const res = await axios.get('/documents/' + restaurantUUID);
  console.log(res);

  // Check if res.data is an object
  if (typeof res.data !== 'object' || res.data === null) {
    console.error('res.data is not an object:', res.data);
    return [];
  }

  const convertedData: Document[] = Object.keys(res.data).map<Document>(
    (key) => {
      const documentData = res.data[key];
      console.log('documentData', documentData);

      // Map over ingredients directly
      return {
        ...documentData,
        uuid: key,
        ingredients: documentData.ingredients.map((ingredient: any) => ({
          uuid: ingredient['mapping_uuid'], // Assuming 'mapping_uuid' is the correct field for 'uuid'
          detectedName: ingredient['ingredient_name'], // Adjust field names as necessary
          mappedName: ingredient['mapping_name'],
          quantity: ingredient['quantity'],
          unit: ingredient['unit'],
          totalPrice: ingredient['total_price'],
          unitPrice: ingredient['unitPrice'], // Check if this field exists in your data
        })),
      };
    }
  );

  console.log('Converted Data:', convertedData);
  return convertedData;
};

type FormDocument = {
  date: string;
  supplier_name: string;
  path: string;
  ingredients: {
    ingredient_name: string;
    mapping_name: string;
    mapping_uuid: string;
    unit_price: number;
    quantity: number;
    unit: string;
    total_price: number;
  }[];
};

const updateDocument = (
  restaurantUUID: string,
  documentUUID: string,
  data: FormDocument
) => {
  return axios.post('/documents/' + documentUUID + '/update', {
    restaurant_uuid: restaurantUUID,
    date: data.date,
    supplier_name: data.supplier_name,
    ingredients: data.ingredients,
  });
};

const deleteDocument = (documentId: string) => {
  return axios.post('/documents/' + documentId + '/delete');
};

export const documentService = {
  getDocument,
  updateDocument,
  deleteDocument,
};
