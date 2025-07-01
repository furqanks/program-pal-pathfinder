
import { useState, useEffect, useRef } from "react";
import { Navigate, useLocation, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { AuthTabs } from "@/components/auth/AuthTabs";

export default function Auth() {
  const { user, loading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const loginFormRef = useRef<{ setValue: (field: string, value: string) => void }>(null);

  // Check for redirect parameter
  const redirectParam = searchParams.get("redirect");

  // Enhanced redirect logic for authenticated users
  if (user && !authLoading) {
    if (redirectParam === "pricing") {
      return <Navigate to="/pricing" replace />;
    }
    const from = location.state?.from?.pathname || "/";
    return <Navigate to={from} replace />;
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="w-full max-w-md">
        {/* Back button */}
        <div className="mb-6">
          <Link to="/home">
            <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>

        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="h-8 w-8 bg-black rounded"></div>
            <h1 className="text-3xl font-bold text-gray-900">UniApp Space</h1>
          </div>
          <p className="text-gray-600 text-lg">Your AI-powered university application assistant</p>
        </div>

        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl text-gray-900">
              Welcome to UniApp Space
            </CardTitle>
            <CardDescription className="text-gray-600 text-base">
              Sign in to your account or create a new one to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AuthTabs
              isLoading={isLoading}
              setIsLoading={setIsLoading}
              loginFormRef={loginFormRef}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
