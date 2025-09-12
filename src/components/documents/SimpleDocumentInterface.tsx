import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { FileText, Sparkles, Download, Plus, Trash2, MessageSquare, GitCompare, CheckCircle2, X } from "lucide-react";
import { useDocumentContext } from "@/contexts/DocumentContext";
import { generateTestFeedback } from "@/services/document.service";
import { Document } from "@/types/document.types";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import FileUploadButton from "./editor/FileUploadButton";

// Simplified document types
const DOCUMENT_TYPES = {
  "SOP": "Statement of Purpose",
  "CV": "CV/Resume", 
  "ScholarshipEssay": "Scholarship Essay",
  "LOR": "Letter of Recommendation"
};

interface FeedbackData {
  summary: string;
  score: number;
  improvementPoints: string[];
  quotedImprovements: Array<{
    originalText: string;
    improvedText: string;
    explanation: string;
  }>;
}

interface CustomAnalysis {
  analysis: string;
  prompt: string;
}

const SimpleDocumentInterface = () => {
  const { documents, addDocument, deleteDocument } = useDocumentContext();
  
  // Main interface state
  const [content, setContent] = useState("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Feedback state
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  
  // Custom AI features
  const [customPrompt, setCustomPrompt] = useState("");
  const [customAnalysis, setCustomAnalysis] = useState<CustomAnalysis | null>(null);
  const [showCustomAnalysis, setShowCustomAnalysis] = useState(false);
  const [isCustomAnalyzing, setIsCustomAnalyzing] = useState(false);
  const [isGeneratingDraft, setIsGeneratingDraft] = useState(false);
  const [improvedDraft, setImprovedDraft] = useState("");
  const [showComparison, setShowComparison] = useState(false);
  
  // Document management
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Load selected document content
  useEffect(() => {
    if (selectedDocument) {
      setContent(selectedDocument.contentRaw);
      setSelectedType(selectedDocument.documentType);
      setIsEditing(true);
      if (selectedDocument.contentFeedback) {
        setFeedback({
          summary: selectedDocument.contentFeedback,
          score: selectedDocument.score || 0,
          improvementPoints: selectedDocument.improvementPoints || [],
          quotedImprovements: selectedDocument.quotedImprovements || []
        });
        setShowFeedback(true);
      }
    }
  }, [selectedDocument]);

  // Get documents by type
  const getDocumentsByType = (type: string) => {
    return documents.filter(doc => doc.documentType === type)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  // Handle document analysis
  const handleAnalyze = async () => {
    if (!content.trim()) {
      toast.error("Please enter document content");
      return;
    }
    if (!selectedType) {
      toast.error("Please select document type");
      return;
    }

    setIsAnalyzing(true);
    setShowFeedback(false);
    
    try {
      const result = await generateTestFeedback(content, selectedType);
      setFeedback(result);
      setShowFeedback(true);
      toast.success("Analysis complete!");
    } catch (error) {
      console.error("Analysis error:", error);
      toast.error("Failed to analyze document");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handle document save
  const handleSave = async () => {
    if (!content.trim()) {
      toast.error("Please enter document content");
      return;
    }
    if (!selectedType) {
      toast.error("Please select document type");
      return;
    }

    setIsSaving(true);
    
    try {
      await addDocument({
        documentType: selectedType as any,
        linkedProgramId: null,
        contentRaw: content,
        fileName: null
      });
      
      toast.success("Document saved successfully");
      handleNew();
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to save document");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle custom AI analysis
  const handleCustomAnalysis = async () => {
    if (!content.trim()) {
      toast.error("Please enter document content");
      return;
    }
    if (!selectedType) {
      toast.error("Please select document type");
      return;
    }
    if (!customPrompt.trim()) {
      toast.error("Please enter your instructions");
      return;
    }

    setIsCustomAnalyzing(true);
    setShowCustomAnalysis(false);
    
    try {
      const { data, error } = await supabase.functions.invoke('custom-document-analysis', {
        body: {
          content,
          documentType: selectedType,
          customPrompt,
          generateDraft: false
        }
      });

      if (error) throw error;

      setCustomAnalysis({
        analysis: data.analysis,
        prompt: data.prompt
      });
      setShowCustomAnalysis(true);
      toast.success("Analysis complete!");
    } catch (error) {
      console.error("Custom analysis error:", error);
      toast.error("Failed to analyze document");
    } finally {
      setIsCustomAnalyzing(false);
    }
  };

  // Handle improved draft generation
  const handleGenerateDraft = async () => {
    if (!content.trim() || !selectedType || !customPrompt.trim()) {
      toast.error("Please ensure all fields are filled");
      return;
    }

    setIsGeneratingDraft(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('custom-document-analysis', {
        body: {
          content,
          documentType: selectedType,
          customPrompt,
          generateDraft: true
        }
      });

      if (error) throw error;

      setImprovedDraft(data.improvedDraft);
      setShowComparison(true);
      toast.success("Improved draft generated!");
    } catch (error) {
      console.error("Draft generation error:", error);
      toast.error("Failed to generate improved draft");
    } finally {
      setIsGeneratingDraft(false);
    }
  };

  // Handle accepting improved draft
  const handleAcceptDraft = () => {
    setContent(improvedDraft);
    setShowComparison(false);
    setImprovedDraft("");
    toast.success("Draft accepted and applied!");
  };

  // Handle rejecting improved draft
  const handleRejectDraft = () => {
    setShowComparison(false);
    setImprovedDraft("");
    toast.info("Draft rejected");
  };

  // Handle new document
  const handleNew = () => {
    setContent("");
    setSelectedType("");
    setFeedback(null);
    setShowFeedback(false);
    setCustomPrompt("");
    setCustomAnalysis(null);
    setShowCustomAnalysis(false);
    setImprovedDraft("");
    setShowComparison(false);
    setSelectedDocument(null);
    setIsEditing(false);
  };

  // Handle document deletion
  const handleDelete = async (docId: string) => {
    try {
      await deleteDocument(docId);
      if (selectedDocument?.id === docId) {
        handleNew();
      }
      toast.success("Document deleted");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete document");
    }
  };

  // Export document using Node.js API
  const handleExport = async () => {
    if (!selectedDocument) {
      toast.error("Please select a document to export");
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        toast.error("Please log in to export documents");
        return;
      }

      toast.info("Generating DOCX export...");
      
      const response = await fetch('/api/export-document', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          action: 'export_document',
          documentId: selectedDocument.id,
          format: 'docx'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Export failed' }));
        console.error('Export API error:', errorData);
        throw new Error(errorData.details || errorData.error || 'Export failed');
      }

      // Get filename from headers or generate one
      const contentDisposition = response.headers.get('content-disposition');
      const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
      const filename = filenameMatch?.[1] || `${selectedDocument.documentType}.docx`;

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      window.URL.revokeObjectURL(url);

      toast.success("DOCX document exported successfully!");
    } catch (error) {
      console.error('Export error:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to export document. Please try again.";
      toast.error(`Export failed: ${errorMessage}`);
    }
  };

  return (
    <div className="spacing-grid">
      {/* Header */}
      <div className="text-center space-y-4 pb-6">
        <h1 className="text-display">Document Assistant</h1>
        <p className="text-body-secondary max-w-2xl mx-auto">
          Write, analyze, and perfect your application documents with AI-powered feedback
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        {/* Main Editor */}
        <Card className="card-modern">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-subheading">
                {isEditing ? "Edit Document" : "New Document"}
              </CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNew}
                    disabled={!content && !selectedDocument}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    New
                  </Button>
                  <FileUploadButton
                    onFileContent={(fileContent: string, _fileName: string) => setContent(fileContent)}
                    isUploading={isUploading}
                    setIsUploading={setIsUploading}
                  />
                  {content && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleExport}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Export
                    </Button>
                  )}
                </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Document Type Selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Document Type</label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(DOCUMENT_TYPES).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Content Editor */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Content</label>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Start writing your document..."
                className="min-h-[400px] resize-none"
              />
              <div className="text-xs text-muted-foreground text-right">
                {content.length} characters
              </div>
            </div>

            {/* Custom AI Prompt Section */}
            <div className="space-y-4 p-4 bg-muted/20 rounded-lg border border-dashed">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                <h3 className="font-medium">Custom AI Instructions</h3>
              </div>
              
              <div className="space-y-2">
                <Textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value.slice(0, 500))}
                  placeholder="Make this more persuasive • Check for grammar errors • Improve the conclusion • Make it sound more professional"
                  className="min-h-[80px] resize-none"
                  maxLength={500}
                />
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <span>Be specific about what you want improved</span>
                  <span>{customPrompt.length}/500 characters</span>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={handleCustomAnalysis}
                  disabled={isCustomAnalyzing || !content.trim() || !selectedType || !customPrompt.trim()}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  <MessageSquare className="h-4 w-4 mr-1" />
                  {isCustomAnalyzing ? "Analyzing..." : "Get AI Feedback"}
                </Button>
                
                {showCustomAnalysis && customAnalysis && (
                  <Button
                    onClick={handleGenerateDraft}
                    disabled={isGeneratingDraft || !content.trim() || !selectedType || !customPrompt.trim()}
                    size="sm"
                    className="flex-1"
                  >
                    <GitCompare className="h-4 w-4 mr-1" />
                    {isGeneratingDraft ? "Generating..." : "Generate Draft"}
                  </Button>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !content.trim() || !selectedType}
                className="flex-1"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                {isAnalyzing ? "Analyzing..." : "Standard Analysis"}
              </Button>
              
              <Button
                variant="outline"
                onClick={handleSave}
                disabled={isSaving || !content.trim() || !selectedType}
              >
                {isSaving ? "Saving..." : "Save"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Custom Analysis Panel */}
          {showCustomAnalysis && customAnalysis && (
            <Card className="card-modern">
              <CardHeader className="pb-3">
                <CardTitle className="text-subheading">AI Feedback</CardTitle>
                <div className="text-xs text-muted-foreground">
                  Your request: "{customAnalysis.prompt}"
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="text-sm whitespace-pre-wrap">
                  {customAnalysis.analysis}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Feedback Panel */}
          {showFeedback && feedback && (
            <Card className="card-modern">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-subheading">AI Feedback</CardTitle>
                  <Badge variant="outline">
                    Score: {feedback.score}/10
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="text-sm">
                  {feedback.summary}
                </div>
                
                {feedback.improvementPoints.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Key Improvements</h4>
                    <ul className="text-sm space-y-1">
                      {feedback.improvementPoints.slice(0, 3).map((point, index) => (
                        <li key={index} className="text-muted-foreground">
                          • {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {feedback.quotedImprovements.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Text Suggestions</h4>
                    <div className="text-xs text-muted-foreground">
                      {feedback.quotedImprovements.length} specific improvements found
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Side-by-Side Comparison Modal */}
          {showComparison && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <Card className="w-full max-w-6xl max-h-[90vh] overflow-hidden">
                <CardHeader className="pb-3 border-b">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-subheading">Document Comparison</CardTitle>
                    <Button variant="ghost" size="sm" onClick={handleRejectDraft}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Review the improvements and choose to accept or reject
                  </p>
                </CardHeader>
                
                <CardContent className="p-0">
                  <div className="grid grid-cols-2 h-[60vh]">
                    {/* Original */}
                    <div className="p-4 border-r">
                      <h4 className="font-medium mb-3 text-sm text-muted-foreground">Original</h4>
                      <div className="h-full overflow-y-auto text-sm whitespace-pre-wrap bg-muted/20 p-3 rounded">
                        {content}
                      </div>
                    </div>
                    
                    {/* Improved */}
                    <div className="p-4">
                      <h4 className="font-medium mb-3 text-sm text-muted-foreground">Improved Version</h4>
                      <div className="h-full overflow-y-auto text-sm whitespace-pre-wrap bg-accent/20 p-3 rounded">
                        {improvedDraft}
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 border-t bg-muted/20">
                    <div className="flex gap-3 justify-end">
                      <Button variant="outline" onClick={handleRejectDraft}>
                        Reject Changes
                      </Button>
                      <Button onClick={handleAcceptDraft}>
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Accept & Apply Changes
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Document Library */}
          <Card className="card-modern">
            <CardHeader className="pb-3">
              <CardTitle className="text-subheading">Saved Documents</CardTitle>
            </CardHeader>
            
            <CardContent>
              {Object.entries(DOCUMENT_TYPES).map(([type, label]) => {
                const docs = getDocumentsByType(type);
                if (docs.length === 0) return null;
                
                return (
                  <div key={type} className="mb-4 last:mb-0">
                    <h4 className="text-sm font-medium mb-2">{label}</h4>
                    <div className="space-y-1">
                      {docs.slice(0, 3).map((doc) => (
                        <div
                          key={doc.id}
                          className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
                            selectedDocument?.id === doc.id 
                              ? "bg-accent text-accent-foreground" 
                              : "hover:bg-muted/50"
                          }`}
                          onClick={() => setSelectedDocument(doc)}
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <FileText className="h-3 w-3 flex-shrink-0" />
                            <div className="text-sm truncate">
                              {doc.fileName || `Version ${doc.versionNumber}`}
                            </div>
                            {doc.score && (
                              <Badge variant="secondary" className="text-xs">
                                {doc.score}/10
                              </Badge>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(doc.id);
                            }}
                            className="h-6 w-6 p-0 opacity-60 hover:opacity-100"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                      {docs.length > 3 && (
                        <div className="text-xs text-muted-foreground pl-5">
                          +{docs.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              
              {documents.length === 0 && (
                <div className="text-sm text-muted-foreground text-center py-4">
                  No saved documents yet
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SimpleDocumentInterface;