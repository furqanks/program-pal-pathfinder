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
import { saveTipTapJson, detectContentType, textToTipTapJson, markdownToHtml } from '@/utils/saveDoc';

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
  const [savingState, setSavingState] = useState<'idle'|'saving'|'saved'|'error'>('idle');
  const [isUploading, setIsUploading] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | undefined>();
  
  // Auto-save refs for race condition handling
  const saveSeqRef = React.useRef(0);
  const debouncedSaveRef = React.useRef<number | undefined>(undefined);

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
        
        // Load content with migration support
        if (data.content_json) {
          setContent(data.content_json);
        } else if (data.original_text) {
          // Migrate legacy content to TipTap JSON
          const contentType = detectContentType(data.original_text);
          let tiptapContent: JSONContent;
          
          if (contentType === 'html') {
            // For HTML content, we'll create a temporary editor to parse it
            tiptapContent = {
              type: "doc",
              content: [{ 
                type: "paragraph", 
                content: [{ type: "text", text: data.original_text.replace(/<[^>]*>/g, '') }]
              }]
            };
          } else if (contentType === 'markdown') {
            // Convert markdown to HTML then to TipTap JSON
            const html = markdownToHtml(data.original_text);
            tiptapContent = {
              type: "doc", 
              content: [{ 
                type: "paragraph", 
                content: [{ type: "text", text: html.replace(/<[^>]*>/g, '') }]
              }]
            };
          } else {
            // Plain text conversion
            tiptapContent = textToTipTapJson(data.original_text);
          }
          
          setContent(tiptapContent);
          
          // Save migrated content asynchronously
          saveTipTapJson({
            docId: id!,
            userId: user!.id,
            json: tiptapContent,
          }).catch(error => {
            console.error('Migration save failed:', error);
          });
        } else {
          // Empty document
          setContent({
            type: "doc",
            content: [{ type: "paragraph" }]
          });
        }

        setLastSavedAt(data.updated_at || data.created_at);
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

  // Debounced auto-save with race condition handling
  const onEditorChange = React.useCallback((json: JSONContent) => {
    setContent(json);
    
    // Clear existing timeout
    window.clearTimeout(debouncedSaveRef.current);
    
    // Debounce the save
    debouncedSaveRef.current = window.setTimeout(async () => {
      if (!document || !user) return;
      
      setSavingState('saving');
      const seq = ++saveSeqRef.current;
      
      try {
        const timestamp = await saveTipTapJson({
          docId: document.id,
          userId: user.id,
          json,
        });
        
        // Only update state if this is still the latest save
        if (seq === saveSeqRef.current) {
          setSavingState('saved');
          setLastSavedAt(timestamp);
        }
      } catch (error) {
        console.error('Auto-save failed:', error);
        if (seq === saveSeqRef.current) {
          setSavingState('error');
        }
      }
    }, 900);
  }, [document, user]);

  // Title save handler  
  const onTitleChange = React.useCallback((newTitle: string) => {
    setTitle(newTitle);
    
    // Immediate save for title changes
    if (document && user) {
      saveTipTapJson({
        docId: document.id,
        userId: user.id,
        json: content,
        title: newTitle,
      }).catch(error => {
        console.error('Title save failed:', error);
        toast.error('Failed to save title');
      });
    }
  }, [document, user, content]);

  // Manual save handler
  const handleManualSave = async () => {
    if (!document || !user) return;
    
    setSavingState('saving');
    const seq = ++saveSeqRef.current;
    
    try {
      const timestamp = await saveTipTapJson({
        docId: document.id,
        userId: user.id,
        json: content,
        title,
      });
      
      if (seq === saveSeqRef.current) {
        setSavingState('saved');
        setLastSavedAt(timestamp);
        toast.success('Document saved');
      }
    } catch (error) {
      console.error('Manual save failed:', error);
      if (seq === saveSeqRef.current) {
        setSavingState('error');
        toast.error('Failed to save document');
      }
    }
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
      onEditorChange(importedContent);
      toast.success('Document imported successfully');
    } catch (error) {
      console.error('Error importing document:', error);
      toast.error('Failed to import document');
    }
  };

  // Handle DOCX export using new API
  const handleExportDocx = async () => {
    if (!document) return;

    try {
      const response = await fetch('/api/export-tiptap-docx', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content_json: content,
          title: title || 'Document',
        }),
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
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
              <Button 
                onClick={handleManualSave} 
                disabled={savingState === 'saving'} 
                variant="outline"
              >
                {savingState === 'saving' ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                {savingState === 'saving' ? 'Saving...' : 'Save'}
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
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder="Document Title"
              className="text-lg font-semibold border-none shadow-none px-0 focus-visible:ring-0"
            />
          </CardTitle>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="h-3 w-3" />
            {savingState === 'saving' && 'Saving...'}
            {savingState === 'saved' && lastSavedAt && `Saved ${new Date(lastSavedAt).toLocaleTimeString()}`}
            {savingState === 'error' && <span className="text-red-500">Save failed</span>}
            {savingState === 'idle' && 'Ready'}
          </div>
        </CardHeader>
        <CardContent>
          <RichTextEditor
            initialContent={content}
            onChange={onEditorChange}
          />
        </CardContent>
      </Card>
        </div>
      </div>
    );
  };