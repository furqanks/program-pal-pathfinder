import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, BarChart, Calendar, Globe, DollarSign, PieChart } from "lucide-react";
import { useProgramContext } from "@/contexts/ProgramContext";
import { useOpenAI } from "@/contexts/OpenAIContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const Insights = () => {
  const { programs } = useProgramContext();
  const { analyzeShortlist } = useOpenAI();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [insights, setInsights] = useState<string[] | null>(null);
  
  const hasEnoughPrograms = programs.length >= 3;
  
  const handleAnalyzeShortlist = async () => {
    setIsAnalyzing(true);
    
    try {
      const response = await analyzeShortlist(programs);
      
      if (response) {
        setInsights(response.insights);
      }
    } catch (error) {
      console.error("Shortlist analysis error:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  // Extract some statistics for the charts
  const countryDistribution = programs.reduce((acc, program) => {
    acc[program.country] = (acc[program.country] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const degreeTypeDistribution = programs.reduce((acc, program) => {
    acc[program.degreeType] = (acc[program.degreeType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Shortlist Insights</h1>
        <p className="text-muted-foreground mt-1">
          Get AI-powered analysis of your program shortlist
        </p>
      </div>
      
      {!hasEnoughPrograms && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-8">
            <BarChart className="h-16 w-16 text-muted-foreground opacity-50 mb-4" />
            <h3 className="text-xl font-medium mb-2">Add more programs to get insights</h3>
            <p className="text-center text-muted-foreground mb-4">
              You need at least 3 programs in your shortlist to generate insights.
              Currently you have {programs.length}.
            </p>
          </CardContent>
        </Card>
      )}
      
      {hasEnoughPrograms && !insights && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-8">
            <Sparkles className="h-16 w-16 text-muted-foreground opacity-50 mb-4" />
            <h3 className="text-xl font-medium mb-2">Ready to analyze your shortlist</h3>
            <p className="text-center text-muted-foreground mb-4">
              Get AI-powered insights on your {programs.length} shortlisted programs.
            </p>
            <Button onClick={handleAnalyzeShortlist} disabled={isAnalyzing} size="lg">
              {isAnalyzing ? "Analyzing..." : "Analyze My Shortlist"}
            </Button>
          </CardContent>
        </Card>
      )}
      
      {isAnalyzing && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Analyzing Your Shortlist...
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
      )}
      
      {insights && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Shortlist Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                {insights.map((insight, i) => (
                  <li key={i} className="flex gap-2">
                    <Badge variant="outline" className="shrink-0 mt-0.5 h-5 w-5 flex items-center justify-center p-0">
                      {i + 1}
                    </Badge>
                    <p>{insight}</p>
                  </li>
                ))}
              </ul>
              <div className="pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setInsights(null);
                  }}
                >
                  Reset Analysis
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Country Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(countryDistribution).map(([country, count]) => (
                    <div key={country} className="flex justify-between items-center">
                      <div className="flex items-center">
                        <Badge variant="outline" className="mr-2">
                          {count}
                        </Badge>
                        {country}
                      </div>
                      <div className="w-1/2 bg-muted rounded-full h-2 overflow-hidden">
                        <div 
                          className="bg-primary h-full" 
                          style={{ width: `${(count / programs.length) * 100}%` }} 
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <PieChart className="h-4 w-4" />
                  Degree Types
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(degreeTypeDistribution).map(([degreeType, count]) => (
                    <div key={degreeType} className="flex justify-between items-center">
                      <div className="flex items-center">
                        <Badge variant="outline" className="mr-2">
                          {count}
                        </Badge>
                        {degreeType}
                      </div>
                      <div className="w-1/2 bg-muted rounded-full h-2 overflow-hidden">
                        <div 
                          className="bg-primary h-full" 
                          style={{ width: `${(count / programs.length) * 100}%` }} 
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Upcoming Deadlines
                </CardTitle>
              </CardHeader>
              <CardContent>
                {programs
                  .filter(p => p.deadline && p.deadline.trim() !== '')
                  .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
                  .slice(0, 3)
                  .map(program => (
                    <div key={program.id} className="flex justify-between items-center mb-2">
                      <div className="truncate mr-2">
                        <div className="font-medium truncate">{program.programName}</div>
                        <div className="text-xs text-muted-foreground truncate">
                          {program.university}
                        </div>
                      </div>
                      <Badge>
                        {new Date(program.deadline).toLocaleDateString()}
                      </Badge>
                    </div>
                  ))}
                
                {programs.filter(p => p.deadline && p.deadline.trim() !== '').length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No deadlines set yet
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default Insights;
