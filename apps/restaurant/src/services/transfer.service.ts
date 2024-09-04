import { use } from 'i18next';
import { axiosClient } from './index';
import { TransferForm } from './types';
import { User, useUserStore } from '@peckishai/user-management';

const createTransfer = async (data: TransferForm) => {
  const user = useUserStore.getState().user;
  const res = await axiosClient.post(
    '/inventory/' +
      data.from_restaurant_uuid +
      '/transfer_stock/' +
      data.to_restaurant_uuid +
      '/' +
      user?.user?.user_uuid,
    data
  );
  console.log(data);
  return;
};

const getTransferHistory = async (restaurantId: string) => {
  console.log(restaurantId);
  const res = await axiosClient.get(`/inventory/transfer/${restaurantId}`);
  console.log(res.data);
  return res.data;
};

export const transferService = {
  createTransfer,
  getTransferHistory,
};
