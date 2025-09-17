import { supabase } from '@/integrations/supabase/client';
import type { JSONContent } from '@tiptap/react';

export async function saveTipTapJson({
  docId,
  userId,
  json,
  title,
}: { 
  docId: string; 
  userId: string; 
  json: JSONContent;
  title?: string;
}) {
  const updates: any = {
    content_json: json,
    updated_at: new Date().toISOString(),
  };

  if (title !== undefined) {
    updates.file_name = title;
  }

  const { data, error } = await supabase
    .from('user_documents')
    .update(updates)
    .eq('id', docId)
    .eq('user_id', userId)
    .select('updated_at')
    .single();
    
  if (error) throw error;
  return data?.updated_at;
}

// Detect content type (HTML, Markdown, or plain text)
export function detectContentType(text: string): 'html' | 'markdown' | 'text' {
  if (/<[ph1-6ul]/i.test(text)) return 'html';
  if (/^#{1,3}\s|^\*\s|\d+\.\s/m.test(text)) return 'markdown';
  return 'text';
}

// Convert plain text to TipTap JSON
export function textToTipTapJson(text: string): JSONContent {
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim());
  
  return {
    type: "doc",
    content: paragraphs.length > 0 ? paragraphs.map(paragraph => ({
      type: "paragraph",
      content: paragraph.trim() ? [{
        type: "text",
        text: paragraph.trim()
      }] : []
    })) : [{ type: "paragraph" }]
  };
}

// Simple markdown to HTML converter (basic support)
export function markdownToHtml(markdown: string): string {
  return markdown
    // Headers
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    // Bold
    .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.*)\*/gim, '<em>$1</em>')
    // Bullet lists
    .replace(/^\* (.*$)/gim, '<li>$1</li>')
    // Wrap consecutive <li> in <ul>
    .replace(/(<li>.*<\/li>)/gims, '<ul>$1</ul>')
    // Numbered lists  
    .replace(/^\d+\. (.*$)/gim, '<li>$1</li>')
    // Paragraphs
    .split('\n\n')
    .map(p => p.trim() ? `<p>${p}</p>` : '')
    .join('\n');
}