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
    <SidebarProvider defaultOpen={!collapsed} open={!collapsed} onOpenChange={(open) => setCollapsed(!open)}>
      <SidebarComponent variant="sidebar" collapsible="icon">
        <div className="flex flex-col h-full">
          <SidebarHeader className="border-b border-sidebar-border px-2">
            <div className="flex h-[60px] items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <img 
                  src="/images/peckish-logo.jpg" 
                  alt="Peckish Logo" 
                  className="h-8 w-8 rounded-md object-cover shrink-0"
                />
                <h1 className="font-semibold text-lg truncate">Peckish</h1>
              </div>
              <SidebarTrigger />
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
            
            <nav>
              <ul className="space-y-1 p-2">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const [location] = useLocation();
                  const isActive = location === item.href;
                  
                  return (
                    <li key={item.href}>
                      <Link 
                        href={item.href}
                        className={cn(
                          "flex h-10 w-full items-center rounded-md px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                          isActive && "bg-accent text-accent-foreground",
                          "gap-3"
                        )}
                      >
                        <Icon className="h-5 w-5 shrink-0" />
                        <span className="truncate">{item.label}</span>
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