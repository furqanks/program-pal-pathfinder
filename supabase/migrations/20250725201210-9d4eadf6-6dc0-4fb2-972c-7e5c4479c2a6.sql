-- Create a test user with premium subscription access
-- Note: This creates the subscription record only. The user account will need to be created through Supabase Auth.

-- Insert test user subscription record (assuming test user will be created)
-- We'll use a test email that you can sign up with
INSERT INTO public.subscribers (
  email,
  subscribed,
  subscription_tier,
  subscription_status,
  subscription_end,
  updated_at,
  created_at
) VALUES (
  'test@premium.com',
  true,
  'Premium',
  'active',
  (NOW() + INTERVAL '1 year'),  -- Set subscription to expire in 1 year
  NOW(),
  NOW()
) ON CONFLICT (email) DO UPDATE SET
  subscribed = true,
  subscription_tier = 'Premium',
  subscription_status = 'active',
  subscription_end = (NOW() + INTERVAL '1 year'),
  updated_at = NOW();