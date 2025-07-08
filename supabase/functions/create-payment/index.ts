import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://cdn.jsdelivr.net/npm/stripe@13.11.0/+esm";
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.38.4/+esm";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-PAYMENT] ${step}${detailsStr}`);
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
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Get request body
    const { amount, currency = "usd", productName, userEmail } = await req.json();
    
    if (!amount || !productName) {
      throw new Error("Amount and product name are required");
    }

    logStep("Payment request", { amount, currency, productName });

    let customerEmail = userEmail;
    let userId = null;

    // Try to get authenticated user if available
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      try {
        const token = authHeader.replace("Bearer ", "");
        const { data: userData } = await supabaseClient.auth.getUser(token);
        if (userData.user?.email) {
          customerEmail = userData.user.email;
          userId = userData.user.id;
          logStep("User authenticated", { email: customerEmail, userId });
        }
      } catch (error) {
        logStep("Authentication failed, proceeding as guest", { error: error.message });
      }
    }

    // Use guest email if no user is authenticated
    if (!customerEmail) {
      customerEmail = "guest@example.com";
      logStep("Using guest checkout");
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    
    // Check if customer exists
    const customers = await stripe.customers.list({ email: customerEmail, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Found existing customer", { customerId });
    }

    // Create checkout session for one-time payment
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : customerEmail,
      line_items: [
        {
          price_data: {
            currency: currency,
            product_data: { 
              name: productName,
              description: `One-time purchase: ${productName}`
            },
            unit_amount: amount, // Amount in cents
          },
          quantity: 1,
        },
      ],
      mode: "payment", // One-time payment
      success_url: `${req.headers.get("origin")}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/account`,
      metadata: {
        user_id: userId || "guest",
        product_name: productName,
      }
    });

    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    // Optional: Store order in database if user is authenticated
    if (userId) {
      try {
        const supabaseService = createClient(
          Deno.env.get("SUPABASE_URL") ?? "",
          Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
          { auth: { persistSession: false } }
        );

        // You can uncomment this if you create an orders table
        /*
        await supabaseService.from("orders").insert({
          user_id: userId,
          stripe_session_id: session.id,
          amount: amount,
          currency: currency,
          product_name: productName,
          status: "pending",
          created_at: new Date().toISOString()
        });
        */
        
        logStep("Order recorded in database");
      } catch (dbError) {
        logStep("Database insert failed, continuing", { error: dbError.message });
      }
    }

    return new Response(JSON.stringify({ 
      success: true,
      url: session.url,
      session_id: session.id 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-payment", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});