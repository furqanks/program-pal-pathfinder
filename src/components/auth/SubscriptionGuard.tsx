import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Crown, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface SubscriptionGuardProps {
  children: React.ReactNode;
  feature?: string;
  fallbackPath?: string;
}

export const SubscriptionGuard: React.FC<SubscriptionGuardProps> = ({ 
  children, 
  feature = "this feature",
  fallbackPath = "/pricing"
}) => {
  const { user, subscription, checkSubscription, loading } = useAuth();
  const [isChecking, setIsChecking] = useState(true);
  const [hasShownToast, setHasShownToast] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const verifySubscription = async () => {
      if (user && !loading) {
        // Force a fresh subscription check
        await checkSubscription();
        setIsChecking(false);
      }
    };

    verifySubscription();
  }, [user, loading, checkSubscription]);

  // Show toast when subscription status changes to inactive
  useEffect(() => {
    if (!loading && !isChecking && user && subscription && !hasShownToast) {
      if (!subscription.subscribed) {
        const isExpired = subscription.subscription_end && new Date(subscription.subscription_end) < new Date();
        
        if (isExpired) {
          toast.error("Your subscription has expired", {
            description: "Please renew your subscription to continue accessing premium features.",
            action: {
              label: "Renew",
              onClick: () => navigate("/pricing")
            }
          });
        } else {
          toast.warning("Premium subscription required", {
            description: `Access to ${feature} requires an active subscription.`,
            action: {
              label: "Upgrade",
              onClick: () => navigate("/pricing")
            }
          });
        }
        setHasShownToast(true);
      }
    }
  }, [loading, isChecking, user, subscription, hasShownToast, feature, navigate]);

  // Show loading state while checking
  if (loading || isChecking) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verifying subscription status...</p>
        </div>
      </div>
    );
  }

  // If user is not logged in
  if (!user) {
    return (
      <Card className="max-w-md mx-auto mt-8 border-yellow-200 bg-yellow-50">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <AlertTriangle className="h-8 w-8 text-yellow-600" />
          </div>
          <CardTitle className="text-yellow-800">Authentication Required</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-yellow-700">Please sign in to access {feature}.</p>
          <Button onClick={() => navigate("/auth")} className="w-full">
            Sign In
          </Button>
        </CardContent>
      </Card>
    );
  }

  // If subscription is not active
  if (!subscription?.subscribed) {
    const isExpired = subscription?.subscription_end && new Date(subscription.subscription_end) < new Date();
    
    return (
      <Card className="max-w-lg mx-auto mt-8 border-orange-200 bg-orange-50">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <Crown className="h-8 w-8 text-orange-600" />
          </div>
          <CardTitle className="text-orange-800 flex items-center justify-center gap-2">
            Premium Feature Required
            <Badge variant="secondary" className="bg-orange-100 text-orange-800">
              Premium
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {isExpired ? (
            <>
              <div className="flex items-center justify-center gap-2 text-orange-700">
                <Clock className="h-4 w-4" />
                <span>Your subscription has expired</span>
              </div>
              <p className="text-orange-700">
                Your subscription ended on {new Date(subscription.subscription_end!).toLocaleDateString()}. 
                Renew your subscription to continue accessing {feature}.
              </p>
            </>
          ) : (
            <p className="text-orange-700">
              {feature} requires a Premium subscription. Upgrade now to unlock all features.
            </p>
          )}
          
          <div className="space-y-3">
            <Button onClick={() => navigate(fallbackPath)} className="w-full">
              {isExpired ? "Renew Subscription" : "Upgrade to Premium"}
            </Button>
            <Button variant="outline" onClick={() => checkSubscription()} className="w-full">
              Refresh Status
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Subscription is active - render protected content
  return <>{children}</>;
};

export default SubscriptionGuard;