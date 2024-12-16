import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!stripe || !elements) return;

    setIsLoading(true);
    setError(null);

    try {
      const { error: paymentError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success`,
        },
      });

      if (paymentError) {
        setError(paymentError.message || "An error occurred");
        console.error("Payment error:", paymentError);
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error("Unexpected error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Complete your payment</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <PaymentElement
                options={{
                  layout: "tabs",
                }}
              />
              
              {error && (
                <div className="text-sm text-red-500">
                  {error}
                </div>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={!stripe || isLoading}
            >
              {isLoading ? "Processing..." : "Pay now"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function Checkout() {
  const options = {
    mode: 'payment' as const,
    amount: 2000,
    currency: 'usd',
    appearance: {
      theme: 'stripe' as const,
      labels: 'floating',
      variables: {
        colorPrimary: '#0570de',
        fontFamily: 'system-ui, sans-serif',
        borderRadius: '4px',
        colorBackground: '#ffffff',
      },
    },
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      <CheckoutForm />
    </Elements>
  );
}
