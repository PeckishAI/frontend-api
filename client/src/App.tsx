import { Switch, Route } from "wouter";
import Orders from "@/pages/Orders";
import Inventory from "@/pages/Inventory";
import Menu from "@/pages/Menu";
import Documents from "@/pages/Documents";
import General from "@/pages/General";
import Profile from "@/pages/Profile";
import RestaurantManagement from "@/pages/RestaurantManagement";
import Checkout from "@/pages/Checkout";

import Sidebar from "@/components/layout/Sidebar";

function App() {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 relative">
        <main className="absolute inset-0 overflow-y-auto bg-gray-50">
          <Switch>
            <Route path="/" component={General} />
            <Route path="/inventory" component={Inventory} />
            <Route path="/menu" component={Menu} />
            <Route path="/orders" component={Orders} />
            <Route path="/documents" component={Documents} />
            <Route path="/profile" component={Profile} />
            <Route path="/restaurant-management" component={RestaurantManagement} />
            <Route path="/checkout" component={Checkout} />
          </Switch>
        </main>
      </div>
    </div>
  );
}

export default App;
