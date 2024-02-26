import { Supplier } from '../store/useSupplierStore';
import axios from './index';

const getUserSupplier = async (userId: string): Promise<Supplier> => {
  // const res = await axios.get('/idk/' + userId);

  //   return {
  //     uuid: res.data.uuid,
  //     name: res.data.name,
  //     created_at: new Date(res.data.created_at),
  //     currency: res.data.currency,
  //   }

  return {
    uuid: '856050c5-f65a-4364-a962-30d31ba0b08b',
    name: 'Testing',
    created_at: new Date(),
    currency: 'EUR',
  };
};

export const supplierService = { getUserSupplier };
