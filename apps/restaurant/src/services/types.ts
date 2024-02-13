export type Ingredient = {
  id: string;
  name: string;
  safetyStock: number;
  quantity: number;
  unit: string;
  supplier: string;
  unitCost: number;
  actions?: void;
};
