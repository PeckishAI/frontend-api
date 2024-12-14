import { Switch, Route } from "wouter";
import Orders from "@/pages/Orders";
import Inventory from "@/pages/Inventory";
import Sidebar from "@/components/layout/Sidebar";

function App() {
  return (
    <div className="flex">
      <Sidebar />
      <Switch>
        <Route path="/" component={Orders} />
        <Route path="/inventory" component={Inventory} />
      </Switch>
    </div>
  );
}

export default App;
