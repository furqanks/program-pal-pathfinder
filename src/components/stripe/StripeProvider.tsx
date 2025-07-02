import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe with your publishable key
const STRIPE_PUBLISHABLE_KEY = 'pk_live_51OeZZJICp0rgVBLwFZiODSU908fAdNFf4zQj19u2ERW58Ik0SZrnC2MpK7FjqR0eQhFpXh1OK6bccxCXz677UuL100GtcHh1bP';

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