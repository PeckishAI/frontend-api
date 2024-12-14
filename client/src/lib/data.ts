import { Order, Supplier, InventoryItem, UnitOption } from './types';

export const defaultUnits: UnitOption[] = [
  // Weight
  { value: 'kg', label: 'Kilogram (kg)', category: 'Weight' },
  { value: 'g', label: 'Gram (g)', category: 'Weight' },
  { value: 'lb', label: 'Pound (lb)', category: 'Weight' },
  { value: 'oz', label: 'Ounce (oz)', category: 'Weight' },
  
  // Volume
  { value: 'l', label: 'Liter (L)', category: 'Volume' },
  { value: 'ml', label: 'Milliliter (mL)', category: 'Volume' },
  { value: 'gal', label: 'Gallon (gal)', category: 'Volume' },
  { value: 'qt', label: 'Quart (qt)', category: 'Volume' },
  
  // Count
  { value: 'pcs', label: 'Pieces', category: 'Count' },
  { value: 'doz', label: 'Dozen', category: 'Count' },
  
  // Container
  { value: 'box', label: 'Box', category: 'Container' },
  { value: 'case', label: 'Case', category: 'Container' },
  { value: 'bag', label: 'Bag', category: 'Container' },
];

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
  { id: '3', name: 'Seafood Direct', category: 'Seafood', rating: 4.3 },
  { id: '4', name: 'Local Farm', category: 'Vegetables', rating: 4.2 },
  { id: '5', name: 'Global Foods', category: 'Pantry', rating: 4.6 },
  { id: '6', name: 'Dairy Fresh', category: 'Dairy', rating: 4.4 },
  { id: '7', name: 'Local Dairy Co', category: 'Dairy', rating: 4.1 }
];

export const mockInventory: InventoryItem[] = [
  {
    id: '1',
    name: 'Tomatoes',
    tags: ['vegetables', 'fresh produce'],
    parLevel: 100.5,
    quantity: 75.2,
    unit: 'kg',
    suppliers: [
      {
        supplierId: '1',
        supplierName: 'Fresh Produce Co',
        unitCost: 4.99,
        packSize: '10kg box'
      },
      {
        supplierId: '4',
        supplierName: 'Local Farm',
        unitCost: 4.50,
        packSize: '5kg bag'
      }
    ]
  },
  {
    id: '2',
    name: 'Chicken Breast',
    tags: ['meat', 'poultry'],
    parLevel: 80.0,
    quantity: 65.5,
    unit: 'kg',
    suppliers: [
      {
        supplierId: '2',
        supplierName: 'Meat Masters',
        unitCost: 12.99,
        packSize: '5kg pack'
      }
    ]
  },
  {
    id: '3',
    name: 'Olive Oil',
    tags: ['pantry', 'oils'],
    parLevel: 50.0,
    quantity: 45.5,
    unit: 'l',
    suppliers: [
      {
        supplierId: '5',
        supplierName: 'Global Foods',
        unitCost: 24.99,
        packSize: '5L container'
      }
    ]
  },
  {
    id: '4',
    name: 'Basmati Rice',
    tags: ['grains', 'pantry'],
    parLevel: 120.0,
    quantity: 85.75,
    unit: 'kg',
    suppliers: [
      {
        supplierId: '5',
        supplierName: 'Global Foods',
        unitCost: 3.99,
        packSize: '25kg bag'
      }
    ]
  },
  {
    id: '5',
    name: 'Fresh Salmon',
    tags: ['seafood', 'fresh'],
    parLevel: 40.0,
    quantity: 25.5,
    unit: 'kg',
    suppliers: [
      {
        supplierId: '3',
        supplierName: 'Seafood Direct',
        unitCost: 28.99,
        packSize: '5kg box'
      }
    ]
  },
  {
    id: '6',
    name: 'Heavy Cream',
    tags: ['dairy', 'refrigerated'],
    parLevel: 30.0,
    quantity: 12.75,
    unit: 'l',
    suppliers: [
      {
        supplierId: '6',
        supplierName: 'Dairy Fresh',
        unitCost: 5.99,
        packSize: '2L carton'
      },
      {
        supplierId: '7',
        supplierName: 'Local Dairy Co',
        unitCost: 5.50,
        packSize: '1L bottle'
      }
    ]
  }
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

export const getAllTags = () => {
  const tagsSet = new Set<string>();
  mockInventory.forEach(item => {
    item.tags.forEach(tag => tagsSet.add(tag));
  });
  return Array.from(tagsSet).sort();
};

export const getAllSuppliers = () => {
  const suppliersSet = new Set<string>();
  mockInventory.forEach(item => {
    item.suppliers.forEach(supplier => suppliersSet.add(supplier.supplierName));
  });
  return Array.from(suppliersSet).sort();
};
