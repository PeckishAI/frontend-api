import { Tag } from './types';
import { axiosClient } from '.';

const getAll = async (restaurantUUID: string): Promise<Tag[]> => {
  const res = await axiosClient.get('/tag/' + restaurantUUID);
  return Object.keys(res.data).map((key) => ({
    uuid: key,
    name: res.data[key],
  }));
};

const createTag = async (tagName: string, restaurantUUID: string) => {
  const response = await axiosClient.post(`/tag/${restaurantUUID}`, {
    tag_name: tagName,
  });

  return {
    name: tagName,
    uuid: response.data.tag_uuid, // Now matches our modified backend response
  };
};
export const tagService = { getAll, createTag };
