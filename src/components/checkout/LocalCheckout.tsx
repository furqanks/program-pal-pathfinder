import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreditCard, ShoppingCart, Loader2 } from "lucide-react";

interface PaymentProduct {
  name: string;
  description: string;
  amount: number; // in cents
  currency: string;
}

const predefinedProducts: PaymentProduct[] = [
  {
    name: "Document Review Service",
    description: "Professional review of your application documents",
    amount: 4999, // $49.99
    currency: "usd"
  },
  {
    name: "Personal Statement Feedback",
    description: "Detailed feedback on your personal statement",
    amount: 2999, // $29.99
    currency: "usd"
  },
  {
    name: "University Consultation",
    description: "One-hour consultation session with an expert",
    amount: 7999, // $79.99
    currency: "usd"
  },
  {
    name: "Custom Package",
    description: "Create your own custom service package",
    amount: 0, // Will be set by user
    currency: "usd"
  }
];

export const LocalCheckout = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<PaymentProduct | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [customName, setCustomName] = useState("");
  const [customDescription, setCustomDescription] = useState("");
  const [guestEmail, setGuestEmail] = useState("");

  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(amount / 100);
  };

  const handleProductSelect = (product: PaymentProduct) => {
    setSelectedProduct(product);
    if (product.name === "Custom Package") {
      setCustomAmount("");
      setCustomName("");
      setCustomDescription("");
    }
  };

  const handleCheckout = async () => {
    if (!selectedProduct) {
      toast({
        title: "Error",
        description: "Please select a product first.",
        variant: "destructive",
      });
      return;
    }

    let finalProduct = selectedProduct;

    // Handle custom package
    if (selectedProduct.name === "Custom Package") {
      if (!customName || !customAmount) {
        toast({
          title: "Error",
          description: "Please fill in custom package details.",
          variant: "destructive",
        });
        return;
      }

      const amount = parseFloat(customAmount) * 100; // Convert to cents
      if (amount < 100) { // Minimum $1.00
        toast({
          title: "Error",
          description: "Minimum amount is $1.00",
          variant: "destructive",
        });
        return;
      }

      finalProduct = {
        name: customName,
        description: customDescription || customName,
        amount: Math.round(amount),
        currency: "usd"
      };
    }

    // Check if user is authenticated or guest email is provided
    if (!user && !guestEmail) {
      toast({
        title: "Error",
        description: "Please provide an email address for guest checkout.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      
      const payload = {
        amount: finalProduct.amount,
        currency: finalProduct.currency,
        productName: finalProduct.name,
        userEmail: !user ? guestEmail : undefined
      };

      const { data, error } = await supabase.functions.invoke('create-payment', {
        headers: sessionData?.session ? {
          Authorization: `Bearer ${sessionData.session.access_token}`,
        } : {},
        body: JSON.stringify(payload),
      });

      if (error) {
        throw error;
      }

      if (data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL received");
      }

    } catch (error) {
      console.error('Error creating payment:', error);
      toast({
        title: "Error",
        description: "Failed to create payment session. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Purchase Services
          </CardTitle>
          <CardDescription>
            Select a service or create a custom package
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Product Selection */}
          <div className="space-y-4">
            <Label>Available Services</Label>
            <div className="grid gap-3">
              {predefinedProducts.map((product) => (
                <div
                  key={product.name}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedProduct?.name === product.name
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => handleProductSelect(product)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold">{product.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {product.description}
                      </p>
                    </div>
                    <div className="text-right">
                      {product.amount > 0 ? (
                        <span className="font-bold text-lg">
                          {formatPrice(product.amount, product.currency)}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          Custom Price
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Custom Package Details */}
          {selectedProduct?.name === "Custom Package" && (
            <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
              <h3 className="font-semibold">Custom Package Details</h3>
              
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="customName">Service Name</Label>
                  <Input
                    id="customName"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="Enter service name"
                  />
                </div>
                
                <div>
                  <Label htmlFor="customDescription">Description (Optional)</Label>
                  <Textarea
                    id="customDescription"
                    value={customDescription}
                    onChange={(e) => setCustomDescription(e.target.value)}
                    placeholder="Describe your custom service"
                    rows={3}
                  />
                </div>
                
                <div>
                  <Label htmlFor="customAmount">Amount (USD)</Label>
                  <Input
                    id="customAmount"
                    type="number"
                    min="1"
                    step="0.01"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Guest Email */}
          {!user && (
            <div className="space-y-2">
              <Label htmlFor="guestEmail">Email Address</Label>
              <Input
                id="guestEmail"
                type="email"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                placeholder="your.email@example.com"
                required
              />
              <p className="text-sm text-muted-foreground">
                Required for guest checkout and receipt delivery
              </p>
            </div>
          )}

          {/* Current Selection Summary */}
          {selectedProduct && (
            <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <h3 className="font-semibold mb-2">Order Summary</h3>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Service:</span>
                  <span>{selectedProduct.name === "Custom Package" ? customName || "Custom Package" : selectedProduct.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Amount:</span>
                  <span className="font-bold">
                    {selectedProduct.name === "Custom Package" && customAmount
                      ? formatPrice(parseFloat(customAmount) * 100, "usd")
                      : selectedProduct.amount > 0
                      ? formatPrice(selectedProduct.amount, selectedProduct.currency)
                      : "To be determined"
                    }
                  </span>
                </div>
                {!user && (
                  <div className="flex justify-between">
                    <span>Email:</span>
                    <span>{guestEmail || "Not provided"}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Checkout Button */}
          <Button
            onClick={handleCheckout}
            disabled={loading || !selectedProduct}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <CreditCard className="h-4 w-4 mr-2" />
            )}
            {loading ? "Processing..." : "Proceed to Checkout"}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            You'll be redirected to Stripe's secure checkout page
          </p>
        </CardContent>
      </Card>
    </div>
  );
};