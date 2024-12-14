import { Switch, Route } from "wouter";
import Orders from "@/pages/Orders";

function App() {
  return (
    <Switch>
      <Route path="/" component={Orders} />
    </Switch>
  );
}

export default App;
