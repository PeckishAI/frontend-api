import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
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
          <div className="flex gap-4 mb-6">
            <Button 
              variant="outline" 
              className="flex-1 justify-start border-2 border-[#44a991] focus:ring-0"
            >
              💳 Card
            </Button>
            <Button 
              variant="outline" 
              className="flex-1 justify-start"
            >
              🏦 US Bank Account
            </Button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="rounded-lg border p-4 bg-white shadow-sm">
              <CardElement
                options={{
                  style: {
                    base: {
                      fontSize: '16px',
                      color: '#424770',
                      '::placeholder': {
                        color: '#aab7c4',
                      },
                      iconColor: '#666EE8',
                    },
                    invalid: {
                      color: '#9e2146',
                    },
                  },
                }}
              />
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country
                </label>
                <Select defaultValue="US">
                  <SelectTrigger>
                    <SelectValue placeholder="Select a country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="US">United States</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Postal Code
                </label>
                <Input 
                  placeholder="Enter postal code"
                  className="w-full"
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-[#44a991] hover:bg-[#44a991]/90 text-white"
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
    mode: 'subscription' as const,
    amount: 2000,
    currency: 'usd',
    appearance: {
      theme: 'stripe' as const,
      variables: {
        colorPrimary: '#44a991',
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
