import { TagsTMP } from './types';
import { axiosClient } from '.';

const getAll = async (restaurantUUID: string): Promise<TagsTMP[]> => {
  const res = await axiosClient.get('/tag/' + restaurantUUID);
  return Object.keys(res.data).map((key) => ({
    tag_uuid: key,
    tag_name: res.data[key],
  }));
};

const createTag = async (tag_name: string, restaurantUUID: string) => {
  const response = await axiosClient.post(`/tag/${restaurantUUID}`, {
    tag_name: tag_name,
  });

  return {
    tag_name: tag_name,
    tag_uuid: response.data.tag_uuid, // Now matches our modified backend response
  };
};
export const tagService = { getAll, createTag };
