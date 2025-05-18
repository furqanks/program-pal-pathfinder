
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { QuotedImprovement } from "@/types/document.types";

interface FeedbackPreviewProps {
  feedback: {
    content: string;
    feedback?: string;
    improvementPoints?: string[];
    quotedImprovements?: QuotedImprovement[];
    score?: number;
  } | null;
  showFeedback: boolean;
}

const FeedbackPreview = ({ feedback, showFeedback }: FeedbackPreviewProps) => {
  if (!feedback || !showFeedback) return null;

  return (
    <Card className="mt-4 border border-accent">
      <CardContent className="pt-4">
        <h3 className="text-lg font-medium mb-2">AI Feedback</h3>
        <div className="bg-accent/20 p-4 rounded-md">
          <div className="prose prose-sm max-w-none">
            <p>{feedback.feedback}</p>
          </div>
          
          {feedback.score !== undefined && (
            <div className="mt-4 flex items-center gap-2">
              <span className="font-medium">Overall Score:</span>
              <Badge variant="secondary">{feedback.score}/10</Badge>
            </div>
          )}

          {feedback.improvementPoints && feedback.improvementPoints.length > 0 && (
            <div className="mt-4">
              <h4 className="font-medium mb-2">Improvement Points</h4>
              <ul className="list-disc pl-5 space-y-2">
                {feedback.improvementPoints.map((point, index) => (
                  <li key={index} className="text-sm">{point}</li>
                ))}
              </ul>
            </div>
          )}
          
          {feedback.quotedImprovements && feedback.quotedImprovements.length > 0 && (
            <div className="mt-6">
              <h4 className="font-medium mb-3">Suggested Text Improvements</h4>
              <div className="space-y-4">
                {feedback.quotedImprovements.map((improvement, index) => (
                  <div key={index} className="border border-border rounded-md p-3">
                    <div className="bg-muted/50 p-2 rounded mb-2">
                      <h5 className="text-xs uppercase text-muted-foreground mb-1">Original Text:</h5>
                      <p className="text-sm italic">"{improvement.originalText}"</p>
                    </div>
                    
                    <div className="bg-accent/20 p-2 rounded mb-2">
                      <h5 className="text-xs uppercase text-muted-foreground mb-1">Improved Version:</h5>
                      <p className="text-sm font-medium">"{improvement.improvedText}"</p>
                    </div>
                    
                    <div className="text-xs text-muted-foreground mt-2">
                      <h5 className="uppercase mb-1">Why it's better:</h5>
                      <p>{improvement.explanation}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FeedbackPreview;
