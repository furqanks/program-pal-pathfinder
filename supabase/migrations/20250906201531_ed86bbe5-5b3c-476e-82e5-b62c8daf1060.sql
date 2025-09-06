-- Fix remaining database functions with proper search_path

-- Update existing functions to have proper search_path security
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.can_access_note(note_id uuid, user_id uuid)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.ai_notes 
    WHERE id = note_id AND ai_notes.user_id = can_access_note.user_id
  ) OR EXISTS (
    SELECT 1 FROM public.note_collaborations 
    WHERE note_collaborations.note_id = can_access_note.note_id 
    AND note_collaborations.user_id = can_access_note.user_id 
    AND accepted_at IS NOT NULL
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.get_next_version_number(p_user_id uuid, p_document_type text, p_program_id uuid)
RETURNS integer AS $$
DECLARE
  next_version INTEGER;
BEGIN
  SELECT COALESCE(MAX(version_number), 0) + 1 INTO next_version
  FROM public.user_documents
  WHERE user_id = p_user_id 
    AND document_type = p_document_type
    AND (program_id = p_program_id OR (p_program_id IS NULL AND program_id IS NULL));
  
  RETURN next_version;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;