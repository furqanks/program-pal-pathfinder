
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface FeedbackPreviewProps {
  feedback: {
    content: string;
    feedback?: string;
    improvementPoints?: string[];
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
        </div>
      </CardContent>
    </Card>
  );
};

export default FeedbackPreview;
