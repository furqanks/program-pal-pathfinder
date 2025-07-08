import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Crown, 
  Check, 
  X, 
  RefreshCw, 
  CreditCard, 
  Calendar, 
  Zap,
  FileText,
  Search,
  Bot
} from "lucide-react";

const PLAN_FEATURES = {
  free: [
    { name: "5 Document Reviews per month", included: true },
    { name: "Basic AI Feedback", included: true },
    { name: "University Search", included: true },
    { name: "Note Taking", included: true },
    { name: "Advanced AI Insights", included: false },
    { name: "Unlimited Document Reviews", included: false },
    { name: "Priority Support", included: false },
    { name: "Premium Templates", included: false }
  ],
  premium: [
    { name: "Unlimited Document Reviews", included: true },
    { name: "Advanced AI Feedback", included: true },
    { name: "University Search", included: true },
    { name: "Advanced Note Taking", included: true },
    { name: "AI Insights & Analytics", included: true },
    { name: "Premium Templates", included: true },
    { name: "Priority Support", included: true },
    { name: "Early Access Features", included: true }
  ]
};

export const SubscriptionManager = () => {
  const { user, subscription, checkSubscription } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        toast({
          title: "Error",
          description: "Please sign in again to upgrade your subscription.",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        headers: {
          Authorization: `Bearer ${sessionData.session.access_token}`,
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

      // Open Stripe checkout in a new tab
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
    if (!user) return;

    setLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        toast({
          title: "Error",
          description: "Please sign in again to manage your subscription.",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('customer-portal', {
        headers: {
          Authorization: `Bearer ${sessionData.session.access_token}`,
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

      // Open Stripe customer portal in a new tab
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

  const handleRefreshSubscription = async () => {
    setLoading(true);
    try {
      await checkSubscription();
      toast({
        title: "Refreshed",
        description: "Subscription status has been updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh subscription status.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const currentPlan = subscription?.subscribed ? 'premium' : 'free';
  const features = PLAN_FEATURES[currentPlan];

  return (
    <div className="space-y-6">
      {/* Current Subscription Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5" />
            Current Subscription
          </CardTitle>
          <CardDescription>Your current plan and status</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">
                {subscription?.subscribed ? 'Premium Plan' : 'Free Plan'}
              </h3>
              <p className="text-muted-foreground">
                {subscription?.subscribed 
                  ? 'Full access to all features' 
                  : 'Limited access with upgrade available'
                }
              </p>
            </div>
            <Badge variant={subscription?.subscribed ? "default" : "secondary"}>
              {subscription?.subscribed ? "Active" : "Free"}
            </Badge>
          </div>

          {subscription?.subscribed && subscription.subscription_end && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Next billing date:</span>
                <span>{new Date(subscription.subscription_end).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Auto-renewal:</span>
                <span className="text-green-600">Enabled</span>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            {!subscription?.subscribed ? (
              <Button onClick={handleUpgrade} disabled={loading}>
                <Crown className="h-4 w-4 mr-2" />
                Upgrade to Premium
              </Button>
            ) : (
              <Button onClick={handleManageSubscription} disabled={loading}>
                <CreditCard className="h-4 w-4 mr-2" />
                Manage Subscription
              </Button>
            )}
            
            <Button 
              variant="outline"
              onClick={handleRefreshSubscription}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh Status
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Plan Comparison */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Free Plan */}
        <Card className={currentPlan === 'free' ? 'border-primary' : ''}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Free Plan
              {currentPlan === 'free' && <Badge>Current</Badge>}
            </CardTitle>
            <CardDescription>Perfect for getting started</CardDescription>
            <div className="text-2xl font-bold">$0/month</div>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2">
              {PLAN_FEATURES.free.map((feature, index) => (
                <li key={index} className="flex items-center gap-2">
                  {feature.included ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <X className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className={feature.included ? '' : 'text-muted-foreground'}>
                    {feature.name}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Premium Plan */}
        <Card className={currentPlan === 'premium' ? 'border-primary' : ''}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Premium Plan
              {currentPlan === 'premium' && <Badge>Current</Badge>}
            </CardTitle>
            <CardDescription>Full access to all features</CardDescription>
            <div className="text-2xl font-bold">$7.99/month</div>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2">
              {PLAN_FEATURES.premium.map((feature, index) => (
                <li key={index} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>{feature.name}</span>
                </li>
              ))}
            </ul>
            
            {!subscription?.subscribed && (
              <Button className="w-full" onClick={handleUpgrade} disabled={loading}>
                <Crown className="h-4 w-4 mr-2" />
                Upgrade Now
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Usage Progress (for free users) */}
      {!subscription?.subscribed && (
        <Card>
          <CardHeader>
            <CardTitle>Monthly Usage</CardTitle>
            <CardDescription>Your current usage towards monthly limits</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Document Reviews</span>
                  <span>3 / 5</span>
                </div>
                <Progress value={60} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>AI Feedback Requests</span>
                  <span>8 / 10</span>
                </div>
                <Progress value={80} className="h-2" />
              </div>
            </div>
            
            <div className="text-sm text-muted-foreground">
              Upgrade to Premium for unlimited access to all features.
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};