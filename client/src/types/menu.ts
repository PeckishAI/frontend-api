export interface Unit {
  unit_uuid?: string;
  unit_name?: string;
}

export interface ProductIngredient {
  uuid?: string;
  ingredient_uuid?: string;
  ingredient_name?: string;
  quantity?: number;
  base_unit?: Unit;
  recipe_unit?: Unit;
  unit_cost?: number;
  total_cost?: number;
  base_to_recipe?: number;
}

export interface ProductPreparation {
  uuid?: string;
  preparation_uuid?: string;
  preparation_name?: string;
  quanity?: number;
  base_unit?: Unit;
  recipe_unit?: Unit;
  unit_cost?: number;
  total_cost?: number;
  base_to_recipe?: number;
}

export interface Product {
  product_uuid?: string;
  product_name?: string;
  portion_count?: number;
  portion_price?: number;
  portion_cost?: number;
  product_ingredients?: ProductIngredient[];
  product_preparations?: ProductPreparation[];
}
