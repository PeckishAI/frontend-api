export type Supplier = {
  supplier_id: string;
  supplier_name: string;
  supplier_cost: number;
};

export type Tag = {
  uuid: string;
  name: string;
};

export type Tags = {
  name: string;
};

export interface Ingredient {
  id: string;
  name: string;
  unit: string;
  actualStock?: number;
  parLevel?: number;
  supplier?: string;
  unitCost?: number;
}

export type Invoice = {
  documentUUID?: string;
  created_at?: string;
  date?: string;
  supplier_name?: string;
  image?: string;
  supplier_uuid: string;
  ingredients: InvoiceIngredient[];
  restaurantUUID?: string;
  path?: string;
  amount?: number; // Make sure amount is a number
  sync_status?: string;
};

export type InvoiceIngredient = {
  mappedUUID: string;
  mapped_name: string;
  quantity: number;
  given_name: string;
  unit: string;
  unitPrice: number;
  totalPrice: number;
};

export type TransferForm = {
  from_restaurant_uuid: string;
  to_restaurant_uuid: string;
  ingredients: {
    from_ingredient_uuid: string;
    to_ingredient_uuid: string;
    quantity: number;
    unit?: string;
  }[];
};
