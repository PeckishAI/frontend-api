import { Ingredient, axiosClient, axiosIntegrationClient } from './index';

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

export interface SupplierIngredientUnit {
  unit_uuid: string;
  unit_name: string;
  unit_cost: number;
  product_code: string;
}

export interface SupplierIngredient {
  ingredient_uuid: string;
  name: string;
  units: SupplierIngredientUnit[];
}

export type SupplierIngredientResponse = {
  ingredient_uuid: string;
  name: string;
  product_code?: string;
  units: {
    unit_uuid: string;
    unit_name: string;
    unit_cost: number;
  };
};

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
    email: supplier.email,
    phone: supplier.phone,
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

// In supplier.service.ts
const updateSupplier = async (
  supplierUUID: string,
  supplier: Supplier
): Promise<UpdateSupplierResponse> => {
  const updatePayload = {
    ...supplier,
    uuid: supplierUUID, // Include the UUID in the payload
  };

  const res = await axiosClient.post<UpdateSupplierResponse>(
    `/suppliers/${supplierUUID}/update`,
    updatePayload
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

// const revokeSupplierAccess = async (
//   restaurantUUID: string,
//   supplierUUID: string
// ): Promise<void> => {
//   await axiosIntegrationClient.post(`/suppliers/${supplierUUID}/delete`);

// };

const deleteSupplier = (supplierUUID: string) => {
  return axiosClient.post(`/supplier/${supplierUUID}/delete`);
};

export const getSupplierIngredient = async (
  restaurantUUID: string,
  supplierUUID: string
): Promise<SupplierIngredient[] | null> => {
  try {
    const res = await axiosClient.get<
      Record<
        string,
        {
          name: string;
          units: Array<{
            unit_uuid: string;
            unit_name: string;
            cost: number;
            product_code: string;
          }>;
        }
      >
    >(`/inventory/${restaurantUUID}/supplier/${supplierUUID}`);

    // Transform the object response into an array of SupplierIngredient
    const supplierIngredients: SupplierIngredient[] = Object.entries(
      res.data
    ).map(([ingredient_uuid, data]) => ({
      ingredient_uuid,
      name: data.name,
      units: data.units.map((unit) => ({
        unit_uuid: unit.unit_uuid,
        unit_name: unit.unit_name,
        unit_cost: unit.cost,
        product_code: unit.product_code,
      })),
    }));
    return supplierIngredients;
  } catch (error) {
    console.error(
      `Error fetching supplier ingredients for restaurantUUID: ${restaurantUUID}, supplierUUID: ${supplierUUID}`,
      error
    );

    return null;
  }
};

export default {
  getRestaurantSuppliers,
  getSuppliers,
  createSupplier,
  updateSupplier,
  addSupplierToRestaurant,
  deleteSupplier,
  getSync,
  addSyncSupplier,
  addOnlySupplier,
  getSupplierIngredient,
};
