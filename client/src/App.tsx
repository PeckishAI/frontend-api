import { useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { Route, Router, Switch } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { queryClient } from "@/lib/queryClient";
import { RestaurantProvider } from "@/contexts/RestaurantContext";
import Sidebar from "@/components/layout/Sidebar";
import Documents from "@/pages/documents/Documents"; // Changed import path to Documents
import Inventory from "@/pages/Inventory";
import Menu from "@/pages/Menu";
import Orders from "@/pages/Orders";
import General from "@/pages/General";
import RestaurantManagement from "@/pages/RestaurantManagement";

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RestaurantProvider>
        <div className="min-h-screen bg-gray-50">
          <Sidebar />
          <Switch>
            <Route path="/" component={General} />
            <Route path="/inventory" component={Inventory} />
            <Route path="/menu" component={Menu} />
            <Route path="/orders" component={Orders} />
            <Route path="/documents" component={Documents} /> {/* Updated route */}
            <Route path="/restaurant" component={RestaurantManagement} />
          </Switch>
        </div>
        <Toaster />
      </RestaurantProvider>
    </QueryClientProvider>
  );
}