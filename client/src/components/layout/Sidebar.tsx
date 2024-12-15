import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Package, ClipboardList, MenuSquare, Files, ChartBar, PanelLeftClose, PanelLeft } from "lucide-react";
import { RestaurantSelector, type Restaurant } from "./RestaurantSelector";
import { UserProfileSection } from "./UserProfileSection";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  Sidebar as SidebarComponent,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const menuItems = [
  { icon: ChartBar, label: "General", href: "/" },
  { icon: ClipboardList, label: "Inventory", href: "/inventory" },
  { icon: MenuSquare, label: "Menu", href: "/menu" },
  { icon: Package, label: "Orders", href: "/orders" },
  { icon: Files, label: "Documents", href: "/documents" },
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
  const [collapsed, setCollapsed] = useState(false);
  
  return (
    <SidebarProvider defaultOpen={true}>
      <SidebarComponent>
        <div className="flex flex-col h-full">
          <SidebarHeader className="border-b border-border p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img 
                  src="/images/peckish-logo.jpg" 
                  alt="Peckish Logo" 
                  className="h-8 w-8 rounded-md object-cover"
                />
                {!collapsed && <h1 className="font-semibold text-lg">Peckish</h1>}
              </div>
              <button
                onClick={() => setCollapsed(!collapsed)}
                className="p-1 rounded-md hover:bg-gray-100"
              >
                {collapsed ? <PanelLeft className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
              </button>
            </div>
          </SidebarHeader>

          <SidebarContent>
            {!collapsed && (
              <div className="p-2 border-b border-gray-200">
                <RestaurantSelector
                  restaurants={mockRestaurants}
                  currentRestaurant={currentRestaurant}
                  onRestaurantChange={setCurrentRestaurant}
                  onCreateNew={() => {
                    console.log("Create new restaurant");
                  }}
                  onManageRestaurants={() => {
                    window.location.href = "/restaurant-management";
                  }}
                />
              </div>
            )}
            
            <nav className="py-2">
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
                          isActive && "text-gray-900 font-medium hover:text-gray-900",
                          collapsed && "justify-center px-2"
                        )}
                      >
                        <Icon className="h-5 w-5" />
                        {!collapsed && item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </SidebarContent>

          <SidebarFooter className="border-t border-gray-200 mt-auto">
            {!collapsed ? (
              <UserProfileSection
                user={mockUser}
                onSignOut={() => {
                  toast({
                    title: "Signed out",
                    description: "You have been signed out of your account",
                  });
                }}
                onViewProfile={() => {
                  window.location.href = "/profile";
                }}
                onSettings={() => {
                  console.log("Settings");
                }}
              />
            ) : (
              <div className="p-2 flex justify-center">
                <button
                  onClick={() => window.location.href = "/profile"}
                  className="p-2 rounded-full hover:bg-gray-100"
                >
                  <img
                    src={mockUser.avatar ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(mockUser.name)}`}
                    alt={mockUser.name}
                    className="h-8 w-8 rounded-full"
                  />
                </button>
              </div>
            )}
          </SidebarFooter>
        </div>
      </SidebarComponent>
    </SidebarProvider>
  );
}