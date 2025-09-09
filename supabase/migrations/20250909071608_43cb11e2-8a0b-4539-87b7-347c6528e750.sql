-- Create API usage tracking table for rate limiting
CREATE TABLE IF NOT EXISTS public.api_usage (
  user_id UUID NOT NULL,
  endpoint TEXT NOT NULL,
  day DATE NOT NULL DEFAULT CURRENT_DATE,
  count INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, endpoint, day),
  CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE public.api_usage ENABLE ROW LEVEL SECURITY;

-- Create policy for users to manage their own usage
CREATE POLICY "Users can manage own usage" ON public.api_usage
  FOR ALL USING (auth.uid() = user_id) 
  WITH CHECK (auth.uid() = user_id);