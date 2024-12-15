import type { Supplier } from './suppliers';

export interface OrderItem {
  id: number;
  name: string;
  quantity: number;
  unit: string;
  price: number;
  orderId: number;
}

export interface Order {
  id: string;
  supplierName: string;
  orderDate: string;
  status: 'draft' | 'pending' | 'received' | 'cancelled';
  total: number;
  items: OrderItem[];
}

export const mockOrders: Order[] = [
  {
    id: "1",
    supplierName: "Fresh Produce Co.",
    orderDate: '2024-01-14T10:00:00Z',
    status: 'received',
    total: 209.20, // (50 * 2.99) + (30 * 1.99)
    items: [
      {
        id: "1",
        name: 'Fresh Tomatoes',
        quantity: 50,
        unit: 'kg',
        price: 2.99
      },
      {
        id: "2",
        name: 'Lettuce',
        quantity: 30,
        unit: 'heads',
        price: 1.99
      }
    ]
  },
  {
    id: "2",
    supplierName: "Premium Meats & Seafood",
    orderDate: '2024-01-15T09:00:00Z',
    status: 'pending',
    total: 1199.65, // (20 * 29.99) + (15 * 39.99)
    items: [
      {
        id: "3",
        name: 'Premium Salmon',
        quantity: 20,
        unit: 'kg',
        price: 29.99
      },
      {
        id: "4",
        name: 'Ribeye Steak',
        quantity: 15,
        unit: 'kg',
        price: 39.99
      }
    ]
  }
];

export default mockOrders;
