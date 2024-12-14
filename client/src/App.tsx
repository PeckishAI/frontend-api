import { Switch, Route } from "wouter";
import Orders from "@/pages/Orders";
import Inventory from "@/pages/Inventory";
import Menu from "@/pages/Menu";
import Invoices from "@/pages/documents/Invoices";
import DeliveryNotes from "@/pages/documents/DeliveryNotes";
import Stocktakes from "@/pages/documents/Stocktakes";
import Sidebar from "@/components/layout/Sidebar";

function App() {
  return (
    <div className="flex">
      <Sidebar />
      <Switch>
        <Route path="/" component={Orders} />
        <Route path="/inventory" component={Inventory} />
        <Route path="/menu" component={Menu} />
        <Route path="/documents" component={Invoices} />
        <Route path="/documents/invoices" component={Invoices} />
        <Route path="/documents/delivery-notes" component={DeliveryNotes} />
        <Route path="/documents/stocktakes" component={Stocktakes} />
      </Switch>
    </div>
  );
}

export default App;
