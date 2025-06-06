
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  Lightbulb, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Target,
  Sparkles,
  RefreshCw
} from "lucide-react";
import { useAINotesContext } from "@/contexts/AINotesContext";
import { useProgramContext } from "@/contexts/ProgramContext";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface InsightData {
  patterns: string[];
  strengths: string[];
  improvement_areas: string[];
  recommendations: string[];
  red_flags: string[];
  overall_assessment: string;
}

const EnhancedInsights = () => {
  const [insightData, setInsightData] = useState<InsightData | null>(null);
  const [loading, setLoading] = useState(false);
  const { notes } = useAINotesContext();
  const { programs } = useProgramContext();

  const generateInsights = async () => {
    if (notes.length === 0) {
      toast.error("Add some notes first to get insights! 📝");
      return;
    }

    setLoading(true);
    try {
      // Mock AI analysis for now
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockInsights: InsightData = {
        patterns: [
          "You're consistently worried about deadlines (totally normal btw!)",
          "Strong focus on research programs - good prioritization 👍",
          "Money concerns keep coming up - we should address this"
        ],
        strengths: [
          "You're being super proactive with research",
          "Great attention to detail in requirements",
          "Asking the right questions about fit and culture"
        ],
        improvement_areas: [
          "Time management around deadlines needs work",
          "Could use more confidence in your achievements",
          "Network building seems to be on the back burner"
        ],
        recommendations: [
          "Set up a deadline tracker ASAP - your future self will thank you",
          "Schedule 30 mins daily for application tasks",
          "Reach out to 2 current students/alumni this week"
        ],
        red_flags: [
          "Mentioned feeling overwhelmed multiple times - let's tackle this",
          "Haven't started personal statement yet and deadline is approaching"
        ],
        overall_assessment: "You're doing better than you think! 💪 The anxiety is normal and shows you care. Just need to channel that energy into consistent action. You've got the research skills and drive - now it's about execution and believing in yourself."
      };

      setInsightData(mockInsights);
      toast.success("Fresh insights ready! 🧠✨");
    } catch (error) {
      console.error("Error generating insights:", error);
      toast.error("Failed to generate insights");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-white/70 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            Smart Insights & Real Talk
          </CardTitle>
          <Button 
            onClick={generateInsights} 
            disabled={loading || notes.length === 0}
            variant="outline"
            size="sm"
          >
            {loading ? (
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            {insightData ? "Refresh Insights" : "Get Insights"}
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {!insightData && !loading && (
          <div className="text-center py-8 border-2 border-dashed border-purple-200 rounded-lg">
            <Brain className="h-12 w-12 text-purple-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No insights yet</h3>
            <p className="text-gray-500 mb-6">
              Get personalized insights and recommendations based on your notes
            </p>
            <Button onClick={generateInsights} disabled={notes.length === 0}>
              <Sparkles className="mr-2 h-4 w-4" />
              Analyze My Journey
            </Button>
          </div>
        )}

        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Analyzing your notes and generating insights...</p>
          </div>
        )}

        {insightData && (
          <div className="space-y-6">
            {/* Overall Assessment */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
              <h4 className="font-medium text-purple-800 mb-2 flex items-center gap-2">
                <Brain className="h-4 w-4" />
                Overall Vibe Check
              </h4>
              <p className="text-purple-700 text-sm">{insightData.overall_assessment}</p>
            </div>

            {/* Strengths */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-800 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                What You're Crushing 🔥
              </h4>
              <div className="grid grid-cols-1 gap-2">
                {insightData.strengths.map((strength, index) => (
                  <div key={index} className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-green-800 text-sm flex items-start gap-2">
                      <span className="text-green-500 mt-1">✨</span>
                      {strength}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Patterns */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-800 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                Patterns I'm Seeing 👀
              </h4>
              <div className="grid grid-cols-1 gap-2">
                {insightData.patterns.map((pattern, index) => (
                  <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-blue-800 text-sm flex items-start gap-2">
                      <span className="text-blue-500 mt-1">📊</span>
                      {pattern}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-800 flex items-center gap-2">
                <Target className="h-4 w-4 text-purple-600" />
                Action Items (Do These!) 🎯
              </h4>
              <div className="grid grid-cols-1 gap-2">
                {insightData.recommendations.map((rec, index) => (
                  <div key={index} className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                    <p className="text-purple-800 text-sm flex items-start gap-2">
                      <span className="text-purple-500 mt-1">💡</span>
                      {rec}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Improvement Areas */}
            {insightData.improvement_areas.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium text-gray-800 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-yellow-600" />
                  Room for Growth 🌱
                </h4>
                <div className="grid grid-cols-1 gap-2">
                  {insightData.improvement_areas.map((area, index) => (
                    <div key={index} className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <p className="text-yellow-800 text-sm flex items-start gap-2">
                        <span className="text-yellow-500 mt-1">💪</span>
                        {area}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Red Flags */}
            {insightData.red_flags.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium text-gray-800 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  Needs Attention ASAP ⚠️
                </h4>
                <div className="grid grid-cols-1 gap-2">
                  {insightData.red_flags.map((flag, index) => (
                    <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-red-800 text-sm flex items-start gap-2">
                        <span className="text-red-500 mt-1">🚨</span>
                        {flag}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EnhancedInsights;
