
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

  const premiumFeatures = [
    {
      icon: <Zap className="h-5 w-5" />,
      title: "Unlimited AI Document Reviews",
      description: "Get expert-level feedback on essays, SOPs, and all application documents"
    },
    {
      icon: <Star className="h-5 w-5" />,
      title: "Advanced Program Search",
      description: "Access our comprehensive database of 1,200+ universities worldwide"
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header */}
      <div className="border-b border-gray-100 bg-white/95 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <Link to="/home">
            <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-20">
        {/* Header Section */}
        <div className="text-center mb-20">
          <Badge className="mb-6 bg-gray-900 text-white px-4 py-2">Choose Your Plan</Badge>
          <h1 className="text-5xl font-bold mb-6 text-gray-900">
            Unlock Your University Dreams
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose the plan that fits your needs and start your journey to top universities. 
            Join thousands of successful students who achieved their goals with UniApp Space.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid lg:grid-cols-2 gap-12 max-w-5xl mx-auto mb-20">
          {/* Free Demo Card */}
          <Card className="border-gray-200 bg-white shadow-lg hover:shadow-xl transition-shadow relative">
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-2xl text-gray-900 mb-2">Free Demo</CardTitle>
              <CardDescription className="text-gray-600 text-lg">
                Experience our AI-powered document review
              </CardDescription>
              <div className="mt-6">
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  $0
                  <span className="text-lg font-normal text-gray-600">/forever</span>
                </div>
                <p className="text-gray-600">Perfect for trying out our platform</p>
              </div>
            </CardHeader>
            <CardContent className="pb-8">
              <ul className="space-y-4">
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
                className="w-full py-6 text-lg" 
                variant="outline"
                onClick={() => window.location.href = '/documents'}
              >
                Try Free Demo
              </Button>
            </CardFooter>
          </Card>

          {/* Premium Card */}
          <Card className="border-gray-900 bg-white shadow-xl hover:shadow-2xl transition-shadow relative overflow-hidden">
            <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-gray-900 to-gray-700 text-white px-6 py-2 text-sm font-medium">
              🚀 Most Popular
            </Badge>
            <CardHeader className="text-center pb-8 pt-8">
              <CardTitle className="text-2xl text-gray-900 mb-2">Premium Plan</CardTitle>
              <CardDescription className="text-gray-600 text-lg">
                Complete university application solution
              </CardDescription>
              <div className="mt-6">
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  $9.99
                  <span className="text-lg font-normal text-gray-600">/month</span>
                </div>
                <p className="text-gray-600">Everything you need to succeed</p>
              </div>
            </CardHeader>
            <CardContent className="pb-8">
              <div className="space-y-6">
                {premiumFeatures.map((feature, index) => (
                  <div key={index} className="flex items-start gap-4">
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
              
              <div className="mt-8 p-4 bg-gray-50 rounded-lg">
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
                  className="w-full py-6 text-lg bg-gray-900 hover:bg-gray-800" 
                  onClick={handleManageSubscription}
                  disabled={loading}
                >
                  {loading ? "Loading..." : "Manage Subscription"}
                </Button>
              ) : (
                <Button 
                  className="w-full py-6 text-lg bg-gray-900 hover:bg-gray-800" 
                  onClick={handleSubscribe}
                  disabled={loading}
                >
                  {loading ? "Processing..." : user ? "Subscribe Now" : "Sign Up to Subscribe"}
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>

        {/* Value Proposition */}
        <div className="text-center mb-16">
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="p-6">
              <div className="text-3xl font-bold text-green-600 mb-2">40%</div>
              <div className="text-gray-600">Higher acceptance rates</div>
            </div>
            <div className="p-6">
              <div className="text-3xl font-bold text-blue-600 mb-2">20hrs</div>
              <div className="text-gray-600">Saved per application</div>
            </div>
            <div className="p-6">
              <div className="text-3xl font-bold text-purple-600 mb-2">$1000s</div>
              <div className="text-gray-600">Saved on consultancy fees</div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">Frequently Asked Questions</h2>
          <div className="space-y-6">
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
            <Card className="max-w-md mx-auto border-gray-200 shadow-lg">
              <CardHeader className="text-center">
                <CardTitle className="text-gray-900">Your Subscription</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <Badge variant={subscription.subscribed ? "default" : "secondary"} className="text-sm px-4 py-2">
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
                  className="mt-6 w-full"
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
          <div className="text-center mt-16">
            <Card className="max-w-2xl mx-auto border-gray-900 bg-gradient-to-r from-gray-900 to-gray-800 text-white">
              <CardContent className="p-12">
                <h3 className="text-2xl font-bold mb-4">Ready to Get Started?</h3>
                <p className="text-gray-300 mb-8 text-lg">
                  Join thousands of successful students and transform your university applications today.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/auth?redirect=pricing">
                    <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100 px-8">
                      Start Your Journey
                    </Button>
                  </Link>
                  <Link to="/documents">
                    <Button size="lg" variant="outline" className="border-gray-400 text-white hover:bg-white hover:text-gray-900 px-8">
                      Try Demo First
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
