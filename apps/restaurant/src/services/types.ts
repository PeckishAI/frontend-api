export type Supplier = {
  supplier_uuid: string;
  supplier_name: string;
  supplier_cost: number;
  conversion_factor?: number;
  supplier_unit: string;
  supplier_unit_name: string;
  supplier_unit_cost?: string | null;
  product_code?: string;
};

export type Recipe = {
  conversion_factor: number;
  quantity: number;
  recipe_name: string;
  recipe_uuid: string;
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
  tag_details?: TagDetails[] | null;
  actualStock: Stock;
  parLevel: number;
  amount: number;
  actions?: void;
  quantity: number;
  restaurantUUID?: string;
  deleted_recipe_ingredient_data?: string[];
  supplier_details?: Supplier[];
  recipes?: Recipe[];
  recipe_count?: number;
  stock_history?: Stock[];
  unit_name?: string;
  unit_uuid?: string;
  volume_unit_uuid: string;
  volume_unit_name: string;
  volume_quantity: number;
  conversion_factor?: number;
};

export type IngredientPreparation = {
  item_uuid: string;
  item_name: string;
  quantity: number;
  unit_name: string;
  unit_uuid: string;
  base_unit_uuid?: string;
  base_unit_name?: string;
  conversion_factor: number;
  type: string;
};

export type RecipeIngredient = {
  item_uuid: string;
  item_name: string;
  base_unit_uuid?: string;
  base_unit_name?: string;
  unit_cost?: number;
  unit_name: string;
  unit_uuid: string;
  conversion_factor?: number;
  quantity?: number;
  type: string;
};

export type Tag = {
  uuid: string;
  name: string;
};

export type Tags = {
  name: string;
};

export type TagOption = {
  label: string;
  value: string;
  __isNew__?: boolean;
};

export type TagDetails = {
  name: string;
  uuid: string;
};

export type InvoiceIngredient = {
  inventoryIngredientRef?: Ingredient | null;
  mappedUUID?: string;
  mappedName?: string;
  detectedName?: string;
  quantity?: number;
  unit_uuid?: string;
  unitName?: string;
  received_qty?: number;
  unitPrice?: number;
  totalPrice?: number;
  item_uuid?: string;
};

export type Invoice = {
  documentUUID?: string;
  created_at?: string;
  date?: Date;
  supplier?: string;
  image?: string;
  supplier_uuid: string;
  ingredients: InvoiceIngredient[];
  restaurantUUID?: string;
  path?: string[];
  amount?: number;
  sync_status?: string;
};

export type Unit = {
  unit_name: string;
  unit_uuid: string;
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

export type IngredientTMP = {
  ingredient_uuid?: string;
  ingredient_name?: string;
  base_unit?: Unit;
  quantity?: number;
  par_level?: number;
  tags?: TagsTMP[];
  suppliers?: SupplierIngredientTMP[];
  volume_unit?: Unit;
  volume_quantity?: number;
};

export type SupplierIngredientTMP = {
  supplier_uuid?: string;
  supplier_name?: string;
  unit_cost?: number;
  conversion_factor?: number;
  unit?: Unit;
  product_code?: string;
};

export type TagsTMP = {
  tag_uuid?: string;
  tag_name?: string;
};
