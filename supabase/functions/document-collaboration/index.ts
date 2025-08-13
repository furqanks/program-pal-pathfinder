import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_ANON_KEY') ?? '',
);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, documentId, userId, ...params } = await req.json();
    
    let result;
    
    switch (action) {
      case 'create_shareable_link':
        result = await createShareableLink(documentId, userId, params.permissionLevel);
        break;
      case 'invite_collaborator':
        result = await inviteCollaborator(documentId, userId, params.collaboratorEmail, params.permissionLevel);
        break;
      case 'accept_collaboration':
        result = await acceptCollaboration(params.collaborationId, userId);
        break;
      case 'add_comment':
        result = await addComment(documentId, userId, params.content, params.positionStart, params.positionEnd);
        break;
      case 'resolve_comment':
        result = await resolveComment(params.commentId, userId);
        break;
      case 'get_document_activity':
        result = await getDocumentActivity(documentId, userId);
        break;
      case 'create_version':
        result = await createDocumentVersion(documentId, userId, params.content, params.changeSummary);
        break;
      case 'compare_versions':
        result = await compareVersions(params.versionId1, params.versionId2);
        break;
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Collaboration error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function createShareableLink(documentId: string, userId: string, permissionLevel: string) {
  // Verify user owns the document
  const { data: document, error: docError } = await supabase
    .from('user_documents')
    .select('*')
    .eq('id', documentId)
    .eq('user_id', userId)
    .single();

  if (docError || !document) {
    throw new Error('Document not found or access denied');
  }

  // Generate shareable token (simplified - in production, use proper token generation)
  const shareToken = crypto.randomUUID();
  
  // Store the share configuration (you'd add a shares table in real implementation)
  const shareableLink = `${Deno.env.get('SUPABASE_URL')}/documents/shared/${shareToken}`;
  
  return {
    shareableLink,
    permissionLevel,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
  };
}

async function inviteCollaborator(documentId: string, inviterId: string, collaboratorEmail: string, permissionLevel: string) {
  // Create collaboration invitation
  const { data, error } = await supabase
    .from('document_collaborations')
    .insert({
      document_id: documentId,
      collaborator_id: collaboratorEmail, // In real app, look up user by email
      invited_by: inviterId,
      permission_level: permissionLevel,
      status: 'pending'
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create collaboration: ${error.message}`);
  }

  // In real implementation, send email notification here
  
  return {
    invitation: data,
    message: `Invitation sent to ${collaboratorEmail}`
  };
}

async function acceptCollaboration(collaborationId: string, userId: string) {
  const { data, error } = await supabase
    .from('document_collaborations')
    .update({
      status: 'accepted',
      accepted_at: new Date().toISOString()
    })
    .eq('id', collaborationId)
    .eq('collaborator_id', userId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to accept collaboration: ${error.message}`);
  }

  return { success: true, collaboration: data };
}

async function addComment(documentId: string, userId: string, content: string, positionStart?: number, positionEnd?: number) {
  const { data, error } = await supabase
    .from('document_comments')
    .insert({
      document_id: documentId,
      user_id: userId,
      content,
      position_start: positionStart,
      position_end: positionEnd
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to add comment: ${error.message}`);
  }

  return { comment: data };
}

async function resolveComment(commentId: string, userId: string) {
  const { data, error } = await supabase
    .from('document_comments')
    .update({ is_resolved: true })
    .eq('id', commentId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to resolve comment: ${error.message}`);
  }

  return { comment: data };
}

async function getDocumentActivity(documentId: string, userId: string) {
  // Get comments
  const { data: comments, error: commentsError } = await supabase
    .from('document_comments')
    .select('*')
    .eq('document_id', documentId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (commentsError) {
    throw new Error(`Failed to fetch comments: ${commentsError.message}`);
  }

  // Get versions
  const { data: versions, error: versionsError } = await supabase
    .from('document_versions')
    .select('*')
    .eq('document_id', documentId)
    .order('created_at', { ascending: false })
    .limit(20);

  if (versionsError) {
    throw new Error(`Failed to fetch versions: ${versionsError.message}`);
  }

  // Get collaborations
  const { data: collaborations, error: collabError } = await supabase
    .from('document_collaborations')
    .select('*')
    .eq('document_id', documentId);

  if (collabError) {
    throw new Error(`Failed to fetch collaborations: ${collabError.message}`);
  }

  return {
    comments: comments || [],
    versions: versions || [],
    collaborations: collaborations || [],
    activity: [
      ...comments?.map(c => ({ type: 'comment', ...c })) || [],
      ...versions?.map(v => ({ type: 'version', ...v })) || []
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  };
}

async function createDocumentVersion(documentId: string, userId: string, content: string, changeSummary?: string) {
  // Get the next version number
  const { data: existingVersions } = await supabase
    .from('document_versions')
    .select('version_number')
    .eq('document_id', documentId)
    .order('version_number', { ascending: false })
    .limit(1);

  const nextVersion = (existingVersions?.[0]?.version_number || 0) + 1;

  const { data, error } = await supabase
    .from('document_versions')
    .insert({
      document_id: documentId,
      user_id: userId,
      version_number: nextVersion,
      content_raw: content,
      change_summary: changeSummary || `Version ${nextVersion}`
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create version: ${error.message}`);
  }

  return { version: data };
}

async function compareVersions(versionId1: string, versionId2: string) {
  const { data: versions, error } = await supabase
    .from('document_versions')
    .select('*')
    .in('id', [versionId1, versionId2]);

  if (error || !versions || versions.length !== 2) {
    throw new Error('Failed to fetch versions for comparison');
  }

  const [version1, version2] = versions.sort((a, b) => a.version_number - b.version_number);
  
  // Simple diff calculation (in production, use proper diff library)
  const changes = {
    added: 0,
    removed: 0,
    modified: 0
  };

  const words1 = version1.content_raw.split(/\s+/);
  const words2 = version2.content_raw.split(/\s+/);
  
  changes.added = Math.max(0, words2.length - words1.length);
  changes.removed = Math.max(0, words1.length - words2.length);

  return {
    version1,
    version2,
    changes,
    summary: `${changes.added} words added, ${changes.removed} words removed`
  };
}