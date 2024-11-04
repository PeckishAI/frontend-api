export type SupplierIngredient = {
  supplierUUID?: string;
  supplierName: string;
  conversionFactor?: number;
  supplierUnitUUID: string;
  supplierUnitName: string;
  supplierUnitCost?: number | null;
};

export type RecipeIngredient = {
  recipeUUID: string;
  recipeName: string;
  quantity: number;
  unitUUID: string;
  unitName: string;
  conversionFactor?: number | 1;
};

export type RollingStock = {
  eventType?: string | null;
  quantity?: number | null;
  unitName?: string | null;
  unitUUID?: string | null;
};

export type TagDetails = {
  tagUUID: string;
  tagName: string;
};

export type Ingredient = {
  type?: string;
  ingredientUUID?: string;
  ingredientName: string;
  tagDetails?: TagDetails[] | null;
  parLevel?: number;
  actions?: void;
  quantity?: number;
  restaurantUUID?: string;
  supplierDetails?: SupplierIngredient[];
  recipeDetails?: RecipeIngredient[];
  stockHistory?: RollingStock[];
  unitName?: string;
  unitUUID?: string;
  conversionFactor?: number | null;
  volumeUnitUUID?: string;
  volumeUnitName?: string;
  volumeQuantity?: number;
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
  unitUUID: string;
  unitName: string;
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
