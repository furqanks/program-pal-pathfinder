-- Add content_json column to user_documents table for rich text editor support
ALTER TABLE public.user_documents 
ADD COLUMN IF NOT EXISTS content_json JSONB DEFAULT '{"type": "doc", "content": [{"type": "paragraph"}]}'::jsonb;

-- Update existing documents with null content_json to have empty doc structure
UPDATE public.user_documents 
SET content_json = '{"type": "doc", "content": [{"type": "paragraph"}]}'::jsonb
WHERE content_json IS NULL;