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
  id: number;
  supplierId: number;
  supplier?: Supplier;
  status: 'pending' | 'confirmed' | 'delivered' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}

export const mockOrders: Order[] = [
  {
    id: 1,
    supplierId: 1,
    status: 'delivered',
    createdAt: '2024-01-14T10:00:00Z',
    updatedAt: '2024-01-15T14:30:00Z',
    items: [
      {
        id: 1,
        name: 'Fresh Tomatoes',
        quantity: 50,
        unit: 'kg',
        price: 2.99,
        orderId: 1
      },
      {
        id: 2,
        name: 'Lettuce',
        quantity: 30,
        unit: 'heads',
        price: 1.99,
        orderId: 1
      }
    ]
  },
  {
    id: 2,
    supplierId: 2,
    status: 'pending',
    createdAt: '2024-01-15T09:00:00Z',
    updatedAt: '2024-01-15T09:00:00Z',
    items: [
      {
        id: 3,
        name: 'Premium Salmon',
        quantity: 20,
        unit: 'kg',
        price: 29.99,
        orderId: 2
      },
      {
        id: 4,
        name: 'Ribeye Steak',
        quantity: 15,
        unit: 'kg',
        price: 39.99,
        orderId: 2
      }
    ]
  }
];

export default mockOrders;
