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

  // Parse AI summary if it's JSON string
  const parseAISummary = (summary: string) => {
    try {
      return JSON.parse(summary);
    } catch {
      return { summary: summary };
    }
  };

  const summaryData = note.ai_summary ? parseAISummary(note.ai_summary) : {};
  const insights = note.ai_insights || {};

  return (
    <div className="mt-12 space-y-6">
      {/* Main AI Summary */}
      {note.ai_summary && (
        <Card className="border-l-4 border-l-purple-500 shadow-sm">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Brain className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="font-semibold text-purple-800 dark:text-purple-200">AI Summary</h3>
                <p className="text-sm text-purple-600 dark:text-purple-400">Generated insights from your note</p>
              </div>
            </div>

            <div className="prose dark:prose-invert max-w-none">
              {summaryData.summary ? (
                <div className="text-purple-700 dark:text-purple-300 leading-relaxed">
                  <div dangerouslySetInnerHTML={{ __html: summaryData.summary }} />
                </div>
              ) : (
                <p className="text-purple-700 dark:text-purple-300 leading-relaxed">
                  {note.ai_summary}
                </p>
              )}

              {/* Key Points Table */}
              {summaryData.keyPoints && summaryData.keyPoints.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-medium text-purple-800 dark:text-purple-200 mb-3 flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Key Points
                  </h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-20">Priority</TableHead>
                        <TableHead>Point</TableHead>
                        <TableHead>Category</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {summaryData.keyPoints.map((point: any, index: number) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Badge variant={point.priority === 'high' ? 'destructive' : point.priority === 'medium' ? 'default' : 'secondary'}>
                              {point.priority || 'Low'}
                            </Badge>
                          </TableCell>
                          <TableCell>{point.content || point}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{point.category || 'General'}</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {/* Topics Overview */}
              {summaryData.topics && summaryData.topics.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-medium text-purple-800 dark:text-purple-200 mb-3">Topics Covered</h4>
                  <div className="flex flex-wrap gap-2">
                    {summaryData.topics.map((topic: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-purple-700 border-purple-300">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* AI Insights */}
      {insights && Object.keys(insights).length > 0 && (
        <Card className="border-l-4 border-l-amber-500 shadow-sm">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-amber-100 dark:bg-amber-900 rounded-lg">
                <Sparkles className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h3 className="font-semibold text-amber-800 dark:text-amber-200">AI Insights & Recommendations</h3>
                <p className="text-sm text-amber-600 dark:text-amber-400">AI-powered analysis and actionable next steps</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Key Insights */}
              {insights.key_insights && insights.key_insights.length > 0 && (
                <div>
                  <h4 className="font-medium text-amber-800 dark:text-amber-200 mb-3 flex items-center gap-2">
                    <Lightbulb className="h-4 w-4" />
                    Key Insights
                  </h4>
                  <div className="grid gap-3">
                    {insights.key_insights.map((insight: string, index: number) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-amber-50/50 dark:bg-amber-950/30 rounded-lg">
                        <span className="w-6 h-6 bg-amber-500 text-white text-xs rounded-full flex items-center justify-center mt-0.5 font-medium">
                          {index + 1}
                        </span>
                        <span className="text-amber-700 dark:text-amber-300 leading-relaxed">{insight}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {insights.key_insights && insights.next_steps && (
                <Separator className="bg-amber-200 dark:bg-amber-800" />
              )}

              {/* Next Steps */}
              {insights.next_steps && insights.next_steps.length > 0 && (
                <div>
                  <h4 className="font-medium text-amber-800 dark:text-amber-200 mb-3 flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Recommended Next Steps
                  </h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16">Step</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead className="w-24">Priority</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {insights.next_steps.map((step: string, index: number) => (
                        <TableRow key={index}>
                          <TableCell>
                            <div className="w-8 h-8 bg-amber-500 text-white text-sm rounded-full flex items-center justify-center font-medium">
                              {index + 1}
                            </div>
                          </TableCell>
                          <TableCell className="text-amber-700 dark:text-amber-300">{step}</TableCell>
                          <TableCell>
                            <Badge variant={index < 2 ? 'default' : 'secondary'}>
                              {index < 2 ? 'High' : 'Medium'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {/* Confidence Score */}
              {insights.confidence_score && (
                <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-amber-800 dark:text-amber-200">Analysis Confidence</span>
                    <Badge variant="outline" className="text-amber-700 border-amber-300">
                      {Math.round(insights.confidence_score * 100)}%
                    </Badge>
                  </div>
                  <div className="mt-2 w-full bg-amber-200 dark:bg-amber-800 rounded-full h-2">
                    <div 
                      className="bg-amber-500 h-2 rounded-full transition-all duration-300" 
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