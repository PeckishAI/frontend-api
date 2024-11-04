import { TagDetails } from './types';
import { axiosClient } from '.';

const getAll = async (restaurantUUID: string): Promise<TagDetails[]> => {
  const res = await axiosClient.get('/tag/' + restaurantUUID);
  return Object.keys(res.data).map((key) => ({
    tagUUID: key,
    tagName: res.data[key],
  }));
};

const create = (tagName: string, restaurantUUID: string) => {
  return axiosClient.post('/tag/' + restaurantUUID, {
    tag_name: tagName,
  });
};
export const tagService = { getAll, create };
