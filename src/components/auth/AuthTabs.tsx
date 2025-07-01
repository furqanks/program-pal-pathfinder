
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoginForm, LoginFormValues } from "./LoginForm";
import { SignupForm, SignupFormValues } from "./SignupForm";
import { useAuthHandlers } from "./AuthHandlers";

interface AuthTabsProps {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  loginFormRef: React.RefObject<{ setValue: (field: string, value: string) => void }>;
}

export function AuthTabs({ 
  isLoading, 
  setIsLoading,
  loginFormRef 
}: AuthTabsProps) {
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const [loginFormEmail, setLoginFormEmail] = useState("");

  const { handleLogin, handleSignup } = useAuthHandlers({
    setActiveTab,
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
    <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "login" | "signup")} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="login">Sign In</TabsTrigger>
        <TabsTrigger value="signup">Sign Up</TabsTrigger>
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
