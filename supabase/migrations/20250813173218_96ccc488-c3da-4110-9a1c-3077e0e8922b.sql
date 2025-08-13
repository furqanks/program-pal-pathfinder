-- Phase 3: Collaborative Features & Version Management Tables
CREATE TABLE IF NOT EXISTS public.document_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID NOT NULL REFERENCES public.user_documents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  version_number INTEGER NOT NULL,
  content_raw TEXT NOT NULL,
  change_summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_branch BOOLEAN DEFAULT false,
  branch_name TEXT,
  parent_version_id UUID REFERENCES public.document_versions(id),
  UNIQUE(document_id, version_number)
);

CREATE TABLE IF NOT EXISTS public.document_collaborations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID NOT NULL REFERENCES public.user_documents(id) ON DELETE CASCADE,
  collaborator_id UUID NOT NULL,
  invited_by UUID NOT NULL,
  permission_level TEXT NOT NULL CHECK (permission_level IN ('view', 'comment', 'edit')),
  invited_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  UNIQUE(document_id, collaborator_id)
);

CREATE TABLE IF NOT EXISTS public.document_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID NOT NULL REFERENCES public.user_documents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  position_start INTEGER,
  position_end INTEGER,
  is_resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  parent_comment_id UUID REFERENCES public.document_comments(id)
);

-- Phase 4: Analytics & Progress Tracking Tables
CREATE TABLE IF NOT EXISTS public.document_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  document_id UUID NOT NULL REFERENCES public.user_documents(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.writing_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  document_id UUID NOT NULL REFERENCES public.user_documents(id) ON DELETE CASCADE,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE,
  word_count_start INTEGER DEFAULT 0,
  word_count_end INTEGER DEFAULT 0,
  keystrokes INTEGER DEFAULT 0,
  time_spent_seconds INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.document_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  document_type TEXT NOT NULL,
  content TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  created_by UUID NOT NULL,
  category TEXT DEFAULT 'general',
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_collaborations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.writing_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for document_versions
CREATE POLICY "Users can view versions of their documents" ON public.document_versions
  FOR SELECT USING (
    user_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM public.user_documents ud 
      WHERE ud.id = document_versions.document_id AND ud.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create versions of their documents" ON public.document_versions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_documents ud 
      WHERE ud.id = document_versions.document_id AND ud.user_id = auth.uid()
    )
  );

-- RLS Policies for document_collaborations
CREATE POLICY "Users can view collaborations on their documents" ON public.document_collaborations
  FOR SELECT USING (
    collaborator_id = auth.uid() OR 
    invited_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.user_documents ud 
      WHERE ud.id = document_collaborations.document_id AND ud.user_id = auth.uid()
    )
  );

CREATE POLICY "Document owners can manage collaborations" ON public.document_collaborations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_documents ud 
      WHERE ud.id = document_collaborations.document_id AND ud.user_id = auth.uid()
    )
  );

-- RLS Policies for document_comments
CREATE POLICY "Users can view comments on accessible documents" ON public.document_comments
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.user_documents ud 
      WHERE ud.id = document_comments.document_id AND ud.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.document_collaborations dc 
      WHERE dc.document_id = document_comments.document_id 
      AND dc.collaborator_id = auth.uid() 
      AND dc.status = 'accepted'
    )
  );

CREATE POLICY "Users can create comments on accessible documents" ON public.document_comments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_documents ud 
      WHERE ud.id = document_comments.document_id AND ud.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.document_collaborations dc 
      WHERE dc.document_id = document_comments.document_id 
      AND dc.collaborator_id = auth.uid() 
      AND dc.status = 'accepted'
      AND dc.permission_level IN ('comment', 'edit')
    )
  );

-- RLS Policies for analytics and sessions
CREATE POLICY "Users can view their own analytics" ON public.document_analytics
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own writing sessions" ON public.writing_sessions
  FOR ALL USING (user_id = auth.uid());

-- RLS Policies for templates
CREATE POLICY "Users can view public templates and their own" ON public.document_templates
  FOR SELECT USING (is_public = true OR created_by = auth.uid());

CREATE POLICY "Users can create their own templates" ON public.document_templates
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their own templates" ON public.document_templates
  FOR UPDATE USING (created_by = auth.uid());

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_document_versions_document_id ON public.document_versions(document_id);
CREATE INDEX IF NOT EXISTS idx_document_collaborations_document_id ON public.document_collaborations(document_id);
CREATE INDEX IF NOT EXISTS idx_document_comments_document_id ON public.document_comments(document_id);
CREATE INDEX IF NOT EXISTS idx_document_analytics_user_id ON public.document_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_writing_sessions_user_id ON public.writing_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_document_templates_document_type ON public.document_templates(document_type);

-- Triggers for updated_at
CREATE TRIGGER update_document_comments_updated_at
  BEFORE UPDATE ON public.document_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_document_templates_updated_at
  BEFORE UPDATE ON public.document_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();