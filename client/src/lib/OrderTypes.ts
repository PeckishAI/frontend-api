export type OrderStatus = "draft" | "pending" | "received" | "cancelled";

export interface Supplier {
  supplier_uuid?: string;
  supplier_name?: string;
  email?: string;
  phone?: string;
}

export interface Unit {
  unit_uuid?: string;
  unit_name?: string;
}

export interface OrderItem {
  ingredient_uuid?: string;
  ingredient_name?: string;
  quantity?: number;
  unit?: Unit;
  unit_cost?: number;
  total_cost?: number;
}

export interface Order {
  order_uuid?: string;
  order_number?: string;
  supplier?: Supplier;
  order_date?: string;
  status?: OrderStatus;
  amount?: number;
  items?: OrderItem[];
  delivery_date?: string;
}
