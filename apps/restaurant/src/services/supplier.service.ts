import axiosClient from './index';

export type Supplier = {
  uuid: string;
  name: string;
  email?: string;
  phone?: string;
};

export type LinkedSupplier = Supplier & {
  linked: boolean;
  linkedAt: Date;
  invitationKey?: string;
};

// type SupplierResponse = {

// };

type RestaurantSuppliersResponse = {};

const getRestaurantSuppliers = async (
  restaurantUUID: string
): Promise<LinkedSupplier[]> => {
  const { data } = await axiosClient.get<RestaurantSuppliersResponse>(
    `/suppliers/${restaurantUUID}`
  );
  return data;
};

export default {
  getRestaurantSuppliers,
};
