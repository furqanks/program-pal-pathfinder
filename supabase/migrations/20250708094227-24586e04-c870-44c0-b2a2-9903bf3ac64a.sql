-- Create user profiles table for extended user information
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  full_name TEXT,
  phone_number TEXT,
  time_zone TEXT DEFAULT 'UTC',
  language_preference TEXT DEFAULT 'en',
  education_level TEXT,
  target_application_year INTEGER,
  intended_major TEXT,
  country_of_origin TEXT,
  target_countries TEXT[],
  academic_achievements TEXT,
  theme_preference TEXT DEFAULT 'system',
  email_notifications BOOLEAN DEFAULT true,
  marketing_communications BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create usage tracking table
CREATE TABLE public.usage_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  feature_type TEXT NOT NULL,
  action_type TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create security logs table
CREATE TABLE public.security_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  location TEXT,
  success BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create user sessions table
CREATE TABLE public.user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_token TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  location TEXT,
  is_active BOOLEAN DEFAULT true,
  last_activity TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create support tickets table
CREATE TABLE public.support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'open',
  category TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create data export requests table
CREATE TABLE public.data_export_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  export_type TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  file_url TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_export_requests ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_profiles
CREATE POLICY "Users can view their own profile" 
ON public.user_profiles FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can update their own profile" 
ON public.user_profiles FOR UPDATE 
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own profile" 
ON public.user_profiles FOR INSERT 
WITH CHECK (user_id = auth.uid());

-- Create RLS policies for usage_tracking
CREATE POLICY "Users can view their own usage" 
ON public.usage_tracking FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "System can insert usage tracking" 
ON public.usage_tracking FOR INSERT 
WITH CHECK (true);

-- Create RLS policies for security_logs
CREATE POLICY "Users can view their own security logs" 
ON public.security_logs FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "System can insert security logs" 
ON public.security_logs FOR INSERT 
WITH CHECK (true);

-- Create RLS policies for user_sessions
CREATE POLICY "Users can view their own sessions" 
ON public.user_sessions FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can update their own sessions" 
ON public.user_sessions FOR UPDATE 
USING (user_id = auth.uid());

CREATE POLICY "System can manage sessions" 
ON public.user_sessions FOR ALL 
USING (true);

-- Create RLS policies for support_tickets
CREATE POLICY "Users can view their own tickets" 
ON public.support_tickets FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can create tickets" 
ON public.support_tickets FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own tickets" 
ON public.support_tickets FOR UPDATE 
USING (user_id = auth.uid());

-- Create RLS policies for data_export_requests
CREATE POLICY "Users can view their own export requests" 
ON public.data_export_requests FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can create export requests" 
ON public.data_export_requests FOR INSERT 
WITH CHECK (user_id = auth.uid());

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_profiles_updated_at
BEFORE UPDATE ON public.user_profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_support_tickets_updated_at
BEFORE UPDATE ON public.support_tickets
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_usage_tracking_user_created ON public.usage_tracking(user_id, created_at DESC);
CREATE INDEX idx_security_logs_user_created ON public.security_logs(user_id, created_at DESC);
CREATE INDEX idx_user_sessions_user_active ON public.user_sessions(user_id, is_active);
CREATE INDEX idx_support_tickets_user_status ON public.support_tickets(user_id, status);
CREATE INDEX idx_data_export_user_status ON public.data_export_requests(user_id, status);