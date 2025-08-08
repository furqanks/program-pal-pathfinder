import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
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
  Bot,
  AlertTriangle,
  Download,
  History
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

interface SubscriptionDetails {
  id: string;
  status: string;
  current_period_start: number;
  current_period_end: number;
  cancel_at_period_end: boolean;
  canceled_at: number | null;
  price: {
    amount: number;
    currency: string;
    interval: string;
  };
  product: {
    name: string;
    description: string;
  };
}

interface BillingTransaction {
  id: string;
  amount: number;
  currency: string;
  status: string;
  date: number;
  type: 'invoice' | 'payment';
  invoice_pdf?: string;
  hosted_invoice_url?: string;
  number?: string;
  description: string;
  receipt_url?: string;
}

export const SubscriptionManager = () => {
  const { user, subscription, checkSubscription } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [subscriptionDetails, setSubscriptionDetails] = useState<SubscriptionDetails | null>(null);
  const [billingHistory, setBillingHistory] = useState<BillingTransaction[]>([]);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [billingLoading, setBillingLoading] = useState(false);

  useEffect(() => {
    if (user && subscription?.subscribed) {
      loadSubscriptionDetails();
      loadBillingHistory();
    }
  }, [user, subscription]);

  const loadSubscriptionDetails = async () => {
    if (!user) return;
    
    setDetailsLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) return;

      const { data, error } = await supabase.functions.invoke('subscription-details', {
        headers: {
          Authorization: `Bearer ${sessionData.session.access_token}`,
        },
      });

      if (error) throw error;
      
      if (data.subscription) {
        setSubscriptionDetails(data.subscription);
      }
    } catch (error) {
      console.error('Error loading subscription details:', error);
    } finally {
      setDetailsLoading(false);
    }
  };

  const loadBillingHistory = async () => {
    if (!user) return;
    
    setBillingLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) return;

      const { data, error } = await supabase.functions.invoke('billing-history', {
        headers: {
          Authorization: `Bearer ${sessionData.session.access_token}`,
        },
      });

      if (error) throw error;
      
      setBillingHistory(data.transactions || []);
    } catch (error) {
      console.error('Error loading billing history:', error);
    } finally {
      setBillingLoading(false);
    }
  };

  const handleCancelSubscription = async (cancelAtPeriodEnd: boolean) => {
    if (!user) return;

    setLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        toast({
          title: "Error",
          description: "Please sign in again to cancel your subscription.",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('cancel-subscription', {
        headers: {
          Authorization: `Bearer ${sessionData.session.access_token}`,
        },
        body: JSON.stringify({ cancelAtPeriodEnd }),
      });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to cancel subscription. Please try again.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: cancelAtPeriodEnd 
          ? "Your subscription will be canceled at the end of the current billing period."
          : "Your subscription has been canceled immediately.",
      });

      // Refresh subscription status
      await checkSubscription();
      await loadSubscriptionDetails();
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

  const handleReactivateSubscription = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        toast({
          title: "Error",
          description: "Please sign in again to reactivate your subscription.",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('reactivate-subscription', {
        headers: {
          Authorization: `Bearer ${sessionData.session.access_token}`,
        },
      });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to reactivate subscription. Please try again.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Your subscription has been reactivated successfully.",
      });

      // Refresh subscription status
      await checkSubscription();
      await loadSubscriptionDetails();
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

  const handleDownloadInvoice = (transaction: BillingTransaction) => {
    if (transaction.type === 'invoice' && transaction.hosted_invoice_url) {
      window.open(transaction.hosted_invoice_url, '_blank');
    } else if (transaction.receipt_url) {
      window.open(transaction.receipt_url, '_blank');
    } else {
      toast({
        title: "Error",
        description: "No receipt available for this transaction.",
        variant: "destructive",
      });
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(amount / 100);
  };

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

          {subscriptionDetails && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Current period:</span>
                <span>
                  {formatDate(subscriptionDetails.current_period_start)} - {formatDate(subscriptionDetails.current_period_end)}
                </span>
              </div>
              {subscriptionDetails.cancel_at_period_end ? (
                <Alert className="border-orange-200 bg-orange-50">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <AlertDescription className="text-orange-800">
                    Your subscription will be canceled on {formatDate(subscriptionDetails.current_period_end)}
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="flex items-center justify-between text-sm">
                  <span>Next billing date:</span>
                  <span>{formatDate(subscriptionDetails.current_period_end)}</span>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-2 flex-wrap">
            {!subscription?.subscribed ? (
              <Button onClick={handleUpgrade} disabled={true}>
                <Crown className="h-4 w-4 mr-2" />
                All features enabled (Beta)
              </Button>
            ) : (
              <>
                <Button onClick={handleManageSubscription} disabled={loading}>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Manage Subscription
                </Button>
                
                {subscriptionDetails?.cancel_at_period_end ? (
                  <Button 
                    onClick={handleReactivateSubscription} 
                    disabled={loading}
                    variant="outline"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reactivate Subscription
                  </Button>
                ) : (
                  <>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" disabled={loading}>
                          Cancel at Period End
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Cancel Subscription</AlertDialogTitle>
                          <AlertDialogDescription>
                            Your subscription will remain active until {subscriptionDetails && formatDate(subscriptionDetails.current_period_end)}. You'll continue to have access to all premium features until then.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleCancelSubscription(true)}>
                            Cancel at Period End
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" disabled={loading}>
                          Cancel Immediately
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Cancel Subscription Immediately</AlertDialogTitle>
                          <AlertDialogDescription>
                            Your subscription will be canceled immediately and you'll lose access to premium features right away. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleCancelSubscription(false)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Cancel Immediately
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </>
                )}
              </>
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

      {/* Billing History */}
      {subscription?.subscribed && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Billing History
            </CardTitle>
            <CardDescription>Your payment history and receipts</CardDescription>
          </CardHeader>
          <CardContent>
            {billingLoading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                Loading billing history...
              </div>
            ) : billingHistory.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No billing history found
              </div>
            ) : (
              <div className="space-y-3">
                {billingHistory.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{transaction.description}</span>
                        <Badge variant="outline" className="text-xs">
                          {transaction.type}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatDate(transaction.date)}
                        {transaction.number && ` • Invoice ${transaction.number}`}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="font-medium">
                          {formatAmount(transaction.amount, transaction.currency)}
                        </div>
                        <Badge 
                          variant={transaction.status === 'paid' || transaction.status === 'succeeded' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {transaction.status}
                        </Badge>
                      </div>
                      {(transaction.invoice_pdf || transaction.hosted_invoice_url || transaction.receipt_url) && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadInvoice(transaction)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

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
              <Button className="w-full" onClick={handleUpgrade} disabled={true}>
                <Crown className="h-4 w-4 mr-2" />
                All features enabled (Beta)
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
              Beta: all features are currently free and unlimited.
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};