
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  Copy, 
  Share2,
  Lightbulb,
  Target,
  TrendingUp,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import { toast } from "sonner";

interface AISummaryRendererProps {
  summary?: string;
  insights?: any;
  className?: string;
}

const AISummaryRenderer = ({ summary, insights, className = "" }: AISummaryRendererProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const handleCopy = async (text: string, section: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSection(section);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopiedSection(null), 2000);
    } catch (error) {
      toast.error("Failed to copy");
    }
  };

  const formatMarkdownText = (text: string) => {
    // Convert markdown-style formatting to HTML-like structure
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/### (.*?)(\n|$)/g, '<h3>$1</h3>')
      .replace(/#### (.*?)(\n|$)/g, '<h4>$1</h4>')
      .replace(/- (.*?)(\n|$)/g, '<li>$1</li>')
      .replace(/(\d+)\. (.*?)(\n|$)/g, '<li><strong>$1.</strong> $2</li>');
  };

  const renderFormattedText = (text: string) => {
    const formatted = formatMarkdownText(text);
    const parts = formatted.split(/(<h3>.*?<\/h3>|<h4>.*?<\/h4>|<li>.*?<\/li>|<strong>.*?<\/strong>)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('<h3>')) {
        const content = part.replace(/<\/?h3>/g, '');
        return (
          <h3 key={index} className="text-lg font-semibold text-purple-800 dark:text-purple-200 mb-3 mt-4 first:mt-0 flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            {content}
          </h3>
        );
      }
      if (part.startsWith('<h4>')) {
        const content = part.replace(/<\/?h4>/g, '');
        return (
          <h4 key={index} className="text-base font-medium text-purple-700 dark:text-purple-300 mb-2 mt-3 flex items-center gap-2">
            <Target className="h-3 w-3" />
            {content}
          </h4>
        );
      }
      if (part.startsWith('<li>')) {
        const content = part.replace(/<\/?li>/g, '').replace(/<\/?strong>/g, '');
        return (
          <div key={index} className="flex items-start gap-3 mb-2 pl-2">
            <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
            <span className="text-purple-700 dark:text-purple-300 leading-relaxed" dangerouslySetInnerHTML={{ __html: content.replace(/<strong>(.*?)<\/strong>/g, '<span class="font-medium text-purple-800 dark:text-purple-200">$1</span>') }} />
          </div>
        );
      }
      if (part.startsWith('<strong>')) {
        const content = part.replace(/<\/?strong>/g, '');
        return <span key={index} className="font-medium text-purple-800 dark:text-purple-200">{content}</span>;
      }
      return part ? <span key={index} className="text-purple-700 dark:text-purple-300">{part}</span> : null;
    });
  };

  if (!summary && !insights) return null;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* AI Summary Card */}
      {summary && (
        <Card className="border-l-4 border-l-purple-500 bg-gradient-to-br from-purple-50/80 to-blue-50/80 dark:from-purple-950/50 dark:to-blue-950/50 shadow-sm hover:shadow-md transition-shadow">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <Brain className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-purple-800 dark:text-purple-200 flex items-center gap-2">
                    AI Summary
                    <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                      Generated
                    </Badge>
                  </h3>
                  <p className="text-sm text-purple-600 dark:text-purple-400">Key insights from your note</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(summary, 'summary')}
                  className="h-8 w-8 p-0 hover:bg-purple-100 dark:hover:bg-purple-900"
                >
                  {copiedSection === 'summary' ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4 text-purple-600" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="h-8 w-8 p-0 hover:bg-purple-100 dark:hover:bg-purple-900"
                >
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-purple-600" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-purple-600" />
                  )}
                </Button>
              </div>
            </div>
            
            {isExpanded && (
              <div className="prose prose-sm max-w-none">
                <div className="space-y-2">
                  {renderFormattedText(summary)}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* AI Insights Card */}
      {insights && Object.keys(insights).length > 0 && (
        <Card className="border-l-4 border-l-amber-500 bg-gradient-to-br from-amber-50/80 to-orange-50/80 dark:from-amber-950/50 dark:to-orange-950/50 shadow-sm hover:shadow-md transition-shadow">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-amber-100 dark:bg-amber-900 rounded-lg">
                <Sparkles className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h3 className="font-semibold text-amber-800 dark:text-amber-200 flex items-center gap-2">
                  Key Insights & Actions
                  <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300">
                    AI Powered
                  </Badge>
                </h3>
                <p className="text-sm text-amber-600 dark:text-amber-400">Recommended actions and analysis</p>
              </div>
            </div>
            
            <div className="space-y-6">
              {insights.key_insights && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="h-4 w-4 text-amber-600" />
                    <h4 className="font-medium text-amber-800 dark:text-amber-200">Key Insights</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(insights.key_insights.join('\n'), 'insights')}
                      className="h-6 w-6 p-0 ml-auto hover:bg-amber-100 dark:hover:bg-amber-900"
                    >
                      {copiedSection === 'insights' ? (
                        <CheckCircle className="h-3 w-3 text-green-600" />
                      ) : (
                        <Copy className="h-3 w-3 text-amber-600" />
                      )}
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {insights.key_insights.map((insight: string, index: number) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-amber-50/50 dark:bg-amber-950/30 rounded-lg">
                        <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                        <span className="text-amber-700 dark:text-amber-300 text-sm leading-relaxed">{insight}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {insights.next_steps && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Target className="h-4 w-4 text-amber-600" />
                    <h4 className="font-medium text-amber-800 dark:text-amber-200">Next Steps</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(insights.next_steps.join('\n'), 'steps')}
                      className="h-6 w-6 p-0 ml-auto hover:bg-amber-100 dark:hover:bg-amber-900"
                    >
                      {copiedSection === 'steps' ? (
                        <CheckCircle className="h-3 w-3 text-green-600" />
                      ) : (
                        <Copy className="h-3 w-3 text-amber-600" />
                      )}
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {insights.next_steps.map((step: string, index: number) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-amber-50/50 dark:bg-amber-950/30 rounded-lg">
                        <div className="flex items-center justify-center w-5 h-5 bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200 rounded-full text-xs font-medium mt-0.5 flex-shrink-0">
                          {index + 1}
                        </div>
                        <span className="text-amber-700 dark:text-amber-300 text-sm leading-relaxed">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default AISummaryRenderer;
