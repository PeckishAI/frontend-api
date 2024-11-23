import { axiosClient, axiosIntegrationClient } from './index';

export type Supplier = {
  uuid?: string;
  name?: string;
  email?: string;
  phone?: string;
  created_at?: Date;
};

export type LinkedSupplier = Supplier & {
  linked: boolean;
  linkedAt: Date;
  invitationKey?: string;
};
export type SyncSupplier = {
  contact_id: string;
  email_address?: string;
  name?: string;
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
): Promise<Supplier[]> => {
  const res = await axiosClient.get<RestaurantSuppliersResponse>(
    `/suppliers/${restaurantUUID}`
  );
  return res.data.map((supplier) => ({
    uuid: supplier.supplier_uuid,
    name: supplier.name,
  }));
};

type SuppliersResponse = {
  supplier_uuid: string;
  name: string;
}[];

const getSuppliers = async (restaurantUUID: string): Promise<Supplier[]> => {
  const res = await axiosClient.get<SuppliersResponse>(
    `/suppliers/${restaurantUUID}`
  );

  return res.data.map((supplier) => ({
    ...supplier,
    uuid: supplier.supplier_uuid,
  }));
};

type CreateSupplierResponse = {
  supplier_uuid: string;
};

const createSupplier = async (
  supplier: Omit<Supplier, 'uuid' | 'created_at'>,
  restaurantUUID: string
): Promise<CreateSupplierResponse> => {
  const res = await axiosClient.post<CreateSupplierResponse>(
    `/suppliers/${restaurantUUID}`,
    supplier
  );

  return res.data;
};

interface UpdateSupplierResponse {
  success: boolean;
  supplier: Supplier;
}

const updateSupplier = async (
  supplierUUID: string,
  supplier: Supplier
): Promise<UpdateSupplierResponse> => {
  const res = await axiosClient.post<UpdateSupplierResponse>(
    `/suppliers/${supplierUUID}/update`,
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

const addSyncSupplier = async (
  restaurantUUID: string,
  supplierUUID: string,
  contact_id: string
): Promise<void> => {
  const res = await axiosIntegrationClient.post(
    `/accounting/xero/sync-supplier/${restaurantUUID}`,
    {
      supplier_uuid: supplierUUID,
      contact_id: contact_id,
    }
  );
  return res.data;
};

const addOnlySupplier = async (
  restaurantUUID: string,
  supplierUUID: string
): Promise<void> => {
  const res = await axiosIntegrationClient.post(
    `/accounting/xero/add-supplier/${restaurantUUID}`,
    {
      supplier_uuid: supplierUUID,
    }
  );
  return res.data;
};

const getSync = async (restaurantUUID: string): Promise<SyncSupplier[]> => {
  const res = await axiosIntegrationClient.get<SyncSupplier[]>(
    `/accounting/xero/get-contacts/${restaurantUUID}`
  );

  return res.data;
};

const revokeSupplierAccess = async (
  restaurantUUID: string,
  supplierUUID: string
): Promise<void> => {
  await axiosClient.delete(`/suppliers/${restaurantUUID}/${supplierUUID}`);
};

export default {
  getRestaurantSuppliers,
  getSuppliers,
  createSupplier,
  updateSupplier,
  addSupplierToRestaurant,
  revokeSupplierAccess,
  getSync,
  addSyncSupplier,
  addOnlySupplier,
};
