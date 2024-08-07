import { axiosClient } from '.';
import { Restaurant } from '../store/useRestaurantStore';

type RestaurantResponse = {
  address: string;
  city: string;
  country: string;
  created_at: string;
  name: string;
  restaurant_uuid: string;
  currency: string | null;
  provider: {
    xero?: boolean;
    red_cat?: boolean;
  }[];
  users: {
    user_email: string;
    user_picture: string;
    user_uuid: string;
    username: string;
  }[];
};

const getUserRestaurants = async (userId: string): Promise<Restaurant[]> => {
  const res = await axiosClient.get<RestaurantResponse[]>(
    `/overview/${userId}`
  );

  if (!res.data) {
    return new Promise(() => []);
  }

  return res.data.map((r) => ({
    ...r,
    uuid: r.restaurant_uuid,
    created_at: new Date(r.created_at),
    provider: r.provider.map((p) => ({
      xero: p.xero,
      red_cat: p.red_cat,
    })),
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
    .post(`/refresh/${restaurantId}`)
    .then(() => true)
    .catch(() => false);
};

export const restaurantService = {
  getUserRestaurants,
  reloadPOS,
};
