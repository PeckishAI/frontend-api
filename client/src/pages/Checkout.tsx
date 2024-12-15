import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Initialize Stripe with your publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { error: submitError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success`,
        },
      });

      if (submitError) {
        setError(submitError.message ?? "An error occurred");
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      {error && (
        <div className="text-sm text-red-500">
          {error}
        </div>
      )}
      <button
        disabled={!stripe || isLoading}
        className="w-full py-2 px-4 bg-[#635BFF] text-white rounded-md hover:bg-[#635BFF]/90 disabled:opacity-50"
      >
        {isLoading ? "Processing..." : "Pay now"}
      </button>
    </form>
  );
}

export default function Checkout() {
  const [clientSecret] = useState("test_secret"); // In a real app, this would come from your server

  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe' as const,
    },
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Complete your payment</CardTitle>
        </CardHeader>
        <CardContent>
          <Elements stripe={stripePromise} options={options}>
            <CheckoutForm />
          </Elements>
        </CardContent>
      </Card>
    </div>
  );
}