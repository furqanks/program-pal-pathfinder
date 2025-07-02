import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe with your publishable key
// Using test key for now - replace with your actual Stripe publishable key
const STRIPE_PUBLISHABLE_KEY = 'pk_test_51QYMiCRuLzJnfzJBGBg2JNqQDYHobIcCo0hWrFwzfSRN2sUKgfZsEDEKGbJZeZnBfZKaZIlbV5VzZiGbEJVBHyWQ00ZYgZqZYZ';

const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

interface StripeProviderProps {
  children: React.ReactNode;
}

export function StripeProvider({ children }: StripeProviderProps) {
  return (
    <Elements 
      stripe={stripePromise}
      options={{
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: 'hsl(var(--primary))',
            colorBackground: 'hsl(var(--background))',
            colorText: 'hsl(var(--foreground))',
            colorDanger: 'hsl(var(--destructive))',
            fontFamily: 'system-ui, sans-serif',
            spacingUnit: '4px',
            borderRadius: '6px',
          },
        },
      }}
    >
      {children}
    </Elements>
  );
}