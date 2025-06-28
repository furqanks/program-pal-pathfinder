
-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own documents" ON public.user_documents;
DROP POLICY IF EXISTS "Users can create their own documents" ON public.user_documents;
DROP POLICY IF EXISTS "Users can update their own documents" ON public.user_documents;
DROP POLICY IF EXISTS "Users can delete their own documents" ON public.user_documents;

-- Enable Row Level Security on user_documents table (safe if already enabled)
ALTER TABLE public.user_documents ENABLE ROW LEVEL SECURITY;

-- Create policy that allows users to view their own documents
CREATE POLICY "Users can view their own documents" 
  ON public.user_documents 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Create policy that allows users to insert their own documents
CREATE POLICY "Users can create their own documents" 
  ON public.user_documents 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create policy that allows users to update their own documents
CREATE POLICY "Users can update their own documents" 
  ON public.user_documents 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create policy that allows users to delete their own documents
CREATE POLICY "Users can delete their own documents" 
  ON public.user_documents 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Add missing columns that are referenced in the code but don't exist in the table
ALTER TABLE public.user_documents 
ADD COLUMN IF NOT EXISTS quoted_improvements jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS score integer DEFAULT NULL;
