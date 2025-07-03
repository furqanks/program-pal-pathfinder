import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://cdn.skypack.dev/stripe@13.11.0?dts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper logging function for enhanced debugging
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Use the service role key to perform writes (upsert) in Supabase
  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    logStep("Authorization header found");

    const token = authHeader.replace("Bearer ", "");
    logStep("Authenticating user with token");
    
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Check if customer exists, create if not
    let customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    
    if (customers.data.length === 0) {
      logStep("Creating new Stripe customer");
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          user_id: user.id,
        },
      });
      customerId = customer.id;
      logStep("New customer created", { customerId });
    } else {
      customerId = customers.data[0].id;
      logStep("Found existing customer", { customerId });
    }

    // Check if user already has an active subscription
    const existingSubscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'active',
      limit: 1,
    });

    if (existingSubscriptions.data.length > 0) {
      logStep("User already has active subscription");
      return new Response(JSON.stringify({
        error: "You already have an active subscription",
        subscription_id: existingSubscriptions.data[0].id,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    logStep("Creating subscription for recurring payment");
    
    // Create or get the price for $9.99/month
    let priceId;
    
    // First check if our product and price already exist
    const products = await stripe.products.list({ limit: 100 });
    let product = products.data.find(p => p.metadata?.app === 'uniapp-space' && p.metadata?.tier === 'premium');
    
    if (!product) {
      // Create the product
      product = await stripe.products.create({
        name: 'UniApp Space Premium',
        description: 'Premium subscription for UniApp Space with unlimited AI document reviews, advanced program search, and priority support',
        metadata: {
          app: 'uniapp-space',
          tier: 'premium'
        }
      });
      logStep("Created new product", { productId: product.id });
    }
    
    // Check if price exists for this product
    const prices = await stripe.prices.list({ 
      product: product.id,
      limit: 10 
    });
    
    let price = prices.data.find(p => p.unit_amount === 999 && p.recurring?.interval === 'month');
    
    if (!price) {
      // Create the price
      price = await stripe.prices.create({
        product: product.id,
        unit_amount: 999, // $9.99 in cents
        currency: 'usd',
        recurring: {
          interval: 'month',
        },
        metadata: {
          app: 'uniapp-space',
          tier: 'premium'
        }
      });
      logStep("Created new price", { priceId: price.id });
    }
    
    priceId = price.id;

    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{
        price: priceId,
      }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
      metadata: {
        user_id: user.id,
      },
    });

    logStep("Subscription created", { 
      subscriptionId: subscription.id, 
      status: subscription.status 
    });

    // Update our database with the subscription info
    await supabaseClient.from("subscribers").upsert({
      email: user.email,
      user_id: user.id,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscription.id,
      subscription_status: subscription.status,
      subscribed: false, // Will be true once payment is confirmed
      subscription_tier: 'Premium',
      updated_at: new Date().toISOString(),
    }, { onConflict: 'email' });

    logStep("Database updated with subscription info");

    // Extract the client secret from the payment intent
    const paymentIntent = subscription.latest_invoice?.payment_intent;
    if (!paymentIntent || typeof paymentIntent === 'string') {
      throw new Error("Payment intent not found or not expanded properly");
    }

    const clientSecret = paymentIntent.client_secret;
    if (!clientSecret) {
      throw new Error("Client secret not found");
    }

    logStep("Returning client secret", { paymentIntentId: paymentIntent.id });

    return new Response(JSON.stringify({
      client_secret: clientSecret,
      subscription_id: subscription.id,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-subscription", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});