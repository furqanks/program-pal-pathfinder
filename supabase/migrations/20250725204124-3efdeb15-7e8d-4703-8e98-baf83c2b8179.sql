-- First, let's create a test subscription for the user directly in our database
-- This bypasses Stripe rate limits for testing purposes

INSERT INTO public.subscribers (
  email,
  user_id,
  stripe_customer_id,
  stripe_subscription_id,
  subscription_status,
  subscribed,
  subscription_tier,
  subscription_end,
  updated_at
) VALUES (
  'test@premium.com',
  '78458783-eda6-44a8-8607-f33b4d0079ae',
  'cus_SkN3jXle5KYBiI',
  'sub_test_premium_access',
  'active',
  true,
  'Premium',
  (now() + interval '1 year'),
  now()
)
ON CONFLICT (email) 
DO UPDATE SET
  subscribed = true,
  subscription_status = 'active',
  subscription_tier = 'Premium',
  subscription_end = (now() + interval '1 year'),
  updated_at = now();