-- Update subscribers table to include Stripe subscription tracking fields
ALTER TABLE public.subscribers 
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive';

-- Create index for faster lookups by subscription ID
CREATE INDEX IF NOT EXISTS idx_subscribers_stripe_subscription_id 
ON public.subscribers(stripe_subscription_id);

-- Create index for faster lookups by subscription status
CREATE INDEX IF NOT EXISTS idx_subscribers_subscription_status 
ON public.subscribers(subscription_status);