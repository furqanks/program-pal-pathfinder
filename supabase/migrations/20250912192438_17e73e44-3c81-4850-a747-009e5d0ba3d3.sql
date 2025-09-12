-- Security improvements for user_sessions table (Fixed version)
-- Encrypt session tokens and hash IP addresses for privacy

-- Step 1: Add new encrypted columns and session security features
ALTER TABLE public.user_sessions 
ADD COLUMN IF NOT EXISTS session_token_hash text,
ADD COLUMN IF NOT EXISTS ip_hash text,
ADD COLUMN IF NOT EXISTS expires_at timestamp with time zone DEFAULT (now() + interval '30 days'),
ADD COLUMN IF NOT EXISTS last_rotation timestamp with time zone DEFAULT now(),
ADD COLUMN IF NOT EXISTS device_fingerprint text,
ADD COLUMN IF NOT EXISTS login_attempts integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS locked_until timestamp with time zone;

-- Step 2: Add comments for sensitive data classification
COMMENT ON TABLE public.user_sessions IS 'Contains encrypted session data and hashed IP addresses - access restricted by RLS';
COMMENT ON COLUMN public.user_sessions.session_token IS 'DEPRECATED: Use session_token_hash instead - will be removed';
COMMENT ON COLUMN public.user_sessions.session_token_hash IS 'SENSITIVE: SHA-256 hash of session token';
COMMENT ON COLUMN public.user_sessions.ip_address IS 'DEPRECATED: Use ip_hash instead - will be removed';
COMMENT ON COLUMN public.user_sessions.ip_hash IS 'SENSITIVE: SHA-256 hash of IP address for privacy';

-- Step 3: Create secure session management functions
CREATE OR REPLACE FUNCTION public.hash_ip_address(ip_text text)
RETURNS text AS $$
BEGIN
  -- Hash IP address with a salt for privacy while maintaining uniqueness
  RETURN encode(digest(ip_text || 'session_salt_2024', 'sha256'), 'hex');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.hash_session_token(token_text text)
RETURNS text AS $$
BEGIN
  -- Hash session token for secure storage
  RETURN encode(digest(token_text, 'sha256'), 'hex');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Step 4: Create function to clean expired sessions
CREATE OR REPLACE FUNCTION public.cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
  -- Deactivate expired sessions
  UPDATE public.user_sessions 
  SET is_active = false 
  WHERE expires_at < now() AND is_active = true;
  
  -- Delete old inactive sessions (older than 90 days)
  DELETE FROM public.user_sessions 
  WHERE is_active = false 
    AND created_at < now() - interval '90 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Step 5: Update session activity function to use hashed tokens (Fixed syntax)
CREATE OR REPLACE FUNCTION public.update_session_activity_secure(token_hash text)
RETURNS boolean AS $$
DECLARE
  affected_rows integer;
BEGIN
  UPDATE public.user_sessions 
  SET last_activity = now(),
      last_rotation = CASE 
        WHEN last_rotation < now() - interval '24 hours' THEN now()
        ELSE last_rotation
      END
  WHERE session_token_hash = token_hash 
    AND user_id = auth.uid() 
    AND is_active = true
    AND expires_at > now();
  
  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  RETURN affected_rows > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Step 6: Create function to invalidate sessions by user
CREATE OR REPLACE FUNCTION public.invalidate_user_sessions(target_user_id uuid DEFAULT auth.uid())
RETURNS integer AS $$
DECLARE
  affected_count integer;
BEGIN
  UPDATE public.user_sessions 
  SET is_active = false, 
      expires_at = now()
  WHERE user_id = target_user_id 
    AND is_active = true;
  
  GET DIAGNOSTICS affected_count = ROW_COUNT;
  RETURN affected_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Step 7: Add indexes for performance and security
CREATE INDEX IF NOT EXISTS idx_user_sessions_token_hash 
ON public.user_sessions(session_token_hash) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_user_sessions_ip_hash_active 
ON public.user_sessions(ip_hash, user_id) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at 
ON public.user_sessions(expires_at) WHERE is_active = true;

-- Step 8: Add session security constraints
ALTER TABLE public.user_sessions 
ADD CONSTRAINT IF NOT EXISTS check_session_expiry CHECK (expires_at > created_at);

-- Step 9: Create view for safe session display (privacy-preserving)
CREATE OR REPLACE VIEW public.user_sessions_safe AS
SELECT 
  id,
  user_id,
  CASE 
    WHEN ip_hash IS NOT NULL THEN 'Hidden for privacy'
    ELSE substring(ip_address::text, 1, 3) || '.xxx.xxx.xxx'
  END as ip_display,
  CASE 
    WHEN user_agent IS NOT NULL THEN 
      CASE 
        WHEN user_agent LIKE '%Chrome%' THEN 'Chrome Browser'
        WHEN user_agent LIKE '%Firefox%' THEN 'Firefox Browser'
        WHEN user_agent LIKE '%Safari%' THEN 'Safari Browser'
        WHEN user_agent LIKE '%Edge%' THEN 'Edge Browser'
        ELSE 'Unknown Browser'
      END
    ELSE 'Unknown'
  END as browser_display,
  location,
  is_active,
  last_activity,
  created_at,
  expires_at,
  CASE 
    WHEN expires_at < now() THEN true
    ELSE false
  END as is_expired
FROM public.user_sessions
WHERE user_id = auth.uid();

-- Grant access to the safe view
GRANT SELECT ON public.user_sessions_safe TO authenticated;