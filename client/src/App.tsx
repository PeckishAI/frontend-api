import { Switch, Route } from "wouter";
import Orders from "@/pages/Orders";
import Inventory from "@/pages/Inventory";
import Menu from "@/pages/Menu";
import Documents from "@/pages/Documents";
import General from "@/pages/General";
import Profile from "@/pages/Profile";

import Sidebar from "@/components/layout/Sidebar";

function App() {
  return (
    <div className="flex">
      <Sidebar />
      <Switch>
        <Route path="/" component={General} />
        <Route path="/inventory" component={Inventory} />
        <Route path="/menu" component={Menu} />
        <Route path="/orders" component={Orders} />
        <Route path="/documents" component={Documents} />
        <Route path="/profile" component={Profile} />
      </Switch>
    </div>
  );
}

export default App;
