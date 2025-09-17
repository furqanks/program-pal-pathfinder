-- Drop the existing security definer view
DROP VIEW IF EXISTS public.user_sessions_safe;

-- Recreate the view as SECURITY INVOKER (default) to respect RLS policies
CREATE VIEW public.user_sessions_safe AS
SELECT 
  user_sessions.id,
  user_sessions.user_id,
  CASE
    WHEN (user_sessions.ip_hash IS NOT NULL) THEN 'Hidden for privacy'::text
    ELSE (substring((user_sessions.ip_address)::text, 1, 3) || '.xxx.xxx.xxx'::text)
  END AS ip_display,
  CASE
    WHEN (user_sessions.user_agent IS NOT NULL) THEN
      CASE
        WHEN (user_sessions.user_agent ~~ '%Chrome%'::text) THEN 'Chrome Browser'::text
        WHEN (user_sessions.user_agent ~~ '%Firefox%'::text) THEN 'Firefox Browser'::text
        WHEN (user_sessions.user_agent ~~ '%Safari%'::text) THEN 'Safari Browser'::text
        WHEN (user_sessions.user_agent ~~ '%Edge%'::text) THEN 'Edge Browser'::text
        ELSE 'Unknown Browser'::text
      END
    ELSE 'Unknown'::text
  END AS browser_display,
  user_sessions.location,
  user_sessions.is_active,
  user_sessions.last_activity,
  user_sessions.created_at,
  user_sessions.expires_at,
  CASE
    WHEN (user_sessions.expires_at < now()) THEN true
    ELSE false
  END AS is_expired
FROM user_sessions
WHERE (user_sessions.user_id = auth.uid());

-- Enable RLS on the view (views inherit RLS from underlying tables by default, but being explicit)
ALTER VIEW public.user_sessions_safe SET (security_invoker = on);