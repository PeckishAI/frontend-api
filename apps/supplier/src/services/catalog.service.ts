import axios, { Ingredient } from './index';

const getCatalog = async (supplierUUID: string): Promise<Ingredient[]> => {
  const { data } = await axios.get('/catalog/' + supplierUUID);
  if (data[0] === undefined) return [];
  return data;
};

export const catalogService = { getCatalog };
