-- Fix security definer view issue (corrected)
-- Drop and recreate the view without security definer and without RLS policy

DROP VIEW IF EXISTS public.user_sessions_safe;

-- Create secure view without SECURITY DEFINER (uses caller's permissions)
CREATE VIEW public.user_sessions_safe AS
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

-- Grant access to authenticated users
GRANT SELECT ON public.user_sessions_safe TO authenticated;