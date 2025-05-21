
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Wand } from "lucide-react";
import { QuotedImprovement } from "@/types/document.types";
import { generateImprovedDraft } from "@/services/document.service";
import { toast } from "sonner";

interface FeedbackPreviewProps {
  feedback: {
    content: string;
    feedback?: string;
    improvementPoints?: string[];
    quotedImprovements?: QuotedImprovement[];
    score?: number;
  } | null;
  showFeedback: boolean;
  documentType?: string;
  onDraftGenerated?: (draft: string) => void;
}

const FeedbackPreview = ({ 
  feedback, 
  showFeedback,
  documentType = "Essay",
  onDraftGenerated
}: FeedbackPreviewProps) => {
  const [isGeneratingDraft, setIsGeneratingDraft] = useState(false);
  
  if (!feedback || !showFeedback) return null;
  
  const handleGenerateImprovedDraft = async () => {
    if (!feedback.feedback) {
      toast.error("Feedback must be available before creating an improved draft");
      return;
    }
    
    setIsGeneratingDraft(true);
    toast.info("Generating improved draft...");
    
    try {
      // Prepare feedback data in the same format the API expects
      const feedbackData = {
        summary: feedback.feedback,
        improvementPoints: feedback.improvementPoints || [],
        quotedImprovements: feedback.quotedImprovements || [],
        score: feedback.score || 0
      };
      
      // Generate improved draft without saving to database
      const improvedContent = await generateImprovedDraft(
        feedback.content,
        feedbackData,
        documentType
      );
      
      if (onDraftGenerated) {
        onDraftGenerated(improvedContent);
        toast.success("Improved draft generated");
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
      <h3 className="text-lg font-medium mb-2">AI Feedback</h3>
      
      <div className="border rounded-md p-4 bg-accent/20">
        <div className="prose prose-sm max-w-none">
          <p>{feedback.feedback}</p>
        </div>
        
        {feedback.score !== undefined && (
          <div className="mt-4 flex items-center gap-2">
            <span className="font-medium">Overall Score:</span>
            <Badge>{feedback.score}/10</Badge>
          </div>
        )}
        
        {feedback.improvementPoints && feedback.improvementPoints.length > 0 && (
          <div className="mt-4">
            <h4 className="font-medium mb-2">Improvement Points</h4>
            <ul className="list-disc pl-5 space-y-1">
              {feedback.improvementPoints.map((point, index) => (
                <li key={index} className="text-sm">{point}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      {feedback.quotedImprovements && feedback.quotedImprovements.length > 0 && (
        <div>
          <h3 className="text-lg font-medium mb-3">Suggested Text Improvements</h3>
          <div className="space-y-4">
            {feedback.quotedImprovements.map((improvement, index) => (
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
      
      {/* Always show the Generate AI Draft button when feedback is available */}
      <Button
        onClick={handleGenerateImprovedDraft}
        disabled={isGeneratingDraft}
        variant="outline"
        className="w-full bg-[#222222] text-white hover:bg-[#333333]"
      >
        <Wand className="mr-2 h-4 w-4" />
        {isGeneratingDraft ? "Generating..." : "Generate AI Draft"}
      </Button>
    </div>
  );
};

export default FeedbackPreview;
