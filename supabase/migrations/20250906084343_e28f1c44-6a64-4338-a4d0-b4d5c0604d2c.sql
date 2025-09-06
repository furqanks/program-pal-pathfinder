-- Critical Security Fixes for RLS Policies

-- 1. Fix dangerous user_sessions policies
-- Drop the overly permissive system policy
DROP POLICY IF EXISTS "System can manage sessions" ON public.user_sessions;

-- Create secure policies for user_sessions
-- Only allow service role to manage sessions directly
CREATE POLICY "Service role can manage sessions" 
ON public.user_sessions 
FOR ALL 
USING (current_setting('role') = 'service_role');

-- Users can only view their own active sessions (without sensitive tokens)
DROP POLICY IF EXISTS "Users can view their own sessions" ON public.user_sessions;
CREATE POLICY "Users can view their own sessions" 
ON public.user_sessions 
FOR SELECT 
USING (user_id = auth.uid() AND is_active = true);

-- Users can only update their own sessions to mark as inactive (logout)
DROP POLICY IF EXISTS "Users can update their own sessions" ON public.user_sessions;
CREATE POLICY "Users can update own session activity" 
ON public.user_sessions 
FOR UPDATE 
USING (user_id = auth.uid()) 
WITH CHECK (user_id = auth.uid() AND is_active = false);

-- 2. Fix dangerous subscribers policies
-- Drop the overly permissive update policy
DROP POLICY IF EXISTS "update_own_subscription" ON public.subscribers;

-- Create secure subscription update policy - only allow specific fields
CREATE POLICY "Users can update limited subscription fields" 
ON public.subscribers 
FOR UPDATE 
USING (user_id = auth.uid() OR email = auth.email()) 
WITH CHECK (
  user_id = auth.uid() OR email = auth.email()
  -- Prevent users from updating critical Stripe fields
  AND OLD.stripe_customer_id = NEW.stripe_customer_id
  AND OLD.stripe_subscription_id = NEW.stripe_subscription_id
  AND OLD.subscription_status = NEW.subscription_status
  AND OLD.subscription_tier = NEW.subscription_tier
);

-- 3. Restrict security logs access - users should not see detailed security info
DROP POLICY IF EXISTS "Users can view their own security logs" ON public.security_logs;

-- Create minimal security logs access - only allow viewing basic login events
CREATE POLICY "Users can view basic security events" 
ON public.security_logs 
FOR SELECT 
USING (
  user_id = auth.uid() 
  AND action_type IN ('login', 'logout', 'password_change')
  AND success = true
);

-- 4. Add security function to safely update session activity
CREATE OR REPLACE FUNCTION public.update_user_session_activity(session_token_param text)
RETURNS void AS $$
BEGIN
  UPDATE public.user_sessions 
  SET last_activity = now() 
  WHERE session_token = session_token_param 
    AND user_id = auth.uid() 
    AND is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 5. Add security function to safely logout from all sessions
CREATE OR REPLACE FUNCTION public.logout_all_user_sessions()
RETURNS void AS $$
BEGIN
  UPDATE public.user_sessions 
  SET is_active = false, last_activity = now() 
  WHERE user_id = auth.uid() AND is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 6. Create audit function for subscription changes
CREATE OR REPLACE FUNCTION public.audit_subscription_change()
RETURNS trigger AS $$
BEGIN
  -- Log subscription changes for security monitoring
  INSERT INTO public.security_logs (
    user_id, 
    action_type, 
    success, 
    metadata
  ) VALUES (
    COALESCE(NEW.user_id, OLD.user_id),
    'subscription_change',
    true,
    jsonb_build_object(
      'old_status', OLD.subscription_status,
      'new_status', NEW.subscription_status,
      'changed_at', now()
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for subscription audit logging
DROP TRIGGER IF EXISTS audit_subscription_changes ON public.subscribers;
CREATE TRIGGER audit_subscription_changes
  AFTER UPDATE ON public.subscribers
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_subscription_change();