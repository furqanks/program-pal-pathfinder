import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Lightbulb, AlertTriangle, CheckCircle, Clock, Zap, Target } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface RealtimeAssistantProps {
  documentContent: string;
  documentType: string;
  documentId?: string;
  onContentUpdate?: (content: string) => void;
}

interface RealtimeSuggestion {
  type: 'suggestion' | 'warning' | 'improvement';
  title: string;
  content: string;
  position?: { start: number; end: number };
  actionable?: boolean;
}

interface ContentAnalysis {
  suggestions: string[];
  context: string;
  missingElements: string[];
  gapAnalysis: string;
  completionScore: number;
  toneScore: number;
  toneAnalysis: string;
  redundancyScore: number;
  redundantPhrases: string[];
  wordCount: number;
}

export const RealtimeWritingAssistant = ({ 
  documentContent, 
  documentType, 
  documentId,
  onContentUpdate 
}: RealtimeAssistantProps) => {
  const { user } = useAuth();
  const [analysis, setAnalysis] = useState<ContentAnalysis | null>(null);
  const [suggestions, setSuggestions] = useState<RealtimeSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastAnalyzed, setLastAnalyzed] = useState('');
  const [writingSession, setWritingSession] = useState({ startTime: Date.now(), keystrokes: 0 });

  // Debounced analysis function
  const analyzeContent = useCallback(
    debounce(async (content: string) => {
      if (!content.trim() || content === lastAnalyzed || !user) return;
      
      setLoading(true);
      try {
        // Run multiple analyses in parallel
        const [realtimeSuggestions, contentGaps, toneCheck, redundancyCheck] = await Promise.all([
          supabase.functions.invoke('enhanced-document-processing', {
            body: {
              content,
              documentType,
              action: 'realtime_suggestions',
              userId: user.id,
              documentId
            }
          }),
          supabase.functions.invoke('enhanced-document-processing', {
            body: {
              content,
              documentType,
              action: 'content_gap_detection',
              userId: user.id,
              documentId
            }
          }),
          supabase.functions.invoke('enhanced-document-processing', {
            body: {
              content,
              documentType,
              action: 'tone_consistency',
              userId: user.id,
              documentId
            }
          }),
          supabase.functions.invoke('enhanced-document-processing', {
            body: {
              content,
              documentType,
              action: 'redundancy_check',
              userId: user.id,
              documentId
            }
          })
        ]);

        const analysisData: ContentAnalysis = {
          suggestions: realtimeSuggestions.data?.suggestions || [],
          context: realtimeSuggestions.data?.context || '',
          missingElements: contentGaps.data?.missingElements || [],
          gapAnalysis: contentGaps.data?.gapAnalysis || '',
          completionScore: contentGaps.data?.completionScore || 0,
          toneScore: toneCheck.data?.toneScore || 0,
          toneAnalysis: toneCheck.data?.toneAnalysis || '',
          redundancyScore: redundancyCheck.data?.redundancyScore || 0,
          redundantPhrases: redundancyCheck.data?.redundantPhrases || [],
          wordCount: redundancyCheck.data?.wordCount || 0
        };

        setAnalysis(analysisData);
        generateSuggestions(analysisData);
        setLastAnalyzed(content);

        // Track writing session
        if (documentId) {
          supabase.functions.invoke('enhanced-document-processing', {
            body: {
              action: 'track_writing_session',
              userId: user.id,
              documentId,
              content
            }
          });
        }

      } catch (error) {
        console.error('Analysis error:', error);
      } finally {
        setLoading(false);
      }
    }, 2000),
    [documentType, lastAnalyzed, user, documentId]
  );

  useEffect(() => {
    if (documentContent.length > 50) {
      analyzeContent(documentContent);
    }
  }, [documentContent, analyzeContent]);

  useEffect(() => {
    // Track keystrokes for writing session analytics
    setWritingSession(prev => ({ ...prev, keystrokes: prev.keystrokes + 1 }));
  }, [documentContent]);

  const generateSuggestions = (analysisData: ContentAnalysis) => {
    const newSuggestions: RealtimeSuggestion[] = [];

    // Add realtime suggestions
    analysisData.suggestions.forEach(suggestion => {
      newSuggestions.push({
        type: 'suggestion',
        title: 'Writing Suggestion',
        content: suggestion,
        actionable: true
      });
    });

    // Add content gap warnings
    if (analysisData.missingElements.length > 0) {
      newSuggestions.push({
        type: 'warning',
        title: 'Missing Elements',
        content: `Consider adding: ${analysisData.missingElements.join(', ')}`,
        actionable: true
      });
    }

    // Add tone consistency feedback
    if (analysisData.toneScore < 70) {
      newSuggestions.push({
        type: 'warning',
        title: 'Tone Consistency',
        content: analysisData.toneAnalysis,
        actionable: true
      });
    }

    // Add redundancy warnings
    if (analysisData.redundancyScore < 70) {
      newSuggestions.push({
        type: 'improvement',
        title: 'Reduce Redundancy',
        content: 'Some phrases might be repetitive. Consider varying your language.',
        actionable: true
      });
    }

    // Add completion encouragement
    if (analysisData.completionScore >= 80) {
      newSuggestions.push({
        type: 'improvement',
        title: 'Great Progress!',
        content: 'Your document covers most essential elements. Consider refining for impact.',
        actionable: false
      });
    }

    setSuggestions(newSuggestions);
  };

  const applySuggestion = (suggestion: RealtimeSuggestion) => {
    if (!suggestion.actionable) return;
    
    // In a real implementation, this would apply the suggestion to the document
    toast.success('Suggestion applied! (This is a demo - full implementation would modify the text)');
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'suggestion':
        return <Lightbulb className="h-4 w-4" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />;
      case 'improvement':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Zap className="h-4 w-4" />;
    }
  };

  const getSuggestionColor = (type: string) => {
    switch (type) {
      case 'suggestion':
        return 'text-blue-600 dark:text-blue-400';
      case 'warning':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'improvement':
        return 'text-green-600 dark:text-green-400';
      default:
        return 'text-primary';
    }
  };

  if (!analysis && !loading) return null;

  return (
    <div className="space-y-4">
      {/* Real-time Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">{analysis?.wordCount || 0}</div>
              <div className="text-xs text-muted-foreground">Words</div>
            </div>
            <Target className="h-5 w-5 text-muted-foreground" />
          </div>
        </Card>
        
        <Card className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">{analysis?.completionScore || 0}%</div>
              <div className="text-xs text-muted-foreground">Complete</div>
            </div>
            <CheckCircle className="h-5 w-5 text-muted-foreground" />
          </div>
        </Card>
        
        <Card className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">{analysis?.toneScore || 0}%</div>
              <div className="text-xs text-muted-foreground">Tone</div>
            </div>
            <Zap className="h-5 w-5 text-muted-foreground" />
          </div>
        </Card>
        
        <Card className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">{Math.round((Date.now() - writingSession.startTime) / 60000)}m</div>
              <div className="text-xs text-muted-foreground">Session</div>
            </div>
            <Clock className="h-5 w-5 text-muted-foreground" />
          </div>
        </Card>
      </div>

      {/* Completion Progress */}
      {analysis && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Document Completion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Overall Progress</span>
                <span>{analysis.completionScore}%</span>
              </div>
              <Progress value={analysis.completionScore} />
              {analysis.missingElements.length > 0 && (
                <div className="text-xs text-muted-foreground">
                  Missing: {analysis.missingElements.slice(0, 3).join(', ')}
                  {analysis.missingElements.length > 3 && ` +${analysis.missingElements.length - 3} more`}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Real-time Suggestions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            Writing Assistant
            {loading && <div className="animate-spin h-3 w-3 border border-current border-t-transparent rounded-full" />}
          </CardTitle>
          <CardDescription>
            Real-time suggestions to improve your writing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {suggestions.length > 0 ? suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className={cn("mt-0.5", getSuggestionColor(suggestion.type))}>
                  {getSuggestionIcon(suggestion.type)}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">{suggestion.title}</h4>
                    <Badge variant="outline" className="text-xs">
                      {suggestion.type}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{suggestion.content}</p>
                  {suggestion.actionable && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => applySuggestion(suggestion)}
                      className="h-6 text-xs"
                    >
                      Apply
                    </Button>
                  )}
                </div>
              </div>
            )) : !loading && (
              <div className="text-center py-4 text-muted-foreground text-sm">
                {documentContent.length > 50 
                  ? "Your writing looks good so far! Keep going to get more suggestions."
                  : "Start writing to get real-time suggestions and feedback."
                }
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Debounce utility function
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}