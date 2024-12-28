type interface Unit {
  unit_uuid?: string;
  unit_name?: string;
}

type interface Supplier {
  supplier_uuid?: string;
  supplier_name?: string;
}

type interface OrderIngredient {
  uuid?: string;
  ingredient_uuid?: string;
  ingredient_name?: string;
  quantity?: number;
  unit?: Unit;
  unit_cost?: number;
  total_cost?: number;
}

type interface Order {
  order_uuid?: string;
  order_number?: string;
  suppliers?: Supplier[];
  status?: string;
  date?: string;
  delivery_date?: string;
  placed_by?: string;
  ingredients?: OrderIngredient[];
  total_cost?: number;
}