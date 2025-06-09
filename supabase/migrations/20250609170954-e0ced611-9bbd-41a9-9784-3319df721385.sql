
-- First, let's enhance the ai_notes table to support all the features we need
ALTER TABLE public.ai_notes 
ADD COLUMN IF NOT EXISTS rich_content jsonb,
ADD COLUMN IF NOT EXISTS attachments jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS is_archived boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS is_pinned boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS shared_with uuid[],
ADD COLUMN IF NOT EXISTS folder_id uuid,
ADD COLUMN IF NOT EXISTS last_viewed_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS view_count integer DEFAULT 0;

-- Create folders table for organization
CREATE TABLE IF NOT EXISTS public.note_folders (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  name text NOT NULL,
  color text DEFAULT '#6366f1',
  parent_id uuid REFERENCES public.note_folders(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create note templates table
CREATE TABLE IF NOT EXISTS public.note_templates (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  template_content jsonb NOT NULL,
  is_public boolean DEFAULT false,
  category text DEFAULT 'general',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create note collaborations table
CREATE TABLE IF NOT EXISTS public.note_collaborations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  note_id uuid NOT NULL REFERENCES public.ai_notes(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  permission text NOT NULL CHECK (permission IN ('read', 'write', 'admin')),
  invited_by uuid,
  accepted_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Add foreign key for folder_id
ALTER TABLE public.ai_notes 
ADD CONSTRAINT fk_note_folder 
FOREIGN KEY (folder_id) REFERENCES public.note_folders(id) ON DELETE SET NULL;

-- Enable RLS on new tables
ALTER TABLE public.note_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.note_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.note_collaborations ENABLE ROW LEVEL SECURITY;

-- RLS policies for note_folders
CREATE POLICY "Users can view their own folders" 
  ON public.note_folders 
  FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own folders" 
  ON public.note_folders 
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own folders" 
  ON public.note_folders 
  FOR UPDATE 
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own folders" 
  ON public.note_folders 
  FOR DELETE 
  USING (user_id = auth.uid());

-- RLS policies for note_templates
CREATE POLICY "Users can view their own templates and public ones" 
  ON public.note_templates 
  FOR SELECT 
  USING (user_id = auth.uid() OR is_public = true);

CREATE POLICY "Users can create their own templates" 
  ON public.note_templates 
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own templates" 
  ON public.note_templates 
  FOR UPDATE 
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own templates" 
  ON public.note_templates 
  FOR DELETE 
  USING (user_id = auth.uid());

-- RLS policies for note_collaborations
CREATE POLICY "Users can view collaborations for their notes or where they're invited" 
  ON public.note_collaborations 
  FOR SELECT 
  USING (
    user_id = auth.uid() OR 
    invited_by = auth.uid() OR
    note_id IN (SELECT id FROM public.ai_notes WHERE user_id = auth.uid())
  );

CREATE POLICY "Note owners can manage collaborations" 
  ON public.note_collaborations 
  FOR ALL 
  USING (
    note_id IN (SELECT id FROM public.ai_notes WHERE user_id = auth.uid())
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_note_folders_user_id ON public.note_folders(user_id);
CREATE INDEX IF NOT EXISTS idx_note_folders_parent_id ON public.note_folders(parent_id);
CREATE INDEX IF NOT EXISTS idx_note_templates_user_id ON public.note_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_note_templates_category ON public.note_templates(category);
CREATE INDEX IF NOT EXISTS idx_note_collaborations_note_id ON public.note_collaborations(note_id);
CREATE INDEX IF NOT EXISTS idx_note_collaborations_user_id ON public.note_collaborations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_notes_folder_id ON public.ai_notes(folder_id);
CREATE INDEX IF NOT EXISTS idx_ai_notes_archived ON public.ai_notes(is_archived);
CREATE INDEX IF NOT EXISTS idx_ai_notes_pinned ON public.ai_notes(is_pinned);

-- Create trigger for updating updated_at on note_folders
CREATE OR REPLACE TRIGGER update_note_folders_updated_at
  BEFORE UPDATE ON public.note_folders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for updating updated_at on note_templates
CREATE OR REPLACE TRIGGER update_note_templates_updated_at
  BEFORE UPDATE ON public.note_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Update existing ai_notes to have enhanced RLS policies for collaboration
DROP POLICY IF EXISTS "Users can view their own notes" ON public.ai_notes;
CREATE POLICY "Users can view their own notes or shared notes" 
  ON public.ai_notes 
  FOR SELECT 
  USING (
    user_id = auth.uid() OR 
    auth.uid() = ANY(shared_with) OR
    id IN (
      SELECT note_id FROM public.note_collaborations 
      WHERE user_id = auth.uid() AND accepted_at IS NOT NULL
    )
  );

DROP POLICY IF EXISTS "Users can update their own notes" ON public.ai_notes;
CREATE POLICY "Users can update their own notes or notes they have write access to" 
  ON public.ai_notes 
  FOR UPDATE 
  USING (
    user_id = auth.uid() OR 
    id IN (
      SELECT note_id FROM public.note_collaborations 
      WHERE user_id = auth.uid() AND permission IN ('write', 'admin') AND accepted_at IS NOT NULL
    )
  );
