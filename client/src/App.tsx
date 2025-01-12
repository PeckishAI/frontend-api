import { useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { Route, Switch, useLocation } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { queryClient } from "@/lib/queryClient";
import { RestaurantProvider } from "@/contexts/RestaurantContext";
import Sidebar from "@/components/layout/Sidebar";
import Documents from "@/pages/Documents";
import Inventory from "@/pages/Inventory";
import Menu from "@/pages/menu/Menu";
import Orders from "@/pages/Orders";
import General from "@/pages/General";
import RestaurantManagement from "@/pages/RestaurantManagement";
import Profile from "@/pages/Profile";
import SignIn from "@/pages/SignIn";
import SignUp from "@/pages/SignUp";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

// Wrapper component for protected routes
function ProtectedRoute({ component: Component, ...rest }: { component: React.ComponentType<any> }) {
  const { user, isLoadingUser } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoadingUser && !user) {
      setLocation('/signin');
    }
  }, [user, isLoadingUser, setLocation]);

  if (isLoadingUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <Component {...rest} />;
}

export default function App() {
  const [location] = useLocation();
  const showSidebar = !location.startsWith("/signin") && !location.startsWith("/signup");
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {showSidebar && user && <Sidebar />}
      <Switch>
        <Route path="/signin" component={SignIn} />
        <Route path="/signup" component={SignUp} />
        <Route path="/" component={() => <ProtectedRoute component={General} />} />
        <Route path="/inventory" component={() => <ProtectedRoute component={Inventory} />} />
        <Route path="/menu" component={() => <ProtectedRoute component={Menu} />} />
        <Route path="/orders" component={() => <ProtectedRoute component={Orders} />} />
        <Route path="/documents" component={() => <ProtectedRoute component={Documents} />} />
        <Route path="/restaurant" component={() => <ProtectedRoute component={RestaurantManagement} />} />
        <Route path="/profile" component={() => <ProtectedRoute component={Profile} />} />
      </Switch>
      <Toaster />
    </div>
  );
}