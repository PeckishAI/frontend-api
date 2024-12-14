import { Order, Supplier } from './types';

export const mockOrders: Order[] = [
  {
    id: '1',
    supplierName: 'Fresh Produce Co',
    orderDate: '2024-03-15',
    status: 'pending',
    total: 1250.50,
    items: [
      { id: '1-1', name: 'Tomatoes', quantity: 50, unit: 'kg', price: 4.99 },
      { id: '1-2', name: 'Lettuce', quantity: 30, unit: 'heads', price: 2.99 }
    ]
  },
  {
    id: '2',
    supplierName: 'Meat Masters',
    orderDate: '2024-03-14',
    status: 'draft',
    total: 2450.75,
    items: [
      { id: '2-1', name: 'Beef Sirloin', quantity: 40, unit: 'kg', price: 29.99 },
      { id: '2-2', name: 'Chicken Breast', quantity: 50, unit: 'kg', price: 12.99 }
    ]
  },
  {
    id: '3',
    supplierName: 'Seafood Direct',
    orderDate: '2024-03-13',
    status: 'received',
    total: 1875.25,
    items: [
      { id: '3-1', name: 'Fresh Salmon', quantity: 25, unit: 'kg', price: 45.99 }
    ]
  }
];

export const mockSuppliers: Supplier[] = [
  { id: '1', name: 'Fresh Produce Co', category: 'Vegetables', rating: 4.5 },
  { id: '2', name: 'Meat Masters', category: 'Meat', rating: 4.8 },
  { id: '3', name: 'Seafood Direct', category: 'Seafood', rating: 4.3 }
];

export const getStatusColor = (status: string) => {
  const colors = {
    draft: 'bg-gray-200 text-gray-800',
    pending: 'bg-blue-100 text-blue-800',
    received: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  };
  return colors[status as keyof typeof colors] || colors.draft;
};
