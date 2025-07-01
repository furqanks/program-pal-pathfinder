
import { useState, useEffect } from "react";
import { Navigate, useLocation, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

const signupSchema = loginSchema;

type LoginFormValues = z.infer<typeof loginSchema>;
type SignupFormValues = z.infer<typeof signupSchema>;

export default function Auth() {
  const { user, signIn, signUp, loading: authLoading, session } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const [searchParams] = useSearchParams();
  const location = useLocation();

  // Check for redirect parameter
  const redirectParam = searchParams.get("redirect");
  
  useEffect(() => {
    // If redirect is "pricing", default to signup tab
    if (redirectParam === "pricing") {
      setActiveTab("signup");
    }
  }, [redirectParam]);

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const signupForm = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleLogin = async (values: LoginFormValues) => {
    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  const createCheckoutSession = async () => {
    try {
      console.log('Creating checkout session...');
      
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      if (error) {
        console.error('Checkout creation error:', error);
        throw new Error(error.message || 'Failed to create checkout session');
      }

      if (!data?.url) {
        throw new Error('No checkout URL received');
      }

      console.log('Checkout session created, redirecting to:', data.url);
      
      // Open Stripe checkout in new tab
      window.open(data.url, '_blank');
      
      toast({
        title: "Redirecting to checkout",
        description: "A new tab has opened with your subscription checkout. Complete your payment to access premium features.",
      });

      return true;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast({
        title: "Checkout Error",
        description: error instanceof Error ? error.message : "Failed to create checkout session. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const handleSignup = async (values: SignupFormValues) => {
    setIsLoading(true);
    
    try {
      console.log('Starting signup process for:', values.email);
      
      const { error, data } = await signUp(values.email, values.password);
      
      if (error) {
        console.error('Signup error:', error);
        
        // Handle specific error cases
        if (error.message.includes('User already registered') || 
            error.message.includes('already registered') ||
            error.message.includes('duplicate') ||
            error.message.includes('already exists')) {
          toast({
            title: "Account already exists",
            description: "An account with this email already exists. Please sign in instead.",
            variant: "destructive",
          });
          setActiveTab("login");
          loginForm.setValue("email", values.email);
          return;
        }
        
        toast({
          title: "Sign up failed",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      // Additional check: If we get a response but no user was created (duplicate case)
      if (!error && data && !data.user) {
        console.log('Signup response indicates existing user, data:', data);
        toast({
          title: "Account already exists",
          description: "An account with this email already exists. Please sign in instead.",
          variant: "destructive",
        });
        setActiveTab("login");
        loginForm.setValue("email", values.email);
        return;
      }

      // Another check: If user exists but session is null (email confirmation pending for existing user)
      if (data.user && !data.session && data.user.email_confirmed_at) {
        console.log('User exists with confirmed email but no session, likely duplicate signup');
        toast({
          title: "Account already exists",
          description: "An account with this email already exists. Please sign in instead.",
          variant: "destructive",
        });
        setActiveTab("login");
        loginForm.setValue("email", values.email);
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
          const checkoutSuccess = await createCheckoutSession();
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
    } finally {
      setIsLoading(false);
    }
  };

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
              {redirectParam === "pricing" ? "Get Started" : "Welcome Back"}
            </CardTitle>
            <CardDescription className="text-gray-600 text-base">
              {redirectParam === "pricing" 
                ? "Create your account to unlock premium features" 
                : "Sign in to continue your university application journey"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "login" | "signup")}>
              <TabsList className="grid w-full grid-cols-2 mb-6 bg-gray-100">
                <TabsTrigger value="login" className="data-[state=active]:bg-white">Sign In</TabsTrigger>
                <TabsTrigger value="signup" className="data-[state=active]:bg-white">Create Account</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login" className="space-y-4">
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700">Email Address</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter your email" 
                              className="h-11 border-gray-300 focus:border-gray-900"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700">Password</FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder="Enter your password" 
                              className="h-11 border-gray-300 focus:border-gray-900"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="submit" 
                      className="w-full h-11 bg-gray-900 hover:bg-gray-800 text-white font-medium" 
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Signing in...
                        </>
                      ) : (
                        "Sign In"
                      )}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
              
              <TabsContent value="signup" className="space-y-4">
                <Form {...signupForm}>
                  <form onSubmit={signupForm.handleSubmit(handleSignup)} className="space-y-4">
                    <FormField
                      control={signupForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700">Email Address</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter your email" 
                              className="h-11 border-gray-300 focus:border-gray-900"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={signupForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700">Password</FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder="Create a password (min. 6 characters)" 
                              className="h-11 border-gray-300 focus:border-gray-900"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="submit" 
                      className="w-full h-11 bg-gray-900 hover:bg-gray-800 text-white font-medium" 
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating account...
                        </>
                      ) : (
                        "Create Account & Subscribe"
                      )}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-center pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-600">
              {activeTab === "login" ? (
                <>
                  Don't have an account?{" "}
                  <Button 
                    variant="link" 
                    className="p-0 h-auto text-gray-900 font-medium" 
                    onClick={() => setActiveTab("signup")}
                  >
                    Create one here
                  </Button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <Button 
                    variant="link" 
                    className="p-0 h-auto text-gray-900 font-medium" 
                    onClick={() => setActiveTab("login")}
                  >
                    Sign in
                  </Button>
                </>
              )}
            </p>
          </CardFooter>
        </Card>

        {redirectParam === "pricing" && (
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              After creating your account, you'll be redirected to complete your subscription
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
