import { Tag } from './types';
import axiosClient from '.';

const getAll = async (restaurantUUID: string): Promise<Tag[]> => {
  const res = await axiosClient.get('/tag/' + restaurantUUID);
  return Object.keys(res.data).map((key) => ({
    uuid: key,
    name: res.data[key],
  }));
};

const create = (tagName: string, restaurantUUID: string) => {
  return axiosClient.post('/tag/' + restaurantUUID, {
    tag_name: tagName,
  });
};
export const tagService = { getAll, create };
