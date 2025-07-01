
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useCheckoutService = () => {
  const { toast } = useToast();

  const createCheckoutSession = async (session: Session | null) => {
    try {
      console.log('=== CHECKOUT SESSION START ===');
      console.log('Session available:', !!session);
      
      if (!session) {
        console.log('No session available for checkout');
        return false;
      }
      
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      if (error) {
        console.log('=== CHECKOUT ERROR ===');
        console.error('Checkout creation error:', error);
        throw new Error(error.message || 'Failed to create checkout session');
      }

      if (!data?.url) {
        console.log('No checkout URL received');
        throw new Error('No checkout URL received');
      }

      console.log('=== CHECKOUT SUCCESS ===');
      console.log('Checkout URL created, opening new tab');
      
      // Open Stripe checkout in new tab
      window.open(data.url, '_blank');
      
      toast({
        title: "Redirecting to checkout",
        description: "A new tab has opened with your subscription checkout. Complete your payment to access premium features.",
      });

      return true;
    } catch (error) {
      console.log('=== CHECKOUT UNEXPECTED ERROR ===');
      console.error('Error creating checkout session:', error);
      toast({
        title: "Checkout Error",
        description: error instanceof Error ? error.message : "Failed to create checkout session. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      console.log('=== CHECKOUT SESSION END ===');
    }
  };

  return { createCheckoutSession };
};
