-- Security improvements for subscribers table
-- Remove redundant email field and add audit logging for sensitive payment data

-- Step 1: Remove email field (redundant since we have user_id)
-- Email can be retrieved from auth.users when needed via user_id
ALTER TABLE public.subscribers DROP COLUMN IF EXISTS email;

-- Step 2: Add comments to classify sensitive data
COMMENT ON TABLE public.subscribers IS 'Contains sensitive payment and subscription data - access restricted by RLS';
COMMENT ON COLUMN public.subscribers.stripe_customer_id IS 'SENSITIVE: Stripe customer identifier - PII/Financial data';
COMMENT ON COLUMN public.subscribers.stripe_subscription_id IS 'SENSITIVE: Stripe subscription identifier - Financial data';
COMMENT ON COLUMN public.subscribers.user_id IS 'Links to auth.users - access control field';

-- Step 3: Create audit log table for sensitive operations
CREATE TABLE IF NOT EXISTS public.subscription_audit_log (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    action_type text NOT NULL, -- 'created', 'updated', 'cancelled', etc.
    old_values jsonb,
    new_values jsonb,
    stripe_event_id text,
    ip_address inet,
    user_agent text,
    created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE public.subscription_audit_log ENABLE ROW LEVEL SECURITY;

-- Only service role can insert audit logs, users can view their own
CREATE POLICY "Service role can insert audit logs" 
ON public.subscription_audit_log 
FOR INSERT 
WITH CHECK (current_setting('role') = 'service_role');

CREATE POLICY "Users can view their own audit logs" 
ON public.subscription_audit_log 
FOR SELECT 
USING (user_id = auth.uid());

-- Step 4: Create audit trigger for subscribers table
CREATE OR REPLACE FUNCTION public.audit_subscription_changes()
RETURNS trigger AS $$
BEGIN
    -- Only log changes to sensitive fields
    IF TG_OP = 'UPDATE' AND (
        OLD.stripe_customer_id IS DISTINCT FROM NEW.stripe_customer_id OR
        OLD.stripe_subscription_id IS DISTINCT FROM NEW.stripe_subscription_id OR
        OLD.subscription_status IS DISTINCT FROM NEW.subscription_status
    ) THEN
        INSERT INTO public.subscription_audit_log (
            user_id,
            action_type,
            old_values,
            new_values
        ) VALUES (
            NEW.user_id,
            'subscription_updated',
            jsonb_build_object(
                'stripe_customer_id', OLD.stripe_customer_id,
                'stripe_subscription_id', OLD.stripe_subscription_id,
                'subscription_status', OLD.subscription_status
            ),
            jsonb_build_object(
                'stripe_customer_id', NEW.stripe_customer_id,
                'stripe_subscription_id', NEW.stripe_subscription_id,
                'subscription_status', NEW.subscription_status
            )
        );
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO public.subscription_audit_log (
            user_id,
            action_type,
            new_values
        ) VALUES (
            NEW.user_id,
            'subscription_created',
            jsonb_build_object(
                'stripe_customer_id', NEW.stripe_customer_id,
                'stripe_subscription_id', NEW.stripe_subscription_id,
                'subscription_status', NEW.subscription_status
            )
        );
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create the trigger
DROP TRIGGER IF EXISTS audit_subscription_changes ON public.subscribers;
CREATE TRIGGER audit_subscription_changes
    AFTER INSERT OR UPDATE ON public.subscribers
    FOR EACH ROW EXECUTE FUNCTION public.audit_subscription_changes();

-- Step 5: Add indexes for better performance on sensitive queries
CREATE INDEX IF NOT EXISTS idx_subscribers_user_id_active 
ON public.subscribers(user_id) WHERE subscription_status = 'active';

-- Add retention policy comment (implement separately via cron job)
COMMENT ON TABLE public.subscription_audit_log IS 'Audit log for sensitive subscription data changes - consider 7-year retention for compliance';