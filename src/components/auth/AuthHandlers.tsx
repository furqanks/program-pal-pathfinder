
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useCheckoutService } from "./CheckoutService";
import { LoginFormValues } from "./LoginForm";
import { SignupFormValues } from "./SignupForm";
import { supabase } from "@/integrations/supabase/client";

interface AuthHandlersProps {
  setActiveTab: (tab: "login" | "signup") => void;
  setLoginFormEmail: (email: string) => void;
}

export const useAuthHandlers = ({ setActiveTab, setLoginFormEmail }: AuthHandlersProps) => {
  const { signIn, signUp, session } = useAuth();
  const { toast } = useToast();
  const { createCheckoutSession } = useCheckoutService();

  const checkIfUserExists = async (email: string): Promise<boolean> => {
    try {
      // Try to trigger a password reset to see if user exists
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth`,
      });
      
      // If no error, user exists (Supabase sent reset email)
      // If error contains "User not found", user doesn't exist
      if (error && error.message.toLowerCase().includes('user not found')) {
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error checking if user exists:', error);
      // If we can't check, assume user doesn't exist to allow signup attempt
      return false;
    }
  };

  const handleLogin = async (values: LoginFormValues) => {
    try {
      const { error } = await signIn(values.email, values.password);
      if (error) {
        toast({
          title: "Login failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Login successful",
          description: "Welcome back!",
        });
      }
    } catch (error) {
      toast({
        title: "Login failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSignup = async (values: SignupFormValues) => {
    try {
      console.log('Starting signup process for:', values.email);
      
      // First check if user already exists
      const userExists = await checkIfUserExists(values.email);
      if (userExists) {
        console.log('User already exists, redirecting to login');
        toast({
          title: "Account already exists",
          description: "An account with this email already exists. Please sign in instead.",
          variant: "destructive",
        });
        setActiveTab("login");
        setLoginFormEmail(values.email);
        return;
      }
      
      const { error, data } = await signUp(values.email, values.password);
      
      if (error) {
        console.error('Signup error:', error);
        
        // Handle all possible duplicate user error messages
        const errorMessage = error.message.toLowerCase();
        const isDuplicateError = 
          errorMessage.includes('user already registered') || 
          errorMessage.includes('already registered') ||
          errorMessage.includes('duplicate') ||
          errorMessage.includes('already exists') ||
          errorMessage.includes('email already in use') ||
          errorMessage.includes('user already exists') ||
          errorMessage.includes('email address already in use');
        
        if (isDuplicateError) {
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

      // Check if signup was successful but user already existed
      if (!error && data && !data.user) {
        console.log('Signup response indicates existing user, data:', data);
        toast({
          title: "Account already exists",
          description: "An account with this email already exists. Please sign in instead.",
          variant: "destructive",
        });
        setActiveTab("login");
        setLoginFormEmail(values.email);
        return;
      }

      // Check if user exists but email confirmation is pending for existing user
      if (data.user && !data.session && data.user.email_confirmed_at) {
        console.log('User exists with confirmed email but no session, likely duplicate signup');
        toast({
          title: "Account already exists",
          description: "An account with this email already exists. Please sign in instead.",
          variant: "destructive",
        });
        setActiveTab("login");
        setLoginFormEmail(values.email);
        return;
      }

      console.log('Signup successful, data:', data);
      
      // If we have a session immediately after signup, create checkout
      if (data.session) {
        console.log('Session available immediately, creating checkout...');
        toast({
          title: "Account created successfully!",
          description: "Redirecting to checkout...",
        });
        
        // Wait a moment for auth context to update
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
        // No immediate session - likely email confirmation required
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

  return { handleLogin, handleSignup };
};
