import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import RichTextEditor from '@/components/editor/RichTextEditor';
import { JSONContent } from '@tiptap/react';
import FileUploadButton from '@/components/documents/editor/FileUploadButton';
import { ArrowLeft, Save, Download, Upload, Clock, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface DocumentData {
  id: string;
  title: string;
  content_json: any;
  original_text: string;
  document_type: string;
  file_name: string;
  updated_at: string;
  created_at: string;
}

export const DocumentEditorScreen: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [document, setDocument] = useState<DocumentData | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState<JSONContent>({ 
    type: "doc", 
    content: [{ type: "paragraph" }] 
  });
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Load document on mount
  useEffect(() => {
    const loadDocument = async () => {
      if (!id || !user) return;
      
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('user_documents')
          .select('*')
          .eq('id', id)
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Error loading document:', error);
          toast.error('Failed to load document');
          navigate('/documents');
          return;
        }

        if (!data) {
          toast.error('Document not found');
          navigate('/documents');
          return;
        }

        setDocument(data);
        setTitle(data.file_name || 'Untitled Document');
        
        // Load content from content_json if available, otherwise migrate from original_text
        if (data.content_json) {
          setContent(data.content_json);
        } else if (data.original_text) {
          // Convert plain text to TipTap JSON - handle paragraphs
          const paragraphs = data.original_text.split('\n\n').filter(p => p.trim());
          const tiptapContent = {
            type: "doc",
            content: paragraphs.length > 0 ? paragraphs.map(paragraph => ({
              type: "paragraph",
              content: paragraph.trim() ? [
                {
                  type: "text",
                  text: paragraph.trim()
                }
              ] : []
            })) : [{ type: "paragraph" }]
          };
          setContent(tiptapContent);
          
          // Save the migrated content
          try {
            await supabase
              .from('user_documents')
              .update({
                content_json: tiptapContent,
                updated_at: new Date().toISOString()
              })
              .eq('id', id);
          } catch (migrationError) {
            console.error('Error migrating content:', migrationError);
          }
        } else {
          // Empty document
          setContent({
            type: "doc",
            content: [{ type: "paragraph" }]
          });
        }

        setLastSaved(new Date(data.updated_at || data.created_at));
      } catch (error) {
        console.error('Error loading document:', error);
        toast.error('Failed to load document');
        navigate('/documents');
      } finally {
        setLoading(false);
      }
    };

    loadDocument();
  }, [id, user, navigate]);

  // Autosave function
  const saveDocument = async (contentToSave?: JSONContent, titleToSave?: string) => {
    if (!document || !user || isSaving) return;

    setIsSaving(true);
    try {
      const updates: any = {
        updated_at: new Date().toISOString(),
      };

      if (contentToSave !== undefined) {
        updates.content_json = contentToSave;
      }

      if (titleToSave !== undefined) {
        updates.file_name = titleToSave;
      }

      const { error } = await supabase
        .from('user_documents')
        .update(updates)
        .eq('id', document.id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error saving document:', error);
        toast.error('Failed to save document');
        return;
      }

      setLastSaved(new Date());
    } catch (error) {
      console.error('Error saving document:', error);
      toast.error('Failed to save document');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle content changes with autosave
  const handleContentChange = (newContent: JSONContent) => {
    setContent(newContent);
    saveDocument(newContent);
  };

  // Handle title changes
  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    saveDocument(undefined, newTitle);
  };

  // Manual save
  const handleManualSave = async () => {
    await saveDocument(content, title);
  };

  // Handle DOCX import
  const handleFileContent = async (extractedContent: string) => {
    try {
      // Convert HTML to TipTap JSON format for import
      // For now, we'll set it as basic text content
      const importedContent = {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: extractedContent.replace(/<[^>]*>/g, '') // Strip HTML tags for now
              }
            ]
          }
        ]
      };
      
      setContent(importedContent);
      handleContentChange(importedContent);
      toast.success('Document imported successfully');
    } catch (error) {
      console.error('Error importing document:', error);
      toast.error('Failed to import document');
    }
  };

  // Handle DOCX export
  const handleExportDocx = async () => {
    if (!document) return;

    try {
      const response = await supabase.functions.invoke('export-docx-tiptap', {
        body: {
          title: title || 'Document',
          content_json: content,
          document_type: document.document_type,
        },
      });

      if (response.error) {
        throw new Error('Export failed');
      }

      // Create blob from response data
      const blob = new Blob([response.data], { 
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
      });
      const url = window.URL.createObjectURL(blob);
      const link = globalThis.document.createElement('a');
      link.href = url;
      link.download = `${title || 'document'}.docx`;
      globalThis.document.body.appendChild(link);
      link.click();
      globalThis.document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Document exported successfully');
    } catch (error) {
      console.error('Error exporting document:', error);
      toast.error('Failed to export document');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="container mx-auto py-6 text-center">
        <p>Document not found</p>
        <Button onClick={() => navigate('/documents')} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Documents
        </Button>
      </div>
    );
  }

    // Render main editor interface
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-6 px-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                onClick={() => navigate('/documents')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Documents
              </Button>
              <div className="text-sm text-muted-foreground">
                / {document?.document_type || 'Document'} / Rich Text Editor
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button onClick={handleManualSave} disabled={isSaving} variant="outline">
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
              
              <FileUploadButton 
                onFileContent={handleFileContent}
                isUploading={isUploading}
                setIsUploading={setIsUploading}
              />
              
              <Button onClick={handleExportDocx} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export DOCX
              </Button>
            </div>
          </div>

      {/* Document Editor */}
      <Card>
        <CardHeader>
          <CardTitle>
            <Input
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Document Title"
              className="text-lg font-semibold border-none shadow-none px-0 focus-visible:ring-0"
            />
          </CardTitle>
          {lastSaved && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-3 w-3" />
              Last saved: {lastSaved.toLocaleTimeString()}
            </div>
          )}
        </CardHeader>
        <CardContent>
          <RichTextEditor
            initialContent={content}
            onChange={handleContentChange}
          />
        </CardContent>
      </Card>
        </div>
      </div>
    );
  };