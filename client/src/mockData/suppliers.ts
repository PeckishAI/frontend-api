export interface Supplier {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export const mockSuppliers: Supplier[] = [
  {
    id: 1,
    name: "Fresh Produce Co.",
    email: "orders@freshproduce.co",
    phone: "(555) 123-4567",
    address: "123 Farm Road, Agricultural District",
    active: true,
    createdAt: "2024-01-15T08:00:00Z",
    updatedAt: "2024-01-15T08:00:00Z"
  },
  {
    id: 2,
    name: "Premium Meats & Seafood",
    email: "sales@premiummeats.com",
    phone: "(555) 234-5678",
    address: "456 Dock Street, Waterfront District",
    active: true,
    createdAt: "2024-01-10T09:30:00Z",
    updatedAt: "2024-01-14T15:45:00Z"
  },
  {
    id: 3,
    name: "Global Spice Traders",
    email: "info@globalspices.com",
    phone: "(555) 345-6789",
    address: "789 Market Street, Trading District",
    active: true,
    createdAt: "2024-01-05T11:20:00Z",
    updatedAt: "2024-01-13T16:30:00Z"
  }
];

export default mockSuppliers;
