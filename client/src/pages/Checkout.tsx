import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

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
        setError(submitError.message ?? "An error occurred with the payment");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error("Payment error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
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
      
      {error && (
        <div style={{ color: '#df1b41', marginTop: '8px', fontSize: '14px' }}>
          {error}
        </div>
      )}

      <button 
        disabled={!stripe || isLoading}
        style={{
          backgroundColor: '#635BFF',
          padding: '8px 16px',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          fontSize: '16px',
          cursor: 'pointer',
          width: '100%',
          marginTop: '16px',
        }}
      >
        {isLoading ? "Processing..." : "Subscribe"}
      </button>
    </form>
  );
}

export default function CheckoutPage() {
  const options = {
    mode: 'subscription' as const,
    amount: 2000, // $20.00
    currency: 'usd',
    appearance: {
      theme: 'stripe',
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
    },
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      backgroundColor: '#f5f5f5'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '500px',
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
      }}>
        <Elements stripe={stripePromise} options={options}>
          <CheckoutForm />
        </Elements>
      </div>
    </div>
  );
}
