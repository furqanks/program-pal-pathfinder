
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, BarChart3, TrendingUp, LogIn } from 'lucide-react';
import { useProgramContext } from '@/contexts/ProgramContext';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

const Insights = () => {
  const { programs, analyzeShortlist, isAuthenticated } = useProgramContext();
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  const handleAnalyzeShortlist = async () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to analyze your shortlist");
      navigate('/auth');
      return;
    }

    if (programs.length < 3) {
      toast.error("Please add at least 3 programs to analyze your shortlist");
      return;
    }

    setLoading(true);
    try {
      const result = await analyzeShortlist();
      if (result) {
        setAnalysisData(result);
      }
    } catch (error) {
      console.error("Error analyzing shortlist:", error);
      toast.error("Failed to analyze shortlist");
    } finally {
      setLoading(false);
    }
  };

  // Show sign in prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className={cn("min-h-screen bg-background", "container mx-auto", isMobile ? "p-2" : "p-4")}>
        <div className={cn(
          "flex justify-between items-center mb-6",
          isMobile ? "flex-col gap-4 items-start" : ""
        )}>
          <h1 className={cn(
            "font-semibold text-foreground",
            isMobile ? "text-xl" : "text-2xl"
          )}>Application Insights</h1>
        </div>

        <div className={cn(
          "flex flex-col items-center justify-center text-center bg-card rounded-lg border border-border",
          isMobile ? "p-8" : "p-12"
        )}>
          <LogIn className={cn(
            "text-muted-foreground mb-4",
            isMobile ? "h-10 w-10" : "h-12 w-12"
          )} />
          <h2 className={cn(
            "font-medium mb-2 text-card-foreground",
            isMobile ? "text-lg" : "text-xl"
          )}>Sign In Required</h2>
          <p className={cn(
            "text-muted-foreground max-w-md mb-4",
            isMobile ? "text-sm" : ""
          )}>
            Please sign in to access AI-powered insights about your program selections.
          </p>
          <Button 
            onClick={() => navigate('/auth')}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("min-h-screen bg-background", "container mx-auto", isMobile ? "p-2" : "p-4")}>
      <div className={cn(
        "flex justify-between items-center mb-6",
        isMobile ? "flex-col gap-4 items-start" : ""
      )}>
        <h1 className={cn(
          "font-semibold text-foreground",
          isMobile ? "text-xl" : "text-2xl"
        )}>Application Insights</h1>
        <Button 
          onClick={handleAnalyzeShortlist} 
          disabled={loading || programs.length < 3}
          className={cn(
            "bg-primary text-primary-foreground hover:bg-primary/90",
            isMobile ? "w-full" : ""
          )}
        >
          {loading ? "Analyzing..." : "Analyze My Shortlist"}
        </Button>
      </div>

      {analysisData ? (
        <div className={cn(
          "grid gap-4",
          isMobile ? "grid-cols-1" : "md:grid-cols-2"
        )}>
          {/* Summary Card */}
          <Card className="bg-card border-border">
            <CardHeader className={isMobile ? "pb-3" : ""}>
              <CardTitle className={cn(
                "flex items-center gap-2 text-card-foreground",
                isMobile ? "text-lg" : ""
              )}>
                <TrendingUp className="h-5 w-5 text-primary" />
                Shortlist Analysis
              </CardTitle>
              <CardDescription className="text-muted-foreground">AI-powered analysis of your program selections</CardDescription>
            </CardHeader>
            <CardContent className={isMobile ? "space-y-3" : ""}>
              <p className="mb-4 text-card-foreground">{analysisData.summary}</p>
              <h3 className="font-medium mb-2 text-card-foreground">Suggestions:</h3>
              <ul className="list-disc list-inside space-y-1">
                {analysisData.suggestions.map((suggestion: string, index: number) => (
                  <li key={index} className="text-sm text-muted-foreground">{suggestion}</li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Statistics Card */}
          <Card className="bg-card border-border">
            <CardHeader className={isMobile ? "pb-3" : ""}>
              <CardTitle className={cn(
                "flex items-center gap-2 text-card-foreground",
                isMobile ? "text-lg" : ""
              )}>
                <BarChart3 className="h-5 w-5 text-primary" />
                Program Statistics
              </CardTitle>
              <CardDescription className="text-muted-foreground">Breakdown of your program selections</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium text-card-foreground">Geographic Analysis</h3>
                <p className="text-sm text-muted-foreground">{analysisData.countryAnalysis}</p>
              </div>
              <div>
                <h3 className="font-medium text-card-foreground">Degree Type Balance</h3>
                <p className="text-sm text-muted-foreground">{analysisData.degreeTypeAnalysis}</p>
              </div>
              <div>
                <h3 className="font-medium text-card-foreground">Timeline Insights</h3>
                <p className="text-sm text-muted-foreground">{analysisData.timelineInsight}</p>
              </div>
              <div>
                <h3 className="font-medium text-card-foreground">Financial Considerations</h3>
                <p className="text-sm text-muted-foreground">{analysisData.financialInsight}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className={cn(
          "flex flex-col items-center justify-center text-center bg-card rounded-lg border border-border",
          isMobile ? "p-8" : "p-12"
        )}>
          <AlertCircle className={cn(
            "text-muted-foreground mb-4",
            isMobile ? "h-10 w-10" : "h-12 w-12"
          )} />
          <h2 className={cn(
            "font-medium mb-2 text-card-foreground",
            isMobile ? "text-lg" : "text-xl"
          )}>No Analysis Available</h2>
          <p className={cn(
            "text-muted-foreground max-w-md",
            isMobile ? "text-sm" : ""
          )}>
            Click "Analyze My Shortlist" to generate AI-powered insights about your program selections.
            You need at least 3 programs in your shortlist.
          </p>
          {programs.length < 3 && (
            <p className={cn(
              "text-sm text-destructive mt-2",
              isMobile ? "text-xs" : ""
            )}>
              Currently {programs.length} programs in your shortlist. Add {3 - programs.length} more to enable analysis.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default Insights;
