
import { useState } from "react";
import { LoginForm, LoginFormValues } from "./LoginForm";
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
  const [loginFormEmail, setLoginFormEmail] = useState("");

  const { handleLogin } = useAuthHandlers({
    setActiveTab: () => {}, // No longer needed since we only have login
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

  return (
    <div className="space-y-4">
      <LoginForm onSubmit={onLoginSubmit} isLoading={isLoading} />
    </div>
  );
}
