
-- First, drop existing policies that might conflict
DROP POLICY IF EXISTS "Users can view their own folders" ON public.note_folders;
DROP POLICY IF EXISTS "Users can create their own folders" ON public.note_folders;
DROP POLICY IF EXISTS "Users can update their own folders" ON public.note_folders;
DROP POLICY IF EXISTS "Users can delete their own folders" ON public.note_folders;

DROP POLICY IF EXISTS "Users can view their own templates and public ones" ON public.note_templates;
DROP POLICY IF EXISTS "Users can create their own templates" ON public.note_templates;
DROP POLICY IF EXISTS "Users can update their own templates" ON public.note_templates;
DROP POLICY IF EXISTS "Users can delete their own templates" ON public.note_templates;

DROP POLICY IF EXISTS "Users can view relevant collaborations" ON public.note_collaborations;
DROP POLICY IF EXISTS "Note owners can manage collaborations" ON public.note_collaborations;
DROP POLICY IF EXISTS "Users can view collaborations for their notes or where they're invited" ON public.note_collaborations;

DROP POLICY IF EXISTS "Users can view their own insights" ON public.ai_insights;
DROP POLICY IF EXISTS "Users can create their own insights" ON public.ai_insights;
DROP POLICY IF EXISTS "Users can update their own insights" ON public.ai_insights;
DROP POLICY IF EXISTS "Users can delete their own insights" ON public.ai_insights;

DROP POLICY IF EXISTS "Users can view their own reminders" ON public.smart_reminders;
DROP POLICY IF EXISTS "Users can create their own reminders" ON public.smart_reminders;
DROP POLICY IF EXISTS "Users can update their own reminders" ON public.smart_reminders;
DROP POLICY IF EXISTS "Users can delete their own reminders" ON public.smart_reminders;

-- Drop any existing problematic ai_notes policies
DROP POLICY IF EXISTS "Users can view their own notes or shared notes" ON public.ai_notes;
DROP POLICY IF EXISTS "Users can update their own notes or notes they have write access to" ON public.ai_notes;
DROP POLICY IF EXISTS "Users can view accessible notes" ON public.ai_notes;
DROP POLICY IF EXISTS "Users can update accessible notes" ON public.ai_notes;
DROP POLICY IF EXISTS "Users can create their own notes" ON public.ai_notes;
DROP POLICY IF EXISTS "Users can delete their own notes" ON public.ai_notes;

-- Create the security definer function for collaboration access
CREATE OR REPLACE FUNCTION public.can_access_note(note_id uuid, user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.ai_notes 
    WHERE id = note_id AND ai_notes.user_id = can_access_note.user_id
  ) OR EXISTS (
    SELECT 1 FROM public.note_collaborations 
    WHERE note_collaborations.note_id = can_access_note.note_id 
    AND note_collaborations.user_id = can_access_note.user_id 
    AND accepted_at IS NOT NULL
  );
$$;

-- Create new RLS policies for ai_notes
CREATE POLICY "Users can view accessible notes" 
  ON public.ai_notes 
  FOR SELECT 
  USING (
    user_id = auth.uid() OR 
    auth.uid() = ANY(shared_with) OR
    public.can_access_note(id, auth.uid())
  );

CREATE POLICY "Users can update accessible notes" 
  ON public.ai_notes 
  FOR UPDATE 
  USING (
    user_id = auth.uid() OR
    public.can_access_note(id, auth.uid())
  );

CREATE POLICY "Users can create their own notes" 
  ON public.ai_notes 
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own notes" 
  ON public.ai_notes 
  FOR DELETE 
  USING (user_id = auth.uid());

-- Create RLS policies for note_folders
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

-- Create RLS policies for note_templates
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

-- Create RLS policies for note_collaborations
CREATE POLICY "Users can view relevant collaborations" 
  ON public.note_collaborations 
  FOR SELECT 
  USING (
    user_id = auth.uid() OR 
    invited_by = auth.uid()
  );

CREATE POLICY "Note owners can manage collaborations" 
  ON public.note_collaborations 
  FOR ALL 
  USING (
    invited_by = auth.uid()
  );

-- Create RLS policies for ai_insights
CREATE POLICY "Users can view their own insights" 
  ON public.ai_insights 
  FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own insights" 
  ON public.ai_insights 
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own insights" 
  ON public.ai_insights 
  FOR UPDATE 
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own insights" 
  ON public.ai_insights 
  FOR DELETE 
  USING (user_id = auth.uid());

-- Create RLS policies for smart_reminders
CREATE POLICY "Users can view their own reminders" 
  ON public.smart_reminders 
  FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own reminders" 
  ON public.smart_reminders 
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own reminders" 
  ON public.smart_reminders 
  FOR UPDATE 
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own reminders" 
  ON public.smart_reminders 
  FOR DELETE 
  USING (user_id = auth.uid());
