
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

const Pricing = () => {
  const navigate = useNavigate();
  const { user, session, subscription, checkSubscription } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    if (!user || !session) {
      navigate("/auth?redirect=pricing");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to create checkout session. Please try again.",
          variant: "destructive",
        });
        return;
      }

      window.open(data.url, '_blank');
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    if (!session) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to open customer portal. Please try again.",
          variant: "destructive",
        });
        return;
      }

      window.open(data.url, '_blank');
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const features = [
    "Unlimited document editing and feedback",
    "AI-powered essay improvements",
    "Program search and tracking",
    "Smart reminders and deadlines",
    "Notes organization with AI insights",
    "Priority email support"
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Link to="/home">
            <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4 text-gray-900">Choose Your Plan</h1>
          <p className="text-lg text-gray-600">
            Get unlimited access to all UniApp Space features
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
          {/* Free Demo Card */}
          <Card className="border-gray-200 bg-white">
            <CardHeader>
              <CardTitle className="text-xl text-gray-900">Free Demo</CardTitle>
              <CardDescription className="text-gray-600">
                Try our CV editing feature
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-6 text-gray-900">
                $0
                <span className="text-base font-normal text-gray-600">/forever</span>
              </div>
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-gray-900" />
                  <span className="text-gray-700">1 CV document edit</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-gray-900" />
                  <span className="text-gray-700">Basic AI feedback</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-gray-900" />
                  <span className="text-gray-700">No account required</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                variant="outline"
                onClick={() => window.location.href = '/documents'}
              >
                Try Free Demo
              </Button>
            </CardFooter>
          </Card>

          {/* Premium Card */}
          <Card className="border-gray-900 bg-white relative">
            <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white">
              Most Popular
            </Badge>
            <CardHeader>
              <CardTitle className="text-xl text-gray-900">Premium</CardTitle>
              <CardDescription className="text-gray-600">
                Full access to all features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-6 text-gray-900">
                $9.99
                <span className="text-base font-normal text-gray-600">/month</span>
              </div>
              <ul className="space-y-3">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <Check className="h-4 w-4 text-gray-900" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              {subscription?.subscribed ? (
                <Button 
                  className="w-full bg-gray-900 hover:bg-gray-800" 
                  onClick={handleManageSubscription}
                  disabled={loading}
                >
                  Manage Subscription
                </Button>
              ) : (
                <Button 
                  className="w-full bg-gray-900 hover:bg-gray-800" 
                  onClick={handleSubscribe}
                  disabled={loading}
                >
                  {loading ? "Processing..." : user ? "Subscribe Now" : "Sign Up to Subscribe"}
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>

        {/* Subscription Status */}
        {user && subscription && (
          <div className="mt-12 text-center">
            <Card className="max-w-md mx-auto border-gray-200">
              <CardHeader>
                <CardTitle className="text-gray-900">Subscription Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-gray-700">
                    Status: <Badge variant={subscription.subscribed ? "default" : "secondary"} className="ml-2">
                      {subscription.subscribed ? "Active" : "Inactive"}
                    </Badge>
                  </p>
                  {subscription.subscription_tier && (
                    <p className="text-gray-700">Plan: {subscription.subscription_tier}</p>
                  )}
                  {subscription.subscription_end && (
                    <p className="text-gray-700">
                      Next billing: {new Date(subscription.subscription_end).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <Button 
                  variant="outline" 
                  className="mt-4 w-full"
                  onClick={checkSubscription}
                >
                  Refresh Status
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Pricing;
