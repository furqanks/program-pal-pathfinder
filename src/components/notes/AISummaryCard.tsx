
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Brain, Sparkles, ChevronDown, ChevronUp, Copy, Share2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface AISummaryCardProps {
  summary: string;
  insights?: {
    key_insights?: string[];
    next_steps?: string[];
    priority_level?: string;
    tags_suggested?: string[];
  };
  confidence?: number;
  onRegenerate?: () => void;
  isRegenerating?: boolean;
}

const AISummaryCard = ({ 
  summary, 
  insights, 
  confidence = 0,
  onRegenerate,
  isRegenerating = false 
}: AISummaryCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(summary);
      toast.success("Summary copied to clipboard");
    } catch (error) {
      toast.error("Failed to copy summary");
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return "text-green-600 bg-green-50";
    if (score >= 0.6) return "text-yellow-600 bg-yellow-50";
    return "text-orange-600 bg-orange-50";
  };

  const getConfidenceLabel = (score: number) => {
    if (score >= 0.8) return "High";
    if (score >= 0.6) return "Medium";
    return "Low";
  };

  return (
    <Card className="border-l-4 border-l-purple-500 bg-gradient-to-r from-purple-50/50 to-transparent">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-purple-100 rounded-lg">
              <Brain className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <h3 className="font-medium text-purple-800 text-sm">AI Summary</h3>
              <p className="text-xs text-purple-600">Generated insights from your note</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {confidence > 0 && (
              <Badge variant="outline" className={`text-xs ${getConfidenceColor(confidence)}`}>
                {getConfidenceLabel(confidence)} confidence
              </Badge>
            )}
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" onClick={handleCopy} className="h-7 w-7 p-0">
                <Copy className="h-3 w-3" />
              </Button>
              {onRegenerate && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={onRegenerate}
                  disabled={isRegenerating}
                  className="h-7 w-7 p-0"
                >
                  <Sparkles className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Summary Content */}
        <div className="prose prose-sm max-w-none">
          <p className="text-purple-700 leading-relaxed mb-0">{summary}</p>
        </div>

        {/* Insights Section */}
        {insights && Object.keys(insights).length > 0 && (
          <div className="mt-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-purple-600 hover:text-purple-700 hover:bg-purple-100 p-0 h-auto font-medium"
            >
              <span className="flex items-center gap-1">
                {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                View detailed insights
              </span>
            </Button>
            
            {isExpanded && (
              <div className="mt-3 space-y-3 pl-4 border-l-2 border-purple-200">
                {insights.key_insights && insights.key_insights.length > 0 && (
                  <div>
                    <h4 className="font-medium text-purple-800 text-xs mb-2">Key Insights</h4>
                    <ul className="space-y-1">
                      {insights.key_insights.map((insight, index) => (
                        <li key={index} className="flex items-start gap-2 text-xs text-purple-700">
                          <span className="w-1 h-1 bg-purple-400 rounded-full mt-1.5 flex-shrink-0"></span>
                          <span>{insight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {insights.next_steps && insights.next_steps.length > 0 && (
                  <div>
                    <h4 className="font-medium text-purple-800 text-xs mb-2">Suggested Actions</h4>
                    <ul className="space-y-1">
                      {insights.next_steps.map((step, index) => (
                        <li key={index} className="flex items-start gap-2 text-xs text-purple-700">
                          <span className="w-1 h-1 bg-purple-400 rounded-full mt-1.5 flex-shrink-0"></span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

export default AISummaryCard;
