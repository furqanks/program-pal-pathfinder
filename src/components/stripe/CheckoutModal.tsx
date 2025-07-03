import React, { useState } from 'react';
import { PaymentElement, useStripe, useElements, Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Check } from 'lucide-react';

const stripePromise = loadStripe('pk_live_51OeZZJICp0rgVBLwFZiODSU908fAdNFf4zQj19u2ERW58Ik0SZrnC2MpK7FjqR0eQhFpXh1OK6bccxCXz677UuL100GtcHh1bP');

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

// Payment form component that uses Stripe hooks
function PaymentForm({ onSuccess, onClose }: { onSuccess?: () => void; onClose: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const { user, checkSubscription } = useAuth();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [paymentSucceeded, setPaymentSucceeded] = useState(false);

  // Handle form submission
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success`,
        },
        redirect: 'if_required',
      });

      if (error) {
        console.error('Payment failed:', error);
        toast({
          title: "Payment failed",
          description: error.message || "An error occurred during payment.",
          variant: "destructive",
        });
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        console.log('Payment succeeded:', paymentIntent);
        setPaymentSucceeded(true);
        
        // Refresh subscription status
        await checkSubscription();
        
        toast({
          title: "Payment successful!",
          description: "Welcome to UniApp Space Premium!",
        });

        // Call success callback after a short delay
        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 2000);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Payment failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (paymentSucceeded) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <div className="rounded-full bg-green-100 p-3 mb-4">
          <Check className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Payment Successful!
        </h3>
        <p className="text-gray-600 text-center">
          Redirecting you to your dashboard...
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium">UniApp Space Premium</span>
            <span className="font-bold">$9.99/month</span>
          </div>
          <p className="text-sm text-gray-600">
            Unlimited AI document reviews, advanced program search, and priority support
          </p>
        </div>

        <PaymentElement 
          options={{
            layout: "tabs",
            defaultValues: {
              billingDetails: {
                email: user?.email || '',
              },
            },
          }}
        />
      </div>

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isLoading}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!stripe || !elements || isLoading}
          className="flex-1"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            "Subscribe Now"
          )}
        </Button>
      </div>
    </form>
  );
}

export function CheckoutModal({ isOpen, onClose, onSuccess }: CheckoutModalProps) {
  const { user, session } = useAuth();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isSetupComplete, setIsSetupComplete] = useState(false);

  // Initialize payment intent when modal opens
  const handleInitializePayment = async () => {
    if (!user || !session || clientSecret) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-subscription', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        // Handle specific error cases
        if (error.message?.includes('already have an active subscription')) {
          toast({
            title: "Subscription Already Active",
            description: "You already have an active subscription. Please check your account.",
            variant: "destructive",
          });
          onClose();
          return;
        }
        throw new Error(error.message);
      }

      setClientSecret(data.client_secret);
      setIsSetupComplete(true);
    } catch (error) {
      console.error('Error initializing payment:', error);
      toast({
        title: "Error",
        description: "Failed to initialize payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize payment when modal opens
  React.useEffect(() => {
    if (isOpen && !clientSecret && !isSetupComplete) {
      handleInitializePayment();
    }
  }, [isOpen]);

  const handleClose = () => {
    if (!isLoading) {
      onClose();
      // Reset state when closing
      setTimeout(() => {
        setClientSecret(null);
        setIsSetupComplete(false);
      }, 300);
    }
  };

  const elementsOptions = {
    clientSecret,
    appearance: {
      theme: 'stripe' as const,
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
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Complete Your Subscription</DialogTitle>
          <DialogDescription>
            Secure payment powered by Stripe. Your payment information is encrypted and secure.
          </DialogDescription>
        </DialogHeader>

        {!isSetupComplete ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Setting up secure payment...</span>
          </div>
        ) : clientSecret ? (
          <Elements stripe={stripePromise} options={elementsOptions}>
            <PaymentForm onSuccess={onSuccess} onClose={onClose} />
          </Elements>
        ) : (
          <div className="flex items-center justify-center py-8">
            <p className="text-gray-600">Failed to initialize payment. Please try again.</p>
          </div>
        )}

        <div className="text-xs text-gray-500 text-center mt-4">
          <p>🔒 Secured by Stripe • Cancel anytime</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}