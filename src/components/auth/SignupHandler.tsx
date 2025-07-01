
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useCheckoutService } from "./CheckoutService";
import { SignupFormValues } from "./SignupForm";

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
      console.log('=== SIGNUP ATTEMPT START ===');
      console.log('Email:', values.email);
      
      // Direct signup attempt - let Supabase handle all validation
      const { error, data } = await signUp(values.email, values.password);
      
      if (error) {
        console.log('=== SIGNUP ERROR ===');
        console.log('Error message:', error.message);
        console.log('Error details:', error);
        
        // Handle specific error cases with user-friendly messages
        if (error.message.toLowerCase().includes('already registered') || 
            error.message.toLowerCase().includes('already been registered') ||
            error.message.toLowerCase().includes('user already registered')) {
          console.log('Detected existing user error - redirecting to login');
          toast({
            title: "Account already exists",
            description: "An account with this email already exists. Please sign in instead.",
            variant: "destructive",
          });
          setActiveTab("login");
          setLoginFormEmail(values.email);
          return;
        }
        
        if (error.message.toLowerCase().includes('email rate limit')) {
          toast({
            title: "Too many attempts",
            description: "Please wait a moment before trying again.",
            variant: "destructive",
          });
          return;
        }
        
        // Generic error handling
        toast({
          title: "Sign up failed",
          description: error.message || "An error occurred during sign up. Please try again.",
          variant: "destructive",
        });
        return;
      }

      console.log('=== SIGNUP SUCCESS ===');
      console.log('User created:', !!data.user);
      console.log('Session available:', !!data.session);
      console.log('User email confirmed:', data.user?.email_confirmed_at ? 'Yes' : 'No');
      
      // Handle successful signup
      if (data.session) {
        console.log('Session available immediately - user confirmed');
        toast({
          title: "Account created successfully!",
          description: "Redirecting to checkout...",
        });
        
        // Small delay to let user see the success message
        setTimeout(async () => {
          const checkoutSuccess = await createCheckoutSession(data.session);
          if (!checkoutSuccess) {
            toast({
              title: "Account created",
              description: "Your account was created successfully. Please visit the pricing page to subscribe.",
            });
          }
        }, 1000);
      } else if (data.user) {
        console.log('User created but needs email confirmation');
        toast({
          title: "Account created successfully!",
          description: "Please check your email to confirm your account, then return to complete your subscription.",
        });
      } else {
        console.log('Unexpected: No user or session in response');
        toast({
          title: "Sign up completed",
          description: "Please check your email for further instructions.",
        });
      }
      
    } catch (error) {
      console.log('=== SIGNUP UNEXPECTED ERROR ===');
      console.error('Unexpected signup error:', error);
      toast({
        title: "Sign up failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      console.log('=== SIGNUP ATTEMPT END ===');
    }
  };

  return { handleSignup };
};
