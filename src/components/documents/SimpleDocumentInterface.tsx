import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { FileText, Sparkles, Download, Plus, Trash2 } from "lucide-react";
import { useDocumentContext } from "@/contexts/DocumentContext";
import { generateTestFeedback } from "@/services/document.service";
import { Document } from "@/types/document.types";
import { format } from "date-fns";

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
  
  // Document management
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [isEditing, setIsEditing] = useState(false);

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

  // Handle new document
  const handleNew = () => {
    setContent("");
    setSelectedType("");
    setFeedback(null);
    setShowFeedback(false);
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

  // Export to PDF (placeholder for now)
  const handleExport = () => {
    toast.info("PDF export coming soon");
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

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !content.trim() || !selectedType}
                className="flex-1"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                {isAnalyzing ? "Analyzing..." : "Analyze Document"}
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