import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://cdn.jsdelivr.net/npm/stripe@13.11.0/+esm";
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.38.4/+esm";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SUBSCRIPTION-DETAILS] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");

    logStep("User authenticated", { userId: user.id, email: user.email });

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    
    // Get customer by email
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    if (customers.data.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        subscription: null,
        customer: null
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customer = customers.data[0];
    logStep("Found Stripe customer", { customerId: customer.id });

    // Get all subscriptions for the customer
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      limit: 10,
    });

    logStep("Retrieved subscriptions", { count: subscriptions.data.length });

    // Find the most recent subscription
    const subscription = subscriptions.data[0];
    
    let subscriptionDetails = null;
    if (subscription) {
      // Get the price details
      const price = subscription.items.data[0]?.price;
      const product = price ? await stripe.products.retrieve(price.product as string) : null;

      subscriptionDetails = {
        id: subscription.id,
        status: subscription.status,
        current_period_start: subscription.current_period_start,
        current_period_end: subscription.current_period_end,
        cancel_at_period_end: subscription.cancel_at_period_end,
        canceled_at: subscription.canceled_at,
        created: subscription.created,
        price: {
          id: price?.id,
          amount: price?.unit_amount,
          currency: price?.currency,
          interval: price?.recurring?.interval,
          interval_count: price?.recurring?.interval_count,
        },
        product: {
          id: product?.id,
          name: product?.name,
          description: product?.description,
        },
        trial_start: subscription.trial_start,
        trial_end: subscription.trial_end,
        discount: subscription.discount,
      };

      logStep("Processed subscription details", { subscriptionId: subscription.id, status: subscription.status });
    }

    // Get customer details
    const customerDetails = {
      id: customer.id,
      email: customer.email,
      name: customer.name,
      created: customer.created,
    };

    return new Response(JSON.stringify({
      success: true,
      subscription: subscriptionDetails,
      customer: customerDetails,
      all_subscriptions: subscriptions.data.map(sub => ({
        id: sub.id,
        status: sub.status,
        created: sub.created,
        current_period_end: sub.current_period_end,
      }))
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in subscription-details", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});