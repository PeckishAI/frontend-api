import { useState, useEffect } from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
  Elements,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

interface StripeCheckoutProps {
  amount: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

// Wrapper component that provides Stripe context
export function StripeCheckoutWrapper(props: StripeCheckoutProps) {
  const [clientSecret, setClientSecret] = useState("");

  useEffect(() => {
    // In a real app, you would make an API call to your backend to create a payment intent
    // For now, we'll simulate it with a mock client secret
    setClientSecret("mock_client_secret");
  }, []);

  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe',
    },
  };

  return clientSecret ? (
    <Elements stripe={stripePromise} options={options}>
      <StripeCheckout {...props} />
    </Elements>
  ) : (
    <div>Loading...</div>
  );
}

function StripeCheckout({ amount, onSuccess, onCancel }: StripeCheckoutProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success`,
        },
      });

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Payment Successful",
          description: "Your payment has been processed successfully.",
        });
        onSuccess?.();
      }
    } catch (err) {
      console.error("Payment error:", err);
      toast({
        title: "Payment Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Payment Details</h3>
            <p className="text-sm text-muted-foreground">
              Amount to pay: ${(amount / 100).toFixed(2)}
            </p>
          </div>

          <PaymentElement className="!stripe-element" />

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Processing..." : "Pay Now"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default StripeCheckoutWrapper;
