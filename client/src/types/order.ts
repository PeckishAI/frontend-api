
export interface Unit {
  unit_uuid?: string;
  unit_name?: string;
}

export interface Supplier {
  supplier_uuid?: string;
  supplier_name?: string;
  email?: string;
  phone?: string;
}

export interface OrderItem {
  uuid?: string;
  ingredient_uuid?: string;
  ingredient_name?: string;
  product_code?: string;
  quantity?: number;
  unit?: Unit;
  unit_cost?: number;
  total_cost?: number;
}

export type OrderStatus = 'draft' | 'pending' | 'received' | 'cancelled';

export interface Order {
  order_uuid?: string;
  order_number?: string;
  supplier?: Supplier;
  status?: OrderStatus;
  date?: string | null;
  delivery_date?: string | null;
  placed_by?: string;
  items?: OrderItem[];
  amount?: number;
}
