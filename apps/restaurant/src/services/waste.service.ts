import { use } from 'i18next';
import { axiosClient } from './index';
import { TransferForm } from './types';
import { User, useUserStore } from '@peckishai/user-management';
import { WastingForm } from '../views/Inventory/Components/Wastes/Wastes';

const createWaste = async (restaurantId: string, data: WastingForm) => {
  console.log('Creating waste:', data);
  const res = await axiosClient.post('/inventory/waste/' + restaurantId, data);
  console.log(res);
  return;
};

// const getTransferHistory = async (restaurantId: string) => {
//   console.log(restaurantId);
//   const res = await axiosClient.get(`/inventory/transfer/${restaurantId}`);
//   console.log(res.data);
//   return res.data;
// };

export const wasteService = {
  createWaste,
};
