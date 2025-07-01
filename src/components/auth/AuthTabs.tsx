
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoginForm, LoginFormValues } from "./LoginForm";
import { SignupForm, SignupFormValues } from "./SignupForm";
import { useAuthHandlers } from "./AuthHandlers";

interface AuthTabsProps {
  activeTab: "login" | "signup";
  onTabChange: (tab: "login" | "signup") => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  loginFormRef: React.RefObject<{ setValue: (field: string, value: string) => void }>;
}

export function AuthTabs({ 
  activeTab, 
  onTabChange, 
  isLoading, 
  setIsLoading,
  loginFormRef 
}: AuthTabsProps) {
  const [loginFormEmail, setLoginFormEmail] = useState("");

  const { handleLogin, handleSignup } = useAuthHandlers({
    setActiveTab: onTabChange,
    setLoginFormEmail: (email: string) => {
      setLoginFormEmail(email);
      // Update the login form email field
      if (loginFormRef.current) {
        loginFormRef.current.setValue("email", email);
      }
    }
  });

  const onLoginSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);
    try {
      await handleLogin(values);
    } finally {
      setIsLoading(false);
    }
  };

  const onSignupSubmit = async (values: SignupFormValues) => {
    setIsLoading(true);
    try {
      await handleSignup(values);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Tabs value={activeTab} onValueChange={(value) => onTabChange(value as "login" | "signup")}>
      <TabsList className="grid w-full grid-cols-2 mb-6 bg-gray-100">
        <TabsTrigger value="login" className="data-[state=active]:bg-white">Sign In</TabsTrigger>
        <TabsTrigger value="signup" className="data-[state=active]:bg-white">Create Account</TabsTrigger>
      </TabsList>
      
      <TabsContent value="login" className="space-y-4">
        <LoginForm onSubmit={onLoginSubmit} isLoading={isLoading} />
      </TabsContent>
      
      <TabsContent value="signup" className="space-y-4">
        <SignupForm onSubmit={onSignupSubmit} isLoading={isLoading} />
      </TabsContent>
    </Tabs>
  );
}
