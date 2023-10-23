import axiosClient from './index';

export type Supplier = {
  uuid: string;
  name: string;
  email?: string;
  phone?: string;
  created_at?: Date;
};

export type LinkedSupplier = Supplier & {
  linked: boolean;
  linkedAt: Date;
  invitationKey?: string;
};

// type SupplierResponse = {
// created_at: 'Mon, 23 Oct 2023 11:33:46 GMT';
// email: 'contact@rekki.com';
// invitation_key: 'cyfuvjhguygh';
// linked: false;
// name: 'Rekki';
// phone: null;
// supplier_uuid: 'abc';
// };

type RestaurantSuppliersResponse = {
  supplier_uuid: string;
  name: string;
  email: string;
  phone: string;
  linked: boolean;
  linked_at: string;
  invitation_key: string;
}[];

const getRestaurantSuppliers = async (
  restaurantUUID: string
): Promise<LinkedSupplier[]> => {
  const res = await axiosClient.get<RestaurantSuppliersResponse>(
    `/suppliers/${restaurantUUID}`
  );

  console.log(res.data);

  return res.data.map((supplier) => ({
    ...supplier,
    uuid: supplier.supplier_uuid,
    linkedAt: new Date(supplier.linked_at),
    invitationKey: supplier.invitation_key,
  }));
};

type SuppliersResponse = {
  supplier_uuid: string;
  name: string;
}[];

const getSuppliers = async (): Promise<Supplier[]> => {
  const res = await axiosClient.get<SuppliersResponse>('/suppliers');

  return res.data.map((supplier) => ({
    ...supplier,
    uuid: supplier.supplier_uuid,
  }));
};

type CreateSupplierResponse = {
  supplier_uuid: string;
};

const createSupplier = async (
  supplier: Omit<Supplier, 'uuid' | 'created_at'>
): Promise<CreateSupplierResponse> => {
  const res = await axiosClient.post<CreateSupplierResponse>(
    '/suppliers',
    supplier
  );

  return res.data;
};

const addSupplierToRestaurant = async (
  restaurantUUID: string,
  supplierUUID: string
): Promise<void> => {
  await axiosClient.post(`/suppliers/${restaurantUUID}`, {
    supplier_uuid: supplierUUID,
  });
};

export default {
  getRestaurantSuppliers,
  getSuppliers,
  createSupplier,
  addSupplierToRestaurant,
};
