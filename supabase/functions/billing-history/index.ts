import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://cdn.jsdelivr.net/npm/stripe@13.11.0/+esm";
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.38.4/+esm";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[BILLING-HISTORY] ${step}${detailsStr}`);
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
      throw new Error("No Stripe customer found for this user");
    }
    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    // Get payment intents and invoices
    const [invoices, paymentIntents] = await Promise.all([
      stripe.invoices.list({
        customer: customerId,
        limit: 50,
      }),
      stripe.paymentIntents.list({
        customer: customerId,
        limit: 50,
      })
    ]);

    logStep("Retrieved billing data", { 
      invoiceCount: invoices.data.length, 
      paymentCount: paymentIntents.data.length 
    });

    // Process invoices
    const processedInvoices = invoices.data.map(invoice => ({
      id: invoice.id,
      amount: invoice.amount_paid,
      currency: invoice.currency,
      status: invoice.status,
      date: invoice.created,
      invoice_pdf: invoice.invoice_pdf,
      hosted_invoice_url: invoice.hosted_invoice_url,
      number: invoice.number,
      description: invoice.description || 'Subscription payment',
      period_start: invoice.period_start,
      period_end: invoice.period_end,
    }));

    // Process payment intents (for one-time payments)
    const processedPayments = paymentIntents.data
      .filter(pi => pi.status === 'succeeded')
      .map(payment => ({
        id: payment.id,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        date: payment.created,
        description: payment.description || 'Payment',
        receipt_url: payment.charges.data[0]?.receipt_url,
      }));

    // Combine and sort by date
    const allTransactions = [
      ...processedInvoices.map(inv => ({ ...inv, type: 'invoice' })),
      ...processedPayments.map(pay => ({ ...pay, type: 'payment' }))
    ].sort((a, b) => b.date - a.date);

    return new Response(JSON.stringify({
      success: true,
      transactions: allTransactions,
      total_count: allTransactions.length
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in billing-history", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});