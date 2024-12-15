import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Package, ClipboardList, MenuSquare, Files, ChartBar } from "lucide-react";
import { RestaurantSelector, type Restaurant } from "./RestaurantSelector";
import { UserProfileSection } from "./UserProfileSection";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

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

const mockUser = {
  name: "John Doe",
  role: "Restaurant Manager",
  avatar: undefined, // Will use fallback
};

export default function Sidebar() {
  const [currentRestaurant, setCurrentRestaurant] = useState<Restaurant | undefined>(mockRestaurants[0]);
  const { toast } = useToast();

  return (
    <div className="w-64 h-screen bg-white fixed left-0 top-0">
      <div className="h-full border-r border-gray-200 [&>*:has(a[data-active=true])]:border-r-transparent">
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-semibold">
                R
              </div>
              <h1 className="font-semibold text-lg">Restaurant OS</h1>
            </div>
          </div>
          <nav className="flex-1 overflow-y-auto">
            <div className="p-2 border-b border-gray-200">
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
            </div>
            <div className="py-2">
              <ul className="flex flex-col">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const [location] = useLocation();
                  const isActive = location === item.href;
                  
                  return (
                    <li key={item.href}>
                      <Link 
                        href={item.href}
                        data-active={isActive}
                        className={cn(
                          "flex items-center gap-3 px-6 py-2 text-gray-500 hover:text-gray-900 transition-colors relative",
                          isActive && "text-gray-900 font-medium hover:text-gray-900"
                        )}
                      >
                        <Icon className="h-5 w-5" />
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </nav>
          <div className="border-t border-gray-200 mt-auto">
            <UserProfileSection
              user={mockUser}
              onSignOut={() => {
                toast({
                  title: "Signed out",
                  description: "You have been signed out of your account",
                });
              }}
              onViewProfile={() => {
                console.log("View profile");
              }}
              onSettings={() => {
                console.log("Settings");
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}