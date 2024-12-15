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
import styles from "./Checkout.module.css";
import { cn } from "@/lib/utils";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

interface CheckoutFormProps {
  className?: string;
}

function CheckoutForm({ className }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [activeMethod, setActiveMethod] = useState<'card' | 'bank'>('card');

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
    <div className={cn(styles.checkoutContainer, className)}>
      <div className={styles.formContainer}>
        <div className={styles.formSection}>
          <div className={styles.paymentMethodsContainer}>
            <Button 
              variant="outline" 
              className={cn(
                styles.paymentMethod,
                activeMethod === 'card' && styles.paymentMethodActive
              )}
              onClick={() => setActiveMethod('card')}
            >
              💳 Card
            </Button>
            <Button 
              variant="outline" 
              className={cn(
                styles.paymentMethod,
                activeMethod === 'bank' && styles.paymentMethodActive
              )}
              onClick={() => setActiveMethod('bank')}
            >
              🏦 US Bank Account
            </Button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className={styles.cardElementContainer}>
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

            <div className={styles.formGrid}>
              <div className={styles.formField}>
                <label className={styles.label}>
                  Country
                </label>
                <Select defaultValue="US">
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="US">United States</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className={styles.formField}>
                <label className={styles.label}>
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
              className={cn("text-white", styles.subscribeButton)}
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

interface CheckoutPageProps {
  className?: string;
}

export default function CheckoutPage({ className }: CheckoutPageProps) {
  const options = {
    mode: 'subscription' as const,
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
      <CheckoutForm className={className} />
    </Elements>
  );
}
