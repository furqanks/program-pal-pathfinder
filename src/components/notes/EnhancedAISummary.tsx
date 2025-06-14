
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Brain, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  Copy, 
  CheckCircle,
  Lightbulb,
  Target,
  TrendingUp,
  AlertCircle,
  Calendar,
  Clock
} from "lucide-react";
import { toast } from "sonner";

interface EnhancedAISummaryProps {
  summary?: string;
  insights?: any;
  className?: string;
}

const EnhancedAISummary = ({ summary, insights, className = "" }: EnhancedAISummaryProps) => {
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

  const parseMarkdownToStructured = (text: string) => {
    // Clean up the markdown and structure it
    const lines = text.split('\n').filter(line => line.trim());
    const sections: { title: string; content: string[]; type: string }[] = [];
    let currentSection: { title: string; content: string[]; type: string } | null = null;

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('### ') || trimmed.startsWith('#### ')) {
        if (currentSection) {
          sections.push(currentSection);
        }
        currentSection = {
          title: trimmed.replace(/#{3,4}\s*/, ''),
          content: [],
          type: trimmed.startsWith('### ') ? 'major' : 'minor'
        };
      } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        if (currentSection) {
          currentSection.content.push(trimmed.replace(/^[-*]\s*/, ''));
        }
      } else if (trimmed && !trimmed.startsWith('#')) {
        if (currentSection) {
          currentSection.content.push(trimmed);
        } else {
          // Create a default section for loose content
          if (!currentSection) {
            currentSection = { title: 'Summary', content: [trimmed], type: 'major' };
          }
        }
      }
    }

    if (currentSection) {
      sections.push(currentSection);
    }

    return sections;
  };

  if (!summary && !insights) return null;

  const structuredSummary = summary ? parseMarkdownToStructured(summary) : [];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Main AI Summary */}
      {summary && (
        <Card className="border-l-4 border-l-blue-500 bg-gradient-to-br from-blue-50/80 to-indigo-50/80 dark:from-blue-950/50 dark:to-indigo-950/50 shadow-sm">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Brain className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-800 dark:text-blue-200 flex items-center gap-2">
                    Daily Summary
                    <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                      {new Date().toLocaleDateString()}
                    </Badge>
                  </h3>
                  <p className="text-sm text-blue-600 dark:text-blue-400">AI-generated insights from your notes</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(summary, 'summary')}
                  className="h-8 w-8 p-0 hover:bg-blue-100 dark:hover:bg-blue-900"
                >
                  {copiedSection === 'summary' ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4 text-blue-600" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="h-8 w-8 p-0 hover:bg-blue-100 dark:hover:bg-blue-900"
                >
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-blue-600" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-blue-600" />
                  )}
                </Button>
              </div>
            </div>
            
            {isExpanded && (
              <div className="space-y-4">
                {structuredSummary.map((section, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center gap-2">
                      {section.type === 'major' ? (
                        <Lightbulb className="h-4 w-4 text-blue-600" />
                      ) : (
                        <Target className="h-3 w-3 text-blue-500" />
                      )}
                      <h4 className={`font-medium text-blue-800 dark:text-blue-200 ${
                        section.type === 'major' ? 'text-base' : 'text-sm'
                      }`}>
                        {section.title}
                      </h4>
                    </div>
                    <div className="space-y-1 ml-6">
                      {section.content.map((item, itemIndex) => (
                        <div key={itemIndex} className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
                            {item}
                          </span>
                        </div>
                      ))}
                    </div>
                    {index < structuredSummary.length - 1 && (
                      <Separator className="my-3 bg-blue-200/50" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Enhanced Insights Section */}
      {insights && Object.keys(insights).length > 0 && (
        <div className="grid gap-4">
          {/* Key Insights */}
          {insights.key_insights && (
            <Card className="border-l-4 border-l-amber-500 bg-gradient-to-br from-amber-50/80 to-orange-50/80 dark:from-amber-950/50 dark:to-orange-950/50">
              <div className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-amber-100 dark:bg-amber-900 rounded-lg">
                    <TrendingUp className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  </div>
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
                      <Lightbulb className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-amber-700 dark:text-amber-300 leading-relaxed">
                        {insight}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {/* Next Steps with Timeline */}
          {insights.next_steps && (
            <Card className="border-l-4 border-l-green-500 bg-gradient-to-br from-green-50/80 to-emerald-50/80 dark:from-green-950/50 dark:to-emerald-950/50">
              <div className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                    <Target className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <h4 className="font-medium text-green-800 dark:text-green-200">Action Timeline</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(insights.next_steps.join('\n'), 'steps')}
                    className="h-6 w-6 p-0 ml-auto hover:bg-green-100 dark:hover:bg-green-900"
                  >
                    {copiedSection === 'steps' ? (
                      <CheckCircle className="h-3 w-3 text-green-600" />
                    ) : (
                      <Copy className="h-3 w-3 text-green-600" />
                    )}
                  </Button>
                </div>
                <div className="space-y-3">
                  {insights.next_steps.map((step: string, index: number) => (
                    <div key={index} className="flex items-start gap-4 p-3 bg-green-50/50 dark:bg-green-950/30 rounded-lg">
                      <div className="flex flex-col items-center">
                        <div className="flex items-center justify-center w-6 h-6 bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200 rounded-full text-xs font-medium flex-shrink-0">
                          {index + 1}
                        </div>
                        {index < insights.next_steps.length - 1 && (
                          <div className="w-0.5 h-6 bg-green-300 dark:bg-green-700 mt-2"></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <span className="text-sm text-green-700 dark:text-green-300 leading-relaxed">
                          {step}
                        </span>
                        <div className="flex items-center gap-1 mt-2 text-xs text-green-600 dark:text-green-400">
                          <Clock className="h-3 w-3" />
                          <span>Week {index + 1}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {/* Priority Score */}
          {insights.priority_score && (
            <Card className="border-l-4 border-l-purple-500 bg-gradient-to-br from-purple-50/80 to-violet-50/80 dark:from-purple-950/50 dark:to-violet-950/50">
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-4 w-4 text-purple-600" />
                    <span className="font-medium text-purple-800 dark:text-purple-200">Priority Level</span>
                  </div>
                  <Badge 
                    className={`${
                      insights.priority_score >= 8 ? 'bg-red-100 text-red-800' :
                      insights.priority_score >= 6 ? 'bg-orange-100 text-orange-800' :
                      insights.priority_score >= 4 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}
                  >
                    {insights.priority_score}/10
                  </Badge>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default EnhancedAISummary;
