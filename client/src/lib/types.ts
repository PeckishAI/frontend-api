export type OrderStatus = "draft" | "pending" | "received" | "cancelled";

export interface Order {
  id: string;
  supplierName: string;
  orderDate: string;
  status: OrderStatus;
  total: number;
  items: OrderItem[];
}

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  price: number;
}

export interface Supplier {
  supplier_uuid: string;
  supplier_name: string;
  category?: string;
  email?: string;
  phone?: string;
  address?: string;
  active?: boolean;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface InventorySupplierInfo {
  supplier: Supplier;
  unit_cost: number;
  pack_size: string;
}

export interface InventoryItem {
  ingredient_uuid?: string;
  ingredient_name: string;
  tags?: Tag[];
  par_level?: number;
  quantity?: number;
  unit?: Unit;
  ingredient_suppliers?: InventorySupplierInfo[];
}

export interface UnitOption {
  value: string;
  label: string;
  category?: string;
}

export interface Unit {
  unit_uuid: string;
  unit_name: string;
}

export interface Tag {
  tag_uuid: string;
  tag_name: string;
}
