export type Ingredient = {
  id: string;
  name: string;
  theoreticalStock: number;
  quantity: number;
  unit: string;
  supplier: string;
  cost: number;
  actions: void;
};

export type IngredientForSupplier = {
  id: string;
  name: string;
  stock: number;
  expectedSales: string;
  unit: string;
  price: number;
  actions?: void;
};

export type IngredientForCustomers = {
  id: string;
  name: string;
  safetyStock: number;
  quantity: number;
  unit: string;
  ordered?: boolean;
};
