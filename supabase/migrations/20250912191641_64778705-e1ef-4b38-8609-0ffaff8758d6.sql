-- Fix security issue in subscribers table RLS policies
-- Remove email-based access and use only user_id for proper security

-- First, let's make sure user_id is not nullable for security
ALTER TABLE public.subscribers ALTER COLUMN user_id SET NOT NULL;

-- Drop the existing insecure policies
DROP POLICY IF EXISTS "Users can update basic subscription info only" ON public.subscribers;
DROP POLICY IF EXISTS "select_own_subscription" ON public.subscribers;
DROP POLICY IF EXISTS "insert_subscription" ON public.subscribers;

-- Create secure policies that only use user_id
CREATE POLICY "Users can view their own subscription only" 
ON public.subscribers 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can update their own subscription only" 
ON public.subscribers 
FOR UPDATE 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can insert their own subscription only" 
ON public.subscribers 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

-- Still restrict DELETE operations for data integrity
-- No DELETE policy means DELETE is not allowed