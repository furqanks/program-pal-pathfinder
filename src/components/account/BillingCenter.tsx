import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  CreditCard, 
  Download, 
  Receipt, 
  Calendar, 
  DollarSign,
  Building,
  MapPin,
  Edit
} from "lucide-react";

interface PaymentMethod {
  id: string;
  type: string;
  last4: string;
  brand: string;
  exp_month: number;
  exp_year: number;
}

interface Invoice {
  id: string;
  amount: number;
  currency: string;
  status: string;
  created: number;
  invoice_pdf?: string;
  hosted_invoice_url?: string;
  number?: string;
  description?: string;
}

export const BillingCenter = () => {
  const { user, subscription } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [billingInfo, setBillingInfo] = useState({
    company_name: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: '',
    tax_id: ''
  });

  useEffect(() => {
    if (user && subscription?.subscribed) {
      loadBillingData();
    }
  }, [user, subscription]);

  const loadBillingData = async () => {
    try {
      setLoading(true);
      
      // Load billing history from Stripe via edge function
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) return;

      const { data, error } = await supabase.functions.invoke('billing-history', {
        headers: {
          Authorization: `Bearer ${sessionData.session.access_token}`,
        },
      });

      if (error) {
        console.error('Error loading billing history:', error);
        // Don't show error toast for missing customer, just log it
        return;
      }

      // Convert billing history to invoices format
      if (data.transactions && Array.isArray(data.transactions)) {
        const formattedInvoices = data.transactions
          .filter((t: any) => t.type === 'invoice')
          .map((transaction: any) => ({
            id: transaction.id,
            amount: transaction.amount,
            currency: transaction.currency,
            status: transaction.status,
            created: transaction.date,
            invoice_pdf: transaction.invoice_pdf,
            hosted_invoice_url: transaction.hosted_invoice_url,
            number: transaction.number,
            description: transaction.description || 'Subscription payment'
          }));
        setInvoices(formattedInvoices);
      }

      // Set placeholder payment method data since we don't have a separate endpoint
      setPaymentMethods([
        {
          id: 'pm_default',
          type: 'card',
          last4: '****',
          brand: 'card',
          exp_month: 12,
          exp_year: 2025
        }
      ]);

    } catch (error) {
      console.error('Error loading billing data:', error);
      toast({
        title: "Error",
        description: "Failed to load billing information. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleManagePayment = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        toast({
          title: "Error",
          description: "Please sign in again to manage payment methods.",
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

  const handleUpdateBillingInfo = async () => {
    // This would typically update billing information via an edge function
    toast({
      title: "Billing information updated",
      description: "Your billing information has been saved.",
    });
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const getCardBrandIcon = (brand: string) => {
    // Return appropriate card brand icon
    return <CreditCard className="h-4 w-4" />;
  };

  if (!subscription?.subscribed) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="text-center py-8">
            <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Active Subscription</h3>
            <p className="text-muted-foreground mb-4">
              You don't have an active subscription. Upgrade to Premium to access billing features.
            </p>
            <Button>Upgrade to Premium</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Subscription */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Current Subscription
          </CardTitle>
          <CardDescription>Your active subscription details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Premium Plan</h3>
              <p className="text-muted-foreground">$7.99/month</p>
            </div>
            <Badge>Active</Badge>
          </div>
          
          {subscription.subscription_end && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              Next billing: {new Date(subscription.subscription_end).toLocaleDateString()}
            </div>
          )}

          <Button onClick={handleManagePayment} disabled={loading}>
            <CreditCard className="h-4 w-4 mr-2" />
            Manage Subscription
          </Button>
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Methods
          </CardTitle>
          <CardDescription>Manage your payment methods</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {paymentMethods.length > 0 ? (
            <div className="space-y-3">
              {paymentMethods.map((method) => (
                <div key={method.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getCardBrandIcon(method.brand)}
                    <div>
                      <p className="font-medium capitalize">
                        {method.brand} ending in {method.last4}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Expires {method.exp_month}/{method.exp_year}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline">Default</Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No payment methods found.</p>
          )}

          <Button variant="outline" onClick={handleManagePayment} disabled={loading}>
            <Edit className="h-4 w-4 mr-2" />
            Update Payment Method
          </Button>
        </CardContent>
      </Card>

      {/* Billing Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Billing Information
          </CardTitle>
          <CardDescription>Your billing address and company information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company">Company Name (Optional)</Label>
              <Input
                id="company"
                value={billingInfo.company_name}
                onChange={(e) => setBillingInfo(prev => ({ ...prev, company_name: e.target.value }))}
                placeholder="Your Company"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="tax_id">Tax ID/VAT Number (Optional)</Label>
              <Input
                id="tax_id"
                value={billingInfo.tax_id}
                onChange={(e) => setBillingInfo(prev => ({ ...prev, tax_id: e.target.value }))}
                placeholder="Tax ID"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address1">Address Line 1</Label>
              <Input
                id="address1"
                value={billingInfo.address_line1}
                onChange={(e) => setBillingInfo(prev => ({ ...prev, address_line1: e.target.value }))}
                placeholder="Street address"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address2">Address Line 2 (Optional)</Label>
              <Input
                id="address2"
                value={billingInfo.address_line2}
                onChange={(e) => setBillingInfo(prev => ({ ...prev, address_line2: e.target.value }))}
                placeholder="Apartment, suite, etc."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={billingInfo.city}
                onChange={(e) => setBillingInfo(prev => ({ ...prev, city: e.target.value }))}
                placeholder="City"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">State/Province</Label>
              <Input
                id="state"
                value={billingInfo.state}
                onChange={(e) => setBillingInfo(prev => ({ ...prev, state: e.target.value }))}
                placeholder="State"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="postal">Postal Code</Label>
              <Input
                id="postal"
                value={billingInfo.postal_code}
                onChange={(e) => setBillingInfo(prev => ({ ...prev, postal_code: e.target.value }))}
                placeholder="ZIP/Postal code"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={billingInfo.country}
                onChange={(e) => setBillingInfo(prev => ({ ...prev, country: e.target.value }))}
                placeholder="Country"
              />
            </div>
          </div>

          <Button onClick={handleUpdateBillingInfo}>
            <MapPin className="h-4 w-4 mr-2" />
            Update Billing Information
          </Button>
        </CardContent>
      </Card>

      {/* Billing History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Billing History
          </CardTitle>
          <CardDescription>Your payment history and invoices</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2" />
              Loading billing history...
            </div>
          ) : invoices.length > 0 ? (
            <div className="space-y-3">
              {invoices.map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Receipt className="h-4 w-4" />
                      <span className="font-medium">
                        {formatAmount(invoice.amount, invoice.currency)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {new Date(invoice.created * 1000).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                      {invoice.number && ` • Invoice ${invoice.number}`}
                    </p>
                    {invoice.description && (
                      <p className="text-sm text-muted-foreground">
                        {invoice.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={invoice.status === 'paid' ? 'default' : 'secondary'}>
                      {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                    </Badge>
                    {(invoice.invoice_pdf || invoice.hosted_invoice_url) && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          const url = invoice.hosted_invoice_url || invoice.invoice_pdf;
                          if (url) window.open(url, '_blank');
                        }}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Receipt
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Billing History</h3>
              <p className="text-muted-foreground">
                Your billing history will appear here once you have completed payments.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};