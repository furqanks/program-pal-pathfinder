
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, BarChart3, TrendingUp } from 'lucide-react';
import { useProgramContext } from '@/contexts/ProgramContext';
import { toast } from 'sonner';

const Insights = () => {
  const { programs, analyzeShortlist } = useProgramContext();
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyzeShortlist = async () => {
    if (programs.length < 3) {
      toast.error("Please add at least 3 programs to analyze your shortlist");
      return;
    }

    setLoading(true);
    try {
      const result = await analyzeShortlist();
      setAnalysisData(result);
    } catch (error) {
      console.error("Error analyzing shortlist:", error);
      toast.error("Failed to analyze shortlist");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Application Insights</h1>
        <Button onClick={handleAnalyzeShortlist} disabled={loading || programs.length < 3}>
          {loading ? "Analyzing..." : "Analyze My Shortlist"}
        </Button>
      </div>

      {analysisData ? (
        <div className="grid gap-4 md:grid-cols-2">
          {/* Summary Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Shortlist Analysis
              </CardTitle>
              <CardDescription>AI-powered analysis of your program selections</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">{analysisData.summary}</p>
              <h3 className="font-medium mb-2">Suggestions:</h3>
              <ul className="list-disc list-inside space-y-1">
                {analysisData.suggestions.map((suggestion: string, index: number) => (
                  <li key={index} className="text-sm">{suggestion}</li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Statistics Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Program Statistics
              </CardTitle>
              <CardDescription>Breakdown of your program selections</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium">Geographic Analysis</h3>
                <p className="text-sm text-muted-foreground">{analysisData.countryAnalysis}</p>
              </div>
              <div>
                <h3 className="font-medium">Degree Type Balance</h3>
                <p className="text-sm text-muted-foreground">{analysisData.degreeTypeAnalysis}</p>
              </div>
              <div>
                <h3 className="font-medium">Timeline Insights</h3>
                <p className="text-sm text-muted-foreground">{analysisData.timelineInsight}</p>
              </div>
              <div>
                <h3 className="font-medium">Financial Considerations</h3>
                <p className="text-sm text-muted-foreground">{analysisData.financialInsight}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-medium mb-2">No Analysis Available</h2>
          <p className="text-muted-foreground max-w-md">
            Click "Analyze My Shortlist" to generate AI-powered insights about your program selections.
            You need at least 3 programs in your shortlist.
          </p>
        </div>
      )}
    </div>
  );
};

export default Insights;
