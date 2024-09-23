import { axiosClient } from './index';
import { WastingForm } from '../views/Inventory/Components/Wastes/Wastes';

const createWaste = async (restaurantId: string, data: WastingForm) => {
  console.log('Creating waste:', data);
  const res = await axiosClient.post('/inventory/waste/' + restaurantId, data);
  console.log(res);
  return;
};

export const wasteService = {
  createWaste,
};
