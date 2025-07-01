
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useCheckoutService } from "./CheckoutService";
import { SignupFormValues } from "./SignupForm";
import { supabase } from "@/integrations/supabase/client";

interface SignupHandlerProps {
  setActiveTab: (tab: "login" | "signup") => void;
  setLoginFormEmail: (email: string) => void;
}

export const useSignupHandler = ({ setActiveTab, setLoginFormEmail }: SignupHandlerProps) => {
  const { signUp } = useAuth();
  const { toast } = useToast();
  const { createCheckoutSession } = useCheckoutService();

  const handleSignup = async (values: SignupFormValues): Promise<void> => {
    try {
      console.log('Starting signup process for:', values.email);
      
      // First, check if user already exists by attempting to get recovery
      // This is a safer way to check existence without triggering signup
      const { error: recoveryError } = await supabase.auth.resetPasswordForEmail(values.email, {
        redirectTo: window.location.origin
      });
      
      // If no error on recovery request, user likely exists
      if (!recoveryError) {
        console.log('User already exists, showing error');
        toast({
          title: "Account already exists",
          description: "An account with this email already exists. Please sign in instead.",
          variant: "destructive",
        });
        setActiveTab("login");
        setLoginFormEmail(values.email);
        return;
      }
      
      // Now attempt actual signup
      const { error, data } = await signUp(values.email, values.password);
      
      if (error) {
        console.error('Signup error:', error);
        
        // Handle various error cases
        if (error.message.toLowerCase().includes('already') || 
            error.message.toLowerCase().includes('duplicate') ||
            error.message.toLowerCase().includes('exists')) {
          toast({
            title: "Account already exists",
            description: "An account with this email already exists. Please sign in instead.",
            variant: "destructive",
          });
          setActiveTab("login");
          setLoginFormEmail(values.email);
          return;
        }
        
        toast({
          title: "Sign up failed",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      console.log('Signup successful, data:', data);
      
      // Handle successful signup
      if (data.session) {
        console.log('Session available immediately, creating checkout...');
        toast({
          title: "Account created successfully!",
          description: "Redirecting to checkout...",
        });
        
        setTimeout(async () => {
          const checkoutSuccess = await createCheckoutSession(data.session);
          if (!checkoutSuccess) {
            toast({
              title: "Account created",
              description: "Your account was created successfully. Please visit the pricing page to subscribe.",
            });
          }
        }, 1000);
      } else {
        toast({
          title: "Account created successfully!",
          description: "Please check your email to confirm your account, then return to complete your subscription.",
        });
      }
      
    } catch (error) {
      console.error('Unexpected signup error:', error);
      toast({
        title: "Sign up failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  return { handleSignup };
};
