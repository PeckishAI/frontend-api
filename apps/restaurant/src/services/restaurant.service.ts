import { log } from 'console';
import axiosClient from '.';
import { Restaurant } from '../store/useRestaurantStore';

type RestaurantResponse = {
  address: string;
  city: string;
  country: string;
  created_at: string;
  name: string;
  restaurant_uuid: string;
  currency: string | null;
  users: {
    user_email: string;
    user_picture: string;
    user_uuid: string;
    username: string;
  }[];
};

const getUserRestaurants = async (userId: string): Promise<Restaurant[]> => {
  const res = await axiosClient.get<RestaurantResponse[]>(
    `/restaurant/overview/${userId}`
  );

  if (!res.data) {
    return new Promise(() => []);
  }

  return res.data.map((r) => ({
    ...r,
    uuid: r.restaurant_uuid,
    created_at: new Date(r.created_at),
    users: r.users.map((u) => ({
      ...u,
      uuid: u.user_uuid,
      email: u.user_email,
      name: u.username,
    })),
  }));
};

const reloadPOS = async (restaurantId: string): Promise<boolean> => {
  return await axiosClient
    .post(`/papapoule/refresh/${restaurantId}`, {
      username: 'pascal',
      password: '25122512',
    })
    .then(() => true)
    .catch(() => false);
};

export const restaurantService = {
  getUserRestaurants,
  reloadPOS,
};
