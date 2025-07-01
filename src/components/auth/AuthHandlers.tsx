
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { LoginFormValues } from "./LoginForm";

interface AuthHandlersProps {
  setActiveTab: (tab: "login" | "signup") => void;
  setLoginFormEmail: (email: string) => void;
}

export const useAuthHandlers = ({ setActiveTab, setLoginFormEmail }: AuthHandlersProps) => {
  const { signIn } = useAuth();
  const { toast } = useToast();

  const handleLogin = async (values: LoginFormValues) => {
    try {
      console.log('=== LOGIN ATTEMPT START ===');
      console.log('Email:', values.email);
      
      const { error, data } = await signIn(values.email, values.password);
      
      if (error) {
        console.log('=== LOGIN ERROR ===');
        console.log('Error message:', error.message);
        
        // Provide specific error messages for common cases
        if (error.message.toLowerCase().includes('invalid login credentials')) {
          toast({
            title: "Login failed",
            description: "Invalid email or password. Please check your credentials and try again.",
            variant: "destructive",
          });
        } else if (error.message.toLowerCase().includes('email not confirmed')) {
          toast({
            title: "Email not confirmed",
            description: "Please check your email and click the confirmation link before signing in.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Login failed",
            description: error.message || "An error occurred during login. Please try again.",
            variant: "destructive",
          });
        }
      } else {
        console.log('=== LOGIN SUCCESS ===');
        toast({
          title: "Login successful",
          description: "Welcome back!",
        });
      }
    } catch (error) {
      console.log('=== LOGIN UNEXPECTED ERROR ===');
      console.error('Unexpected login error:', error);
      toast({
        title: "Login failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      console.log('=== LOGIN ATTEMPT END ===');
    }
  };

  return { handleLogin };
};
