
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, PlusCircle, FileText, Wand } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useDocumentContext } from "@/contexts/DocumentContext";
import { Document } from "@/types/document.types";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";
import { generateImprovedDraft } from "@/services/document.service";

interface DocumentViewerProps {
  selectedDocument: Document;
  onCreateNewVersion: () => void;
  documentTypeLabels: Record<string, string>;
}

const DocumentViewer = ({
  selectedDocument,
  onCreateNewVersion,
  documentTypeLabels
}: DocumentViewerProps) => {
  const isMobile = useIsMobile();
  const { generateFeedback, addDocument } = useDocumentContext();
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false);
  const [isGeneratingDraft, setIsGeneratingDraft] = useState(false);
  
  const handleGenerateFeedback = async () => {
    if (selectedDocument.id) {
      setIsGeneratingFeedback(true);
      
      try {
        await generateFeedback(selectedDocument.id);
      } catch (error) {
        console.error("Error generating feedback:", error);
        toast.error("Failed to generate feedback. Please try again.");
      } finally {
        setIsGeneratingFeedback(false);
      }
    }
  };
  
  const handleGenerateImprovedDraft = async () => {
    if (!selectedDocument.contentFeedback) {
      toast.error("Feedback must be generated before creating an improved draft");
      return;
    }
    
    setIsGeneratingDraft(true);
    toast.info("Generating improved draft...");
    
    try {
      // Get the feedback data
      const feedbackData = {
        summary: selectedDocument.contentFeedback,
        improvementPoints: selectedDocument.improvementPoints || [],
        quotedImprovements: selectedDocument.quotedImprovements || [],
        score: selectedDocument.score || 0
      };
      
      // Generate improved draft
      const improvedContent = await generateImprovedDraft(
        selectedDocument.contentRaw,
        feedbackData,
        selectedDocument.documentType
      );
      
      // Create a new document with the improved content
      const newDocument = await addDocument({
        documentType: selectedDocument.documentType,
        linkedProgramId: selectedDocument.linkedProgramId,
        contentRaw: improvedContent,
        fileName: null
      });
      
      if (newDocument) {
        toast.success("Improved draft created as a new version");
      }
    } catch (error) {
      console.error("Error generating improved draft:", error);
      toast.error("Failed to generate improved draft");
    } finally {
      setIsGeneratingDraft(false);
    }
  };
  
  return (
    <div className="space-y-6">
      {selectedDocument.fileName && (
        <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-2">
          <FileText className="h-4 w-4" />
          <span>Uploaded file: {selectedDocument.fileName}</span>
        </div>
      )}
      
      <div className="border rounded-md p-4 bg-muted/30">
        <pre className="whitespace-pre-wrap font-sans text-sm">
          {selectedDocument.contentRaw}
        </pre>
      </div>
      
      {selectedDocument.contentFeedback ? (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-2">AI Feedback</h3>
            <div className="border rounded-md p-4 bg-accent/20">
              <div className="prose prose-sm max-w-none">
                <p>{selectedDocument.contentFeedback}</p>
              </div>
              
              {selectedDocument.score !== null && (
                <div className="mt-4 flex items-center gap-2">
                  <span className="font-medium">Overall Score:</span>
                  <Badge>{selectedDocument.score}/10</Badge>
                </div>
              )}

              {selectedDocument.improvementPoints && selectedDocument.improvementPoints.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Improvement Points</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    {selectedDocument.improvementPoints.map((point, index) => (
                      <li key={index} className="text-sm">{point}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
          
          {selectedDocument.quotedImprovements && selectedDocument.quotedImprovements.length > 0 && (
            <div>
              <h3 className="text-lg font-medium mb-3">Suggested Text Improvements</h3>
              <div className="space-y-4">
                {selectedDocument.quotedImprovements.map((improvement, index) => (
                  <div key={index} className="border border-border rounded-md p-4">
                    <div className="bg-muted/50 p-3 rounded mb-3">
                      <h5 className="text-xs uppercase text-muted-foreground mb-1">Original Text:</h5>
                      <p className="text-sm italic">"{improvement.originalText}"</p>
                    </div>
                    
                    <div className="bg-accent/20 p-3 rounded mb-3">
                      <h5 className="text-xs uppercase text-muted-foreground mb-1">Improved Version:</h5>
                      <p className="text-sm font-medium">"{improvement.improvedText}"</p>
                    </div>
                    
                    <div className="text-sm text-muted-foreground mt-2">
                      <h5 className="text-xs uppercase mb-1">Why it's better:</h5>
                      <p>{improvement.explanation}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className={`flex ${isMobile ? "flex-col" : ""} gap-3 w-full`}>
            <Button 
              variant="outline"
              onClick={onCreateNewVersion}
              className={isMobile ? "w-full" : ""}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Create New Version
            </Button>
            
            <Button 
              onClick={handleGenerateImprovedDraft}
              disabled={isGeneratingDraft}
              variant="secondary"
              className={`${isMobile ? "w-full" : ""} gap-2`}
            >
              <Wand className="h-4 w-4" />
              {isGeneratingDraft ? "Generating..." : "Generate Improved Draft"}
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-8">
          <Sparkles className="h-10 w-10 text-muted-foreground mb-2 opacity-50" />
          <p className="text-center text-muted-foreground mb-4">
            No feedback generated yet. Click "Get AI Feedback" to analyze this document.
          </p>
          <Button 
            onClick={handleGenerateFeedback}
            disabled={isGeneratingFeedback}
            className="gap-2"
          >
            <Sparkles className="h-4 w-4" />
            {isGeneratingFeedback ? "Generating..." : "Get AI Feedback"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default DocumentViewer;
