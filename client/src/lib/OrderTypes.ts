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

export interface User {
  user_uuid?: string;
  user_name?: string;
}

export interface OrderItem {
  uuid?: string;
  ingredient_uuid?: string;
  ingredient_name?: string;
  quantity?: number;
  unit?: Unit;
  unit_cost?: number;
  total_cost?: number;
  product_code?: string;
}

export interface Order {
  order_uuid?: string;
  order_number?: string;
  supplier?: Supplier;
  order_date?: string;
  status?: OrderStatus;
  total_cost?: number;
  ingredients?: OrderItem[];
  delivery_date?: string;
  user?: User;
  linked_documents?: {
    uuid?: string;
    invoice_uuid?: string;
    delivery_note_uuid?: string;
  };
}
