import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!stripe || !elements) return;

    setIsLoading(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success`,
        },
      });

      if (error) {
        console.error("Payment error:", error);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="ml-64 p-8">
      <div className="max-w-md mx-auto">
        <div className="mb-6">
          <div className="flex gap-2 mb-4">
            <Button 
              variant="outline" 
              className="flex-1 justify-start border-2 border-primary"
            >
              Card
            </Button>
            <Button 
              variant="outline" 
              className="flex-1 justify-start"
            >
              US Bank Account
            </Button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <PaymentElement
                options={{
                  layout: {
                    type: 'tabs',
                    defaultCollapsed: false,
                  },
                  fields: {
                    billingDetails: 'never'
                  }
                }}
              />
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-600">Country</label>
                <Select defaultValue="US">
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="US">United States</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-gray-600">Postal Code</label>
                <Input placeholder="Enter postal code" />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-[#44a991] hover:bg-[#44a991]/90"
              disabled={!stripe || isLoading}
            >
              {isLoading ? "Processing..." : "Subscribe"}
            </Button>
          </form>
        </div>
      </div>
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
      variables: {
        colorPrimary: '#44a991',
      },
    },
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      <CheckoutForm />
    </Elements>
  );
}
