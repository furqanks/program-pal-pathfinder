
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, ArrowLeft, Star, Zap, Shield, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { CheckoutModal } from "@/components/stripe/CheckoutModal";
import { EnhancedStripeAudit } from "@/components/stripe/EnhancedStripeAudit";

const Pricing = () => {
  const navigate = useNavigate();
  const { user, session, subscription, checkSubscription } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);

  const handleSubscribe = () => {
    if (!user) {
      navigate("/auth?redirect=pricing");
      return;
    }
    setCheckoutModalOpen(true);
  };

  const handleCheckoutSuccess = () => {
    // Refresh subscription status and show success message
    checkSubscription();
    navigate("/"); // Redirect to dashboard
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

  const premiumFeatures = [
    {
      icon: <Zap className="h-5 w-5" />,
      title: "Unlimited AI Document Reviews",
      description: "Get expert-level feedback on essays, SOPs, and all application documents"
    },
    {
      icon: <Star className="h-5 w-5" />,
      title: "Advanced Program Search",
      description: "Access our comprehensive database of universities worldwide"
    },
    {
      icon: <Shield className="h-5 w-5" />,
      title: "Smart Application Tracking",
      description: "Never miss deadlines with automated reminders and progress tracking"
    },
    {
      icon: <Users className="h-5 w-5" />,
      title: "Priority Support",
      description: "Get help from our expert team within 24 hours"
    }
  ];

  const freeFeatures = [
    "1 CV document review",
    "Basic AI feedback",
    "Sample program search",
    "Limited university database access"
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Link to="/home">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* Header Section */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-primary text-primary-foreground">Choose Your Plan</Badge>
          <h1 className="text-4xl font-bold mb-4 text-foreground">
            Unlock Your University Dreams
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that fits your needs and start your journey to top universities.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid lg:grid-cols-2 gap-8 mb-16">
          {/* Free Demo Card */}
          <Card className="border-gray-200 shadow-sm">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl text-gray-900 mb-2">Free Demo</CardTitle>
              <CardDescription className="text-gray-600">
                Experience our AI-powered document review
              </CardDescription>
              <div className="mt-4">
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  $0
                  <span className="text-base font-normal text-gray-600">/forever</span>
                </div>
                <p className="text-gray-600">Perfect for trying out our platform</p>
              </div>
            </CardHeader>
            <CardContent className="pb-6">
              <ul className="space-y-3">
                {freeFeatures.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-gray-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
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
          <Card className="border-gray-900 shadow-lg relative">
            <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white">
              Most Popular
            </Badge>
            <CardHeader className="text-center pb-6 pt-8">
              <CardTitle className="text-2xl text-gray-900 mb-2">Premium Plan</CardTitle>
              <CardDescription className="text-gray-600">
                Complete university application solution
              </CardDescription>
              <div className="mt-4">
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  $9.99
                  <span className="text-base font-normal text-gray-600">/month</span>
                </div>
                <p className="text-gray-600">Everything you need to succeed</p>
              </div>
            </CardHeader>
            <CardContent className="pb-6">
              <div className="space-y-4 mb-6">
                {premiumFeatures.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      {feature.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">{feature.title}</h4>
                      <p className="text-gray-600 text-sm">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Plus everything in Free:</h4>
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Check className="h-3 w-3" />
                    <span>CV reviews</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-3 w-3" />
                    <span>Basic AI feedback</span>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              {subscription?.subscribed ? (
                <Button 
                  className="w-full bg-gray-900 hover:bg-gray-800" 
                  onClick={handleManageSubscription}
                  disabled={loading}
                >
                  {loading ? "Loading..." : "Manage Subscription"}
                </Button>
              ) : (
                <Button 
                  className="w-full bg-gray-900 hover:bg-gray-800" 
                  onClick={handleSubscribe}
                  disabled={loading}
                >
                  {user ? "Subscribe Now" : "Sign Up to Subscribe"}
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>

        {/* Enhanced Stripe Audit Panel - Remove in production */}
        {user && (
          <div className="mb-16">
            <EnhancedStripeAudit />
          </div>
        )}

        {/* FAQ Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-center mb-8 text-gray-900">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <Card className="border-gray-200">
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-2">Can I cancel anytime?</h3>
                <p className="text-gray-600">Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your current billing period.</p>
              </CardContent>
            </Card>
            <Card className="border-gray-200">
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-2">How does the AI feedback work?</h3>
                <p className="text-gray-600">Our AI analyzes your documents for structure, content, clarity, and provides specific suggestions for improvement based on successful application patterns.</p>
              </CardContent>
            </Card>
            <Card className="border-gray-200">
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-2">Is my data secure?</h3>
                <p className="text-gray-600">Absolutely. We use enterprise-grade encryption and never share your personal information or documents with third parties.</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Subscription Status */}
        {user && subscription && (
          <div className="text-center">
            <Card className="max-w-md mx-auto border-gray-200">
              <CardHeader className="text-center">
                <CardTitle className="text-gray-900">Your Subscription</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <Badge variant={subscription.subscribed ? "default" : "secondary"}>
                      {subscription.subscribed ? "✅ Active Premium" : "❌ No Active Plan"}
                    </Badge>
                  </div>
                  {subscription.subscription_tier && (
                    <p className="text-gray-700 font-medium">Plan: {subscription.subscription_tier}</p>
                  )}
                  {subscription.subscription_end && (
                    <p className="text-gray-600">
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

        {/* CTA for non-logged in users */}
        {!user && (
          <div className="text-center mt-12">
            <Card className="border-gray-900 bg-gray-900 text-white">
              <CardContent className="p-8">
                <h3 className="text-xl font-bold mb-3">Ready to Get Started?</h3>
                <p className="text-gray-300 mb-6">
                  Join students worldwide and transform your university applications today.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link to="/auth?redirect=pricing">
                    <Button className="bg-white text-gray-900 hover:bg-gray-100">
                      Start Your Journey
                    </Button>
                  </Link>
                  <Link to="/documents">
                    <Button variant="outline" className="border-gray-400 text-white hover:bg-white hover:text-gray-900">
                      Try Demo First
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Checkout Modal */}
        <CheckoutModal
          isOpen={checkoutModalOpen}
          onClose={() => setCheckoutModalOpen(false)}
          onSuccess={handleCheckoutSuccess}
        />
      </div>
    </div>
  );
};

export default Pricing;
