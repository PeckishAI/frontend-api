import { use } from 'i18next';
import { axiosClient, Unit } from './index';

const createUnit = async (unit: Unit, restaurantUUID: string) => {
  const res = await axiosClient.post('/units/' + restaurantUUID, unit);
  console.log(unit);
  return;
};

const getUnit = async (restaurantUUID: string) => {
  const res = await axiosClient.get(`/units/${restaurantUUID}`);
  console.log(res.data);
  return res.data;
};

export const unitService = {
  createUnit,
  getUnit,
};
