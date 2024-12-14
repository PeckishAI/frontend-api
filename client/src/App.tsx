import { Switch, Route } from "wouter";
import Orders from "@/pages/Orders";
import Inventory from "@/pages/Inventory";
import Menu from "@/pages/Menu";
import Documents from "@/pages/Documents";
import General from "@/pages/General";
import Sidebar from "@/components/layout/Sidebar";

function App() {
  return (
    <div className="flex">
      <Sidebar />
      <Switch>
        <Route path="/" component={Orders} />
        <Route path="/inventory" component={Inventory} />
        <Route path="/menu" component={Menu} />
        <Route path="/documents" component={Documents} />
        <Route path="/general" component={General} />
      </Switch>
    </div>
  );
}

export default App;
