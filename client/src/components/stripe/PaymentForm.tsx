import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { cn } from "@/lib/utils";
import styles from "./PaymentForm.module.css";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

interface PaymentFormProps {
  className?: string;
}

function PaymentForm({ className }: PaymentFormProps) {
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
      const { error: submitError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success`,
        },
      });

      if (submitError) {
        setError(submitError.message ?? "Payment failed");
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={cn(styles.form, className)}>
      <div className={styles.paymentElement}>
        <PaymentElement 
          options={{
            layout: {
              type: 'tabs',
              defaultCollapsed: false,
            },
            fields: {
              billingDetails: {
                name: 'auto',
                email: 'auto',
              },
            },
            wallets: {
              applePay: 'auto',
              googlePay: 'auto',
            },
          }}
        />
      </div>
      
      {error && (
        <div className={styles.errorMessage}>
          {error}
        </div>
      )}

      <button 
        disabled={!stripe || isLoading}
        className={styles.submitButton}
      >
        {isLoading ? "Processing..." : "Subscribe"}
      </button>
    </form>
  );
}

export function StripePaymentForm() {
  const options = {
    mode: 'subscription' as const,
    amount: 2000,
    currency: 'usd',
    appearance: {
      theme: 'stripe' as const,
      labels: 'floating',
      variables: {
        fontFamily: 'system-ui, sans-serif',
        fontWeightNormal: '400',
        borderRadius: '4px',
        colorBackground: '#ffffff',
        colorPrimary: '#635BFF',
        colorPrimaryText: '#ffffff',
        colorText: '#30313d',
        colorTextSecondary: '#6b7294',
        colorTextPlaceholder: '#6b7294',
        colorIconTab: '#6b7294',
        colorLogo: '#635BFF'
      }
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <Elements stripe={stripePromise} options={options}>
          <PaymentForm />
        </Elements>
      </div>
    </div>
  );
}
