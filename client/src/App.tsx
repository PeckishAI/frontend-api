import { Switch, Route } from "wouter";
import Orders from "@/pages/Orders";
import Inventory from "@/pages/Inventory";
import Menu from "@/pages/Menu";
import Documents from "@/pages/Documents";
import General from "@/pages/General";
import Profile from "@/pages/Profile";
import RestaurantManagement from "@/pages/RestaurantManagement";
import { Home } from "@/pages/Home";

import Sidebar from "@/components/layout/Sidebar";

function App() {
  return (
    <div className="flex">
      <Sidebar />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/inventory" component={Inventory} />
        <Route path="/menu" component={Menu} />
        <Route path="/orders" component={Orders} />
        <Route path="/documents" component={Documents} />
        <Route path="/profile" component={Profile} />
        <Route path="/restaurant-management" component={RestaurantManagement} />
      </Switch>
    </div>
  );
}

export default App;
