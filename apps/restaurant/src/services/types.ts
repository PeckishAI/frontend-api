export type Supplier = {
  supplier_id: string;
  supplier_name: string;
  supplier_cost: number;
  conversion_factor?: number;
  supplier_unit: string;
};

export type Recipe = {
  conversion_factor: number;
  quantity: number;
  recipe_name: string;
  unit_name: string;
  unit_uuid: string;
  from_unit_name: string;
  to_unit_name: string;
};

export type Stock = {
  event_type?: string | null;
  quantity?: number | null;
  unit_name?: string | null;
};

export type Ingredient = {
  type?: string;
  id: string;
  name: string;
  tagUUID?: string[] | null;
  tag_details?: string[] | null;
  actualStock: number;
  theoriticalStock?: number;
  parLevel: number;
  unit: string;
  amount: number;
  actions?: void;
  quantity: number;
  restaurantUUID?: string;
  supplier_details?: Supplier[];
  recipes?: Recipe[];
  recipe_count?: number;
  stock_history?: Stock[];
  unit_name?: number;
};

export type Tag = {
  uuid: string;
  name: string;
};

export type Tags = {
  name: string;
};

export type InvoiceIngredient = {
  inventoryIngredientRef?: Ingredient | null;
  mappedUUID?: string;
  mappedName?: string;
  detectedName?: string;
  quantity?: number;
  unit?: string;
  received_qty?: number;
  unitPrice?: number;
  totalPrice?: number;
};

export type Invoice = {
  documentUUID?: string;
  created_at?: string;
  date?: string;
  supplier?: string;
  image?: string;
  supplier_uuid: string;
  ingredients: InvoiceIngredient[];
  restaurantUUID?: string;
  path?: string;
  amount?: number;
  sync_status?: string;
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
