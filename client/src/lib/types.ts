export type OrderStatus = 'draft' | 'pending' | 'received' | 'cancelled';

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
  id: number;
  name: string;
  category: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InventorySupplierInfo {
  supplierId: string;
  supplierName: string;
  unitCost: number;
  packSize: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  tags: string[];
  parLevel: number;
  quantity: number;
  unit: string;
  suppliers: InventorySupplierInfo[];
}

export interface UnitOption {
  value: string;
  label: string;
  category?: string;
}
