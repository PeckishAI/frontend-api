export type Ingredient = {
  id: string;
  name: string;
  tagUUID?: string | null;
  actualStock: number;
  theoriticalStock?: number;
  parLevel: number;
  unit: string;
  supplier: string;
  amount: number;
  unitCost: number;
  actions?: void;
};

export type Tag = {
  uuid: string;
  name: string;
};

export type InvoiceIngredient = {
  inventoryIngredientRef?: Ingredient | null;
  mappedUUID?: string;
  mappedName?: string;
  detectedName?: string;
  quantity?: number;
  unit?: string;
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
};
