
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
          <Badge className="mb-4 bg-green-600 text-white">Free Premium Access</Badge>
          <h1 className="text-4xl font-bold mb-4 text-foreground">
            All Premium Features Included
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Simply sign up to access all our premium features at no cost. Start your journey to top universities today.
          </p>
        </div>

        {/* Single Card for Free Premium Access */}
        <div className="max-w-2xl mx-auto mb-16">
          <Card className="border-green-200 shadow-lg relative">
            <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-green-600 text-white">
              Free Premium Access
            </Badge>
            <CardHeader className="text-center pb-6 pt-8">
              <CardTitle className="text-2xl text-gray-900 mb-2">Complete Access Plan</CardTitle>
              <CardDescription className="text-gray-600">
                All features included - no subscription required
              </CardDescription>
              <div className="mt-4">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  Free
                  <span className="text-base font-normal text-gray-600">/forever</span>
                </div>
                <p className="text-gray-600">Everything you need to succeed</p>
              </div>
            </CardHeader>
            <CardContent className="pb-6">
              <div className="space-y-4 mb-6">
                {premiumFeatures.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      {feature.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">{feature.title}</h4>
                      <p className="text-gray-600 text-sm">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Included for all users:</h4>
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Check className="h-3 w-3 text-green-600" />
                    <span>Unlimited CV reviews</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-3 w-3 text-green-600" />
                    <span>Advanced AI feedback</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-3 w-3 text-green-600" />
                    <span>Full program database</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-3 w-3 text-green-600" />
                    <span>Application tracking</span>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              {user ? (
                <Button 
                  className="w-full bg-green-600 hover:bg-green-700 text-white" 
                  onClick={() => window.location.href = '/'}
                >
                  Access Dashboard
                </Button>
              ) : (
                <Button 
                  className="w-full bg-green-600 hover:bg-green-700 text-white" 
                  onClick={() => window.location.href = '/auth'}
                >
                  Sign Up for Free Access
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>


        {/* FAQ Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-center mb-8 text-gray-900">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <Card className="border-gray-200">
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-2">Is this really free?</h3>
                <p className="text-gray-600">Yes! All our premium features are completely free. Simply sign up to get unlimited access to document reviews, program search, and application tracking.</p>
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

        {/* Access Status */}
        {user && subscription && (
          <div className="text-center">
            <Card className="max-w-md mx-auto border-green-200">
              <CardHeader className="text-center">
                <CardTitle className="text-gray-900">Your Access Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <Badge className="bg-green-600 text-white">
                      ✅ Premium Access Active
                    </Badge>
                  </div>
                  <p className="text-gray-700 font-medium">Plan: Free Premium Access</p>
                  <p className="text-gray-600">
                    All features included at no cost
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* CTA for non-logged in users */}
        {!user && (
          <div className="text-center mt-12">
            <Card className="border-green-600 bg-green-600 text-white">
              <CardContent className="p-8">
                <h3 className="text-xl font-bold mb-3">Ready to Get Started?</h3>
                <p className="text-green-100 mb-6">
                  Join students worldwide and access all premium features completely free.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link to="/auth">
                    <Button className="bg-white text-green-600 hover:bg-gray-100">
                      Sign Up for Free Access
                    </Button>
                  </Link>
                  <Link to="/documents">
                    <Button variant="outline" className="border-green-200 text-white hover:bg-white hover:text-green-600">
                      Try Features Now
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

      </div>
    </div>
  );
};

export default Pricing;
