
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { LoginFormValues } from "./LoginForm";
import { SignupFormValues } from "./SignupForm";
import { useSignupHandler } from "./SignupHandler";

interface AuthHandlersProps {
  setActiveTab: (tab: "login" | "signup") => void;
  setLoginFormEmail: (email: string) => void;
}

export const useAuthHandlers = ({ setActiveTab, setLoginFormEmail }: AuthHandlersProps) => {
  const { signIn } = useAuth();
  const { toast } = useToast();
  const { handleSignup } = useSignupHandler({ setActiveTab, setLoginFormEmail });

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

  return { handleLogin, handleSignup };
};
