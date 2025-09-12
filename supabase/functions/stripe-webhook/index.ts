import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://cdn.jsdelivr.net/npm/stripe@13.11.0/+esm";
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.38.4/+esm";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

// Helper logging function for enhanced debugging
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Use the service role key to perform writes in Supabase
  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Webhook received");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    if (!webhookSecret) throw new Error("STRIPE_WEBHOOK_SECRET is not set");
    
    logStep("Stripe keys verified");

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      throw new Error("No Stripe signature found");
    }

    // Verify the webhook signature
    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      logStep("Webhook signature verified", { eventType: event.type });
    } catch (err) {
      logStep("Webhook signature verification failed", { error: err.message });
      return new Response(`Webhook signature verification failed: ${err.message}`, {
        status: 400,
      });
    }

    // Handle the event
    switch (event.type) {
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        const subscriptionId = invoice.subscription;
        
        logStep("Processing successful payment", { 
          invoiceId: invoice.id, 
          subscriptionId 
        });

        if (subscriptionId) {
          // Get the subscription details
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const customerId = subscription.customer as string;
          
          // Get customer details
          const customer = await stripe.customers.retrieve(customerId);
          const customerEmail = customer.email;

          if (customerEmail) {
            // Find existing subscriber record by stripe_customer_id
            const { data: existingSubscriber } = await supabaseClient
              .from("subscribers")
              .select("user_id")
              .eq("stripe_customer_id", customerId)
              .single();

            if (existingSubscriber) {
              // Update subscriber status to active
              await supabaseClient.from("subscribers").upsert({
                user_id: existingSubscriber.user_id,
                stripe_customer_id: customerId,
                stripe_subscription_id: subscriptionId,
                subscription_status: subscription.status,
                subscribed: true,
                subscription_tier: 'Premium',
                subscription_end: new Date(subscription.current_period_end * 1000).toISOString(),
                updated_at: new Date().toISOString(),
              }, { onConflict: 'user_id' });

              logStep("Updated subscriber status to active", { 
                userId: existingSubscriber.user_id,
                subscriptionId 
              });
            } else {
              logStep("WARNING: No existing subscriber found for customer", { customerId, customerEmail });
            }
          }
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const customerId = subscription.customer as string;
        
        logStep("Processing subscription update", { 
          subscriptionId: subscription.id,
          status: subscription.status 
        });

        // Get customer details
        const customer = await stripe.customers.retrieve(customerId);
        const customerEmail = customer.email;

        if (customerEmail) {
          // Find existing subscriber record by stripe_customer_id
          const { data: existingSubscriber } = await supabaseClient
            .from("subscribers")
            .select("user_id")
            .eq("stripe_customer_id", customerId)
            .single();

          if (existingSubscriber) {
            await supabaseClient.from("subscribers").upsert({
              user_id: existingSubscriber.user_id,
              stripe_customer_id: customerId,
              stripe_subscription_id: subscription.id,
              subscription_status: subscription.status,
              subscribed: subscription.status === 'active',
              subscription_tier: subscription.status === 'active' ? 'Premium' : null,
              subscription_end: subscription.current_period_end 
                ? new Date(subscription.current_period_end * 1000).toISOString() 
                : null,
              updated_at: new Date().toISOString(),
            }, { onConflict: 'user_id' });

            logStep("Updated subscriber from subscription update", { 
              userId: existingSubscriber.user_id,
              status: subscription.status 
            });
          } else {
            logStep("WARNING: No existing subscriber found for customer", { customerId, customerEmail });
          }
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const customerId = subscription.customer as string;
        
        logStep("Processing subscription cancellation", { 
          subscriptionId: subscription.id 
        });

        // Get customer details
        const customer = await stripe.customers.retrieve(customerId);
        const customerEmail = customer.email;

        if (customerEmail) {
          // Find existing subscriber record by stripe_customer_id
          const { data: existingSubscriber } = await supabaseClient
            .from("subscribers")
            .select("user_id")
            .eq("stripe_customer_id", customerId)
            .single();

          if (existingSubscriber) {
            await supabaseClient.from("subscribers").upsert({
              user_id: existingSubscriber.user_id,
              stripe_customer_id: customerId,
              stripe_subscription_id: null,
              subscription_status: 'canceled',
              subscribed: false,
              subscription_tier: null,
              subscription_end: null,
              updated_at: new Date().toISOString(),
            }, { onConflict: 'user_id' });

            logStep("Updated subscriber status to canceled", { 
              userId: existingSubscriber.user_id
            });
          } else {
            logStep("WARNING: No existing subscriber found for customer", { customerId, customerEmail });
          }
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const subscriptionId = invoice.subscription;
        
        logStep("Processing failed payment", { 
          invoiceId: invoice.id, 
          subscriptionId 
        });

        if (subscriptionId) {
          // Get the subscription details
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const customerId = subscription.customer as string;
          
          // Get customer details
          const customer = await stripe.customers.retrieve(customerId);
          const customerEmail = customer.email;

          if (customerEmail) {
            // Find existing subscriber record by stripe_customer_id
            const { data: existingSubscriber } = await supabaseClient
              .from("subscribers")
              .select("user_id")
              .eq("stripe_customer_id", customerId)
              .single();

            if (existingSubscriber) {
              // If subscription is past due or unpaid, revoke access
              if (subscription.status === 'past_due' || subscription.status === 'unpaid') {
                await supabaseClient.from("subscribers").upsert({
                  user_id: existingSubscriber.user_id,
                  stripe_customer_id: customerId,
                  stripe_subscription_id: subscriptionId,
                  subscription_status: subscription.status,
                  subscribed: false, // Revoke access on payment failure
                  subscription_tier: null,
                  subscription_end: subscription.current_period_end 
                    ? new Date(subscription.current_period_end * 1000).toISOString() 
                    : null,
                  updated_at: new Date().toISOString(),
                }, { onConflict: 'user_id' });

                logStep("Revoked access due to payment failure", { 
                  userId: existingSubscriber.user_id,
                  status: subscription.status 
                });
              }
            } else {
              logStep("WARNING: No existing subscriber found for customer", { customerId, customerEmail });
            }
          }
        }
        break;
      }

      default:
        logStep("Unhandled event type", { eventType: event.type });
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in stripe webhook", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});