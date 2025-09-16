import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { RichTextEditor, RichTextEditorRef } from './RichTextEditor';
import FileUploadButton from '@/components/documents/editor/FileUploadButton';
import { ArrowLeft, Save, Download, Upload, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface DocumentData {
  id: string;
  title: string;
  content_json: any;
  original_text: string;
  document_type: string;
  updated_at: string;
}

export const DocumentEditorScreen: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const editorRef = useRef<RichTextEditorRef>(null);

  const [document, setDocument] = useState<DocumentData | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState<any>({ 
    type: "doc", 
    content: [{ type: "paragraph" }] 
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [saveTimeoutId, setSaveTimeoutId] = useState<NodeJS.Timeout | null>(null);

  // Load document
  useEffect(() => {
    const loadDocument = async () => {
      if (!id || !user) return;

      try {
        const { data, error } = await supabase
          .from('user_documents')
          .select('*')
          .eq('id', id)
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Error loading document:', error);
          toast({
            title: "Error",
            description: "Failed to load document",
            variant: "destructive",
          });
          navigate('/documents');
          return;
        }

        setDocument(data);
        setTitle(data.title || '');
        
        // Initialize content_json if empty
        let documentContent = data.content_json;
        if (!documentContent) {
          documentContent = { type: "doc", content: [{ type: "paragraph" }] };
        }
        
        setContent(documentContent);
      } catch (error) {
        console.error('Error loading document:', error);
        toast({
          title: "Error",
          description: "Failed to load document",
          variant: "destructive",
        });
        navigate('/documents');
      } finally {
        setLoading(false);
      }
    };

    loadDocument();
  }, [id, user, navigate]);

  // Autosave function
  const saveDocument = async (contentToSave?: any, titleToSave?: string) => {
    if (!document || !user || saving) return;

    setSaving(true);
    try {
      const updates: Partial<DocumentData> = {
        updated_at: new Date().toISOString(),
      };

      if (contentToSave !== undefined) {
        updates.content_json = contentToSave;
      }

      if (titleToSave !== undefined) {
        updates.title = titleToSave;
      }

      const { error } = await supabase
        .from('user_documents')
        .update(updates)
        .eq('id', document.id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error saving document:', error);
        toast({
          title: "Error",
          description: "Failed to save document",
          variant: "destructive",
        });
        return;
      }

      setLastSaved(new Date());
    } catch (error) {
      console.error('Error saving document:', error);
      toast({
        title: "Error",
        description: "Failed to save document",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Debounced autosave for content changes
  const handleContentChange = (newContent: any) => {
    setContent(newContent);

    // Clear existing timeout
    if (saveTimeoutId) {
      clearTimeout(saveTimeoutId);
    }

    // Set new timeout for autosave (1500ms debounce)
    const timeoutId = setTimeout(() => {
      saveDocument(newContent);
    }, 1500);

    setSaveTimeoutId(timeoutId);
  };

  // Handle title changes (also debounced)
  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);

    // Clear existing timeout
    if (saveTimeoutId) {
      clearTimeout(saveTimeoutId);
    }

    // Set new timeout for autosave
    const timeoutId = setTimeout(() => {
      saveDocument(undefined, newTitle);
    }, 1500);

    setSaveTimeoutId(timeoutId);
  };

  // Manual save
  const handleManualSave = async () => {
    if (saveTimeoutId) {
      clearTimeout(saveTimeoutId);
    }
    await saveDocument(content, title);
  };

  // Handle DOCX import
  const handleFileContent = async (extractedContent: string) => {
    if (!editorRef.current) return;

    try {
      // Set content as HTML in the editor
      editorRef.current.setContent(extractedContent);
      
      // Get the JSON representation and save it
      setTimeout(() => {
        const jsonContent = editorRef.current?.getJSON();
        if (jsonContent) {
          handleContentChange(jsonContent);
          toast({
            title: "Success",
            description: "Document imported successfully",
          });
        }
      }, 100);
    } catch (error) {
      console.error('Error importing document:', error);
      toast({
        title: "Error",
        description: "Failed to import document",
        variant: "destructive",
      });
    }
  };

  // Handle DOCX export
  const handleExportDocx = async () => {
    if (!document || !editorRef.current) return;

    try {
      const jsonContent = editorRef.current.getJSON();
      
      const response = await supabase.functions.invoke('export-docx-tiptap', {
        body: {
          title: title || 'Document',
          content_json: jsonContent,
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

      toast({
        title: "Success",
        description: "Document exported successfully",
      });
    } catch (error) {
      console.error('Error exporting document:', error);
      toast({
        title: "Error",
        description: "Failed to export document",
        variant: "destructive",
      });
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

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => navigate('/documents')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Documents
        </Button>

        <div className="flex items-center gap-2">
          {lastSaved && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-3 w-3" />
              Last saved: {lastSaved.toLocaleTimeString()}
            </div>
          )}
          
          <Button
            variant="outline"
            onClick={handleManualSave}
            disabled={saving}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save'}
          </Button>

          <FileUploadButton 
            onFileContent={(content, fileName) => handleFileContent(content)}
            isUploading={saving}
            setIsUploading={setSaving}
          />

          <Button 
            onClick={handleExportDocx}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
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
        </CardHeader>
        <CardContent>
          <RichTextEditor
            ref={editorRef}
            content={content}
            onChange={handleContentChange}
            placeholder="Start writing your document..."
          />
        </CardContent>
      </Card>
    </div>
  );
};