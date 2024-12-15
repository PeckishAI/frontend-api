import type { InventorySupplierInfo } from '@/lib/types';

export interface InventoryItem {
  id: string;
  name: string;
  tags: string[];
  parLevel: number;
  quantity: number;
  unit: string;
  suppliers: InventorySupplierInfo[];
}

export const mockInventory: InventoryItem[] = [
  {
    id: "1",
    name: "Fresh Tomatoes",
    tags: ["Produce", "Fresh"],
    quantity: 145,
    unit: "kg",
    parLevel: 50,
    suppliers: [
      {
        supplierId: "1",
        supplierName: "Fresh Produce Co.",
        unitCost: 2.99,
        packSize: "10kg box"
      }
    ]
  },
  {
    id: "2",
    name: "Lettuce",
    tags: ["Produce", "Fresh"],
    quantity: 85,
    unit: "heads",
    parLevel: 30,
    suppliers: [
      {
        supplierId: "1",
        supplierName: "Fresh Produce Co.",
        unitCost: 1.99,
        packSize: "12 heads"
      }
    ]
  },
  {
    id: "3",
    name: "Premium Salmon",
    tags: ["Seafood", "Fresh"],
    quantity: 45,
    unit: "kg",
    parLevel: 20,
    suppliers: [
      {
        supplierId: "2",
        supplierName: "Premium Meats & Seafood",
        unitCost: 29.99,
        packSize: "5kg box"
      }
    ]
  },
  {
    id: "4",
    name: "Ribeye Steak",
    tags: ["Meat", "Premium"],
    quantity: 38,
    unit: "kg",
    parLevel: 15,
    suppliers: [
      {
        supplierId: "2",
        supplierName: "Premium Meats & Seafood",
        unitCost: 39.99,
        packSize: "2kg pack"
      }
    ]
  },
  {
    id: "5",
    name: "Black Peppercorns",
    tags: ["Spices", "Dry Goods"],
    quantity: 25,
    unit: "kg",
    parLevel: 10,
    suppliers: [
      {
        supplierId: "3",
        supplierName: "Global Spice Traders",
        unitCost: 15.99,
        packSize: "1kg bag"
      }
    ]
  }
];

export default mockInventory;
