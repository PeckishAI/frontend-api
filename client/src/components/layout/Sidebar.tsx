import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Package, ClipboardList, MenuSquare, Files, ChartBar } from "lucide-react";
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
  useSidebar,
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

function SidebarMainContent() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [location] = useLocation();
  const [currentRestaurant, setCurrentRestaurant] = useState<Restaurant | undefined>(mockRestaurants[0]);
  const { toast } = useToast();

  return (
    <div className="flex flex-col h-full bg-white">
      <SidebarHeader>
        <div className="flex h-[60px] items-center px-4">
          <div className="flex items-center gap-3 flex-1">
            <img 
              src="/images/peckish-logo.jpg" 
              alt="Peckish Logo" 
              className="h-8 w-8 rounded-md object-cover shrink-0"
            />
            <h1 className="font-semibold text-lg group-data-[collapsible=icon]:hidden">Peckish</h1>
          </div>
          <SidebarTrigger className="h-7 w-7" />
        </div>
      </SidebarHeader>

      <SidebarContent>
        {!isCollapsed && (
          <div className="px-2 pb-2 border-b border-gray-200">
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
                    <span className="truncate group-data-[collapsible=icon]:hidden">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </SidebarContent>

      <SidebarFooter className="border-t border-gray-200 mt-auto">
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
      </SidebarFooter>
    </div>
  );
}

export default function Sidebar() {
  return (
    <SidebarProvider>
      <SidebarComponent variant="inset" collapsible="icon" className="border-r border-border">
        <SidebarMainContent />
      </SidebarComponent>
    </SidebarProvider>
  );
}
