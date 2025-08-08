import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { LoginFormValues } from "./LoginForm";
import { SignupFormValues } from "./SignupForm";
import { useNavigate } from "react-router-dom";

interface AuthHandlersProps {
  setActiveTab: (tab: "login" | "signup") => void;
  setLoginFormEmail: (email: string) => void;
}

export const useAuthHandlers = ({ setActiveTab, setLoginFormEmail }: AuthHandlersProps) => {
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

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
        } else if (
          error.message.toLowerCase().includes('requested path is invalid') ||
          error.message.toLowerCase().includes('redirect')
        ) {
          toast({
            title: "Auth redirect not allowed",
            description: `Add ${window.location.origin} to Supabase Auth URL Configuration (Site URL and Redirect URLs).`,
            variant: "destructive",
          });
          navigate("/auth?redirectIssue=1");
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

  const handleSignup = async (values: SignupFormValues) => {
    try {
      console.log('=== SIGNUP ATTEMPT START ===');
      console.log('Email:', values.email);
      
      const { error, data } = await signUp(values.email, values.password);
      
      if (error) {
        console.log('=== SIGNUP ERROR ===');
        console.log('Error message:', error.message);
        
        // Handle specific signup errors
        if (error.message.toLowerCase().includes('user already registered')) {
          toast({
            title: "Account already exists",
            description: "An account with this email already exists. Please try logging in instead.",
            variant: "destructive",
          });
          // Switch to login tab and pre-fill email
          setLoginFormEmail(values.email);
          setActiveTab("login");
        } else if (error.message.toLowerCase().includes('password')) {
          toast({
            title: "Signup failed",
            description: "Password requirements not met. Please ensure your password is at least 6 characters long.",
            variant: "destructive",
          });
        } else if (
          error.message.toLowerCase().includes('requested path is invalid') ||
          error.message.toLowerCase().includes('redirect')
        ) {
          toast({
            title: "Signup failed: redirect not allowed",
            description: `Add ${window.location.origin} to Supabase Auth URL Configuration (Site URL and Redirect URLs).`,
            variant: "destructive",
          });
          navigate("/auth?redirectIssue=1");
        } else {
          toast({
            title: "Signup failed",
            description: error.message || "An error occurred during signup. Please try again.",
            variant: "destructive",
          });
        }
      } else {
        // Check if user was actually created
        if (data?.user && !data.user.email_confirmed_at) {
          // New user created, needs email confirmation
          console.log('=== SIGNUP SUCCESS - EMAIL CONFIRMATION NEEDED ===');
          toast({
            title: "Account created successfully!",
            description: "Please check your email and click the confirmation link. Redirecting to pricing...",
          });
          
          // Redirect to pricing even for email confirmation
          setTimeout(() => {
            navigate("/pricing");
          }, 2000);
        } else if (data?.user && data.user.email_confirmed_at) {
          // User was created and confirmed (shouldn't happen in normal flow)
          console.log('=== SIGNUP SUCCESS - USER CONFIRMED ===');
          toast({
            title: "Account created successfully!",
            description: "Welcome to Heygrad! Redirecting to pricing...",
          });
          
          setTimeout(() => {
            navigate("/pricing");
          }, 1000);
        } else {
          // No user returned - likely existing user
          console.log('=== SIGNUP - USER ALREADY EXISTS ===');
          toast({
            title: "Account already exists",
            description: "An account with this email already exists. Please try logging in instead.",
            variant: "destructive",
          });
          // Switch to login tab and pre-fill email
          setLoginFormEmail(values.email);
          setActiveTab("login");
        }
      }
    } catch (error) {
      console.log('=== SIGNUP UNEXPECTED ERROR ===');
      console.error('Unexpected signup error:', error);
      toast({
        title: "Signup failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      console.log('=== SIGNUP ATTEMPT END ===');
    }
  };

  return { handleLogin, handleSignup };
};
