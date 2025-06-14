
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Brain, 
  Sparkles, 
  ChevronDown, 
  ChevronRight,
  Lightbulb,
  Target
} from "lucide-react";

interface CompactAISummaryProps {
  summary?: string;
  insights?: any;
  className?: string;
}

const CompactAISummary = ({ summary, insights, className = "" }: CompactAISummaryProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatSummaryPreview = (text: string, maxLength: number = 120) => {
    const cleanText = text.replace(/[#*]/g, '').trim();
    return cleanText.length > maxLength 
      ? cleanText.substring(0, maxLength) + '...'
      : cleanText;
  };

  if (!summary && !insights) return null;

  return (
    <div className={`space-y-2 ${className}`}>
      {summary && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30 rounded-lg border border-purple-200/50 dark:border-purple-800/50">
          <div className="p-3">
            <div 
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <div className="p-1 bg-purple-100 dark:bg-purple-900 rounded">
                <Brain className="h-3 w-3 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-purple-800 dark:text-purple-200 text-sm">AI Summary</span>
                  <Badge variant="outline" className="text-xs bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                    Generated
                  </Badge>
                </div>
                <p className="text-xs text-purple-700 dark:text-purple-300 line-clamp-2">
                  {formatSummaryPreview(summary)}
                </p>
              </div>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-purple-100 dark:hover:bg-purple-900">
                {isExpanded ? (
                  <ChevronDown className="h-3 w-3 text-purple-600" />
                ) : (
                  <ChevronRight className="h-3 w-3 text-purple-600" />
                )}
              </Button>
            </div>
            
            {isExpanded && (
              <div className="mt-3 pt-3 border-t border-purple-200/50 dark:border-purple-800/50">
                <div className="text-xs text-purple-700 dark:text-purple-300 leading-relaxed whitespace-pre-wrap">
                  {summary.replace(/[#*]/g, '')}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {insights && Object.keys(insights).length > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 rounded-lg border border-amber-200/50 dark:border-amber-800/50">
          <div className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1 bg-amber-100 dark:bg-amber-900 rounded">
                <Sparkles className="h-3 w-3 text-amber-600 dark:text-amber-400" />
              </div>
              <span className="font-medium text-amber-800 dark:text-amber-200 text-sm">Key Insights</span>
              <Badge variant="outline" className="text-xs bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300">
                AI Powered
              </Badge>
            </div>
            
            <div className="space-y-2">
              {insights.key_insights && insights.key_insights.slice(0, 2).map((insight: string, index: number) => (
                <div key={index} className="flex items-start gap-2">
                  <Lightbulb className="h-3 w-3 text-amber-600 mt-0.5 flex-shrink-0" />
                  <span className="text-xs text-amber-700 dark:text-amber-300 line-clamp-2">
                    {insight}
                  </span>
                </div>
              ))}
              
              {insights.next_steps && insights.next_steps.slice(0, 1).map((step: string, index: number) => (
                <div key={index} className="flex items-start gap-2">
                  <Target className="h-3 w-3 text-amber-600 mt-0.5 flex-shrink-0" />
                  <span className="text-xs text-amber-700 dark:text-amber-300 line-clamp-2">
                    {step}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompactAISummary;
