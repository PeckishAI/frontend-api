import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface StripeConfigProps {
  onSetupComplete: (accountId: string) => void;
  onCancel: () => void;
}

export function StripeConfig({ onSetupComplete, onCancel }: StripeConfigProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleStripeConnect = async () => {
    setIsLoading(true);
    try {
      // Initialize Stripe with the publishable key
      const stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
      if (!stripe) {
        throw new Error("Failed to load Stripe");
      }

      // In a real application, you would:
      // 1. Call your backend to create a Stripe Connect account
      // 2. Redirect to Stripe Connect onboarding
      // 3. Handle the redirect back to your application
      
      // For now, we'll simulate a successful connection
      toast({
        title: "Stripe Connected",
        description: "Successfully connected to Stripe.",
      });
      
      // Pass a mock account ID back
      onSetupComplete("acct_mock123");
    } catch (error) {
      console.error("Stripe setup error:", error);
      toast({
        title: "Connection Failed",
        description: "Failed to connect to Stripe. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Connect with Stripe</h3>
        <p className="text-sm text-muted-foreground">
          Set up Stripe to accept payments for this restaurant.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Button
          onClick={handleStripeConnect}
          disabled={isLoading}
          className="bg-[#635BFF] hover:bg-[#635BFF]/90"
        >
          {isLoading ? "Connecting..." : "Connect with Stripe"}
        </Button>
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
