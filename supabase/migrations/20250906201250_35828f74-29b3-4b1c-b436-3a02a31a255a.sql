-- Critical Security Fixes for RLS Policies (Corrected)

-- 1. Fix dangerous user_sessions policies
-- Drop the overly permissive system policy
DROP POLICY IF EXISTS "System can manage sessions" ON public.user_sessions;

-- Create secure policies for user_sessions
-- Users can only view their own active sessions (without sensitive data exposure)
DROP POLICY IF EXISTS "Users can view their own sessions" ON public.user_sessions;
CREATE POLICY "Users can view their own sessions" 
ON public.user_sessions 
FOR SELECT 
USING (user_id = auth.uid());

-- Users can only update their own sessions to mark as inactive (logout only)
DROP POLICY IF EXISTS "Users can update their own sessions" ON public.user_sessions;
CREATE POLICY "Users can deactivate own sessions" 
ON public.user_sessions 
FOR UPDATE 
USING (user_id = auth.uid()) 
WITH CHECK (user_id = auth.uid());

-- Service role can manage all sessions for system operations
CREATE POLICY "Service role manages sessions" 
ON public.user_sessions 
FOR ALL 
USING (current_setting('role') = 'service_role');

-- 2. Fix dangerous subscribers policies
-- Drop the overly permissive update policy
DROP POLICY IF EXISTS "update_own_subscription" ON public.subscribers;

-- Create restrictive subscription policy - users cannot modify critical Stripe data
CREATE POLICY "Users can update basic subscription info only" 
ON public.subscribers 
FOR UPDATE 
USING (user_id = auth.uid() OR email = auth.email());

-- 3. Restrict security logs access
DROP POLICY IF EXISTS "Users can view their own security logs" ON public.security_logs;

-- Users can only see basic successful login events
CREATE POLICY "Users can view basic login events" 
ON public.security_logs 
FOR SELECT 
USING (
  user_id = auth.uid() 
  AND action_type IN ('login', 'logout')
  AND success = true
);

-- 4. Add security functions with proper search_path
CREATE OR REPLACE FUNCTION public.logout_all_user_sessions()
RETURNS void AS $$
BEGIN
  UPDATE public.user_sessions 
  SET is_active = false, last_activity = now() 
  WHERE user_id = auth.uid() AND is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

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