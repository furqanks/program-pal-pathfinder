import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Brain, Sparkles, Target, Lightbulb } from "lucide-react";

interface AISummaryDisplayProps {
  note: any;
}

const AISummaryDisplay = ({ note }: AISummaryDisplayProps) => {
  if (!note?.ai_summary && !note?.ai_insights) return null;

  // Process markdown text into readable format
  const processMarkdownSummary = (text: string) => {
    if (!text) return "";
    
    // Remove markdown syntax and clean up formatting
    let processed = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
      .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic
      .replace(/#{1,6}\s+(.*)/g, '<h3>$1</h3>') // Headers
      .replace(/\n\n/g, '</p><p>') // Paragraphs
      .replace(/\n/g, '<br/>') // Line breaks
      .replace(/^\s*[-*+]\s+(.*)/gm, '<li>$1</li>') // List items
      .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>'); // Wrap lists
    
    // Wrap in paragraph if not already wrapped
    if (!processed.includes('<p>') && !processed.includes('<h3>')) {
      processed = `<p>${processed}</p>`;
    } else if (processed.includes('<p>')) {
      processed = `<p>${processed}</p>`;
    }
    
    return processed;
  };

  const insights = note.ai_insights || {};

  return (
    <div className="mt-8 sm:mt-12 space-y-4 sm:space-y-6">
      {/* Main AI Summary */}
      {note.ai_summary && (
        <Card className="border shadow-sm">
          <div className="p-4 sm:p-6">
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="p-1.5 sm:p-2 bg-muted rounded-lg">
                <Brain className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-sm sm:text-base">AI Summary</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">Generated insights from your note</p>
              </div>
            </div>

            <div className="prose dark:prose-invert max-w-none prose-sm sm:prose-base">
              <div className="leading-relaxed text-sm sm:text-base">
                <div dangerouslySetInnerHTML={{ __html: processMarkdownSummary(note.ai_summary) }} />
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* AI Insights */}
      {insights && Object.keys(insights).length > 0 && (
        <Card className="border shadow-sm">
          <div className="p-4 sm:p-6">
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="p-1.5 sm:p-2 bg-muted rounded-lg">
                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-sm sm:text-base">AI Insights & Recommendations</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">AI-powered analysis and actionable next steps</p>
              </div>
            </div>

            <div className="space-y-4 sm:space-y-6">
              {/* Key Insights */}
              {insights.key_insights && insights.key_insights.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base">
                    <Lightbulb className="h-3 w-3 sm:h-4 sm:w-4" />
                    Key Insights
                  </h4>
                  <div className="grid gap-2 sm:gap-3">
                    {insights.key_insights.map((insight: string, index: number) => (
                      <div key={index} className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-muted/50 rounded-lg">
                        <span className="w-5 h-5 sm:w-6 sm:h-6 bg-foreground text-background text-xs rounded-full flex items-center justify-center mt-0.5 font-medium flex-shrink-0">
                          {index + 1}
                        </span>
                        <span className="leading-relaxed text-xs sm:text-sm">{insight}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {insights.key_insights && insights.next_steps && (
                <Separator />
              )}

              {/* Next Steps */}
              {insights.next_steps && insights.next_steps.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base">
                    <Target className="h-3 w-3 sm:h-4 sm:w-4" />
                    Recommended Next Steps
                  </h4>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12 sm:w-16 text-xs sm:text-sm">Step</TableHead>
                          <TableHead className="text-xs sm:text-sm">Action</TableHead>
                          <TableHead className="w-20 sm:w-24 text-xs sm:text-sm">Priority</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {insights.next_steps.map((step: string, index: number) => (
                          <TableRow key={index}>
                            <TableCell>
                              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-foreground text-background text-xs sm:text-sm rounded-full flex items-center justify-center font-medium">
                                {index + 1}
                              </div>
                            </TableCell>
                            <TableCell className="text-xs sm:text-sm">{step}</TableCell>
                            <TableCell>
                              <Badge variant={index < 2 ? 'default' : 'secondary'} className="text-xs px-1 sm:px-2">
                                {index < 2 ? 'High' : 'Medium'}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              {/* Confidence Score */}
              {insights.confidence_score && (
                <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm font-medium">Analysis Confidence</span>
                    <Badge variant="outline" className="text-xs px-1 sm:px-2">
                      {Math.round(insights.confidence_score * 100)}%
                    </Badge>
                  </div>
                  <div className="mt-2 w-full bg-muted rounded-full h-1.5 sm:h-2">
                    <div 
                      className="bg-foreground h-1.5 sm:h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${insights.confidence_score * 100}%` }}
                    />
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

export default AISummaryDisplay;