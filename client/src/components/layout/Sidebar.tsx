import { useState } from "react";
import { Link } from "wouter";
import { Package, ClipboardList, MenuSquare, Files, ChartBar } from "lucide-react";
import { RestaurantSelector, type Restaurant } from "./RestaurantSelector";

const menuItems = [
  { icon: Package, label: "Orders", href: "/" },
  { icon: ClipboardList, label: "Inventory", href: "/inventory" },
  { icon: MenuSquare, label: "Menu", href: "/menu" },
  { icon: Files, label: "Documents", href: "/documents" },
  { icon: ChartBar, label: "General", href: "/general" },
];

const mockRestaurants: Restaurant[] = [
  { id: 1, name: "Main Restaurant" },
  { id: 2, name: "Second Location" },
];

export default function Sidebar() {
  const [currentRestaurant, setCurrentRestaurant] = useState<Restaurant | undefined>(mockRestaurants[0]);

  return (
    <div className="w-64 h-screen bg-white border-r border-gray-200 fixed left-0 top-0">
      <div className="flex flex-col h-full">
        <RestaurantSelector
          restaurants={mockRestaurants}
          currentRestaurant={currentRestaurant}
          onRestaurantChange={setCurrentRestaurant}
          onCreateNew={() => {
            console.log("Create new restaurant");
          }}
          onManageRestaurants={() => {
            console.log("Manage restaurants");
          }}
        />
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link 
                    href={item.href}
                    className="flex items-center gap-3 px-3 py-2 text-gray-700 rounded-md hover:bg-gray-100 hover:text-gray-900 transition-colors"
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </div>
  );
}
