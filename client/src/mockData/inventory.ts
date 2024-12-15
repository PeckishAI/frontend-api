export interface InventoryItem {
  id: number;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  reorderPoint: number;
  lastRestocked: string;
  supplierId: number;
  unitPrice: number;
}

export const mockInventory: InventoryItem[] = [
  {
    id: 1,
    name: "Fresh Tomatoes",
    category: "Produce",
    quantity: 145,
    unit: "kg",
    reorderPoint: 50,
    lastRestocked: "2024-01-15T14:30:00Z",
    supplierId: 1,
    unitPrice: 2.99
  },
  {
    id: 2,
    name: "Lettuce",
    category: "Produce",
    quantity: 85,
    unit: "heads",
    reorderPoint: 30,
    lastRestocked: "2024-01-15T14:30:00Z",
    supplierId: 1,
    unitPrice: 1.99
  },
  {
    id: 3,
    name: "Premium Salmon",
    category: "Seafood",
    quantity: 45,
    unit: "kg",
    reorderPoint: 20,
    lastRestocked: "2024-01-14T11:15:00Z",
    supplierId: 2,
    unitPrice: 29.99
  },
  {
    id: 4,
    name: "Ribeye Steak",
    category: "Meat",
    quantity: 38,
    unit: "kg",
    reorderPoint: 15,
    lastRestocked: "2024-01-14T11:15:00Z",
    supplierId: 2,
    unitPrice: 39.99
  },
  {
    id: 5,
    name: "Black Peppercorns",
    category: "Spices",
    quantity: 25,
    unit: "kg",
    reorderPoint: 10,
    lastRestocked: "2024-01-13T16:30:00Z",
    supplierId: 3,
    unitPrice: 15.99
  }
];

export default mockInventory;
