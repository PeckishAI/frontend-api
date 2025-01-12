import { Route, Switch, useLocation } from "wouter";
import { RestaurantProvider } from "@/contexts/RestaurantContext";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import SignIn from "@/pages/SignIn";
import SignUp from "@/pages/SignUp";
import Documents from "@/pages/Documents";
import Inventory from "@/pages/Inventory";
import Menu from "@/pages/menu/Menu";
import Orders from "@/pages/Orders";
import General from "@/pages/General";
import RestaurantManagement from "@/pages/RestaurantManagement";
import Profile from "@/pages/Profile";
import Sidebar from "@/components/layout/Sidebar";

// Wrapper component for protected routes
function ProtectedRoute({ component: Component, ...rest }: { component: React.ComponentType<any> }) {
  const { user, isLoadingUser } = useAuth();
  const [, setLocation] = useLocation();

  if (isLoadingUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    setLocation('/signin');
    return null;
  }

  return <Component {...rest} />;
}

// fallback 404 not found page
function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <h1 className="text-2xl font-bold text-gray-900">404 Page Not Found</h1>
          </div>
          <p className="mt-4 text-sm text-gray-600">
            The page you're looking for doesn't exist or you don't have permission to view it.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function App() {
  const [location] = useLocation();
  const { user } = useAuth();
  const showSidebar = !location.startsWith("/signin") && !location.startsWith("/signup");

  return (
    <RestaurantProvider>
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
        <Route component={NotFound} />
      </Switch>
    </div>
    </RestaurantProvider>
  );
}