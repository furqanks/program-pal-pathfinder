
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
  RefreshCw,
  Zap,
  Star,
  Flame
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
    <Card className="bg-white/80 backdrop-blur-sm border-2 border-transparent gen-z-gradient-electric p-[2px] rounded-xl overflow-hidden">
      <div className="bg-white rounded-xl">
        <CardHeader className="bg-gradient-to-r from-purple-50 via-pink-50 to-blue-50">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl flex items-center gap-3">
              <div className="relative">
                <Brain className="h-6 w-6 text-gen-z-electric animate-pulse" />
                <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-gen-z-neon-pink" />
              </div>
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent font-bold">
                AI Insights & Real Talk
              </span>
            </CardTitle>
            <Button 
              onClick={generateInsights} 
              disabled={loading || notes.length === 0}
              className="gen-z-gradient-sunset text-white border-0 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              size="sm"
            >
              {loading ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Zap className="mr-2 h-4 w-4" />
              )}
              {insightData ? "Refresh Vibes" : "Get Insights"}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {!insightData && !loading && (
            <div className="text-center py-12 relative">
              <div className="absolute inset-0 gen-z-gradient-lavender opacity-5 rounded-lg"></div>
              <div className="relative z-10">
                <div className="relative mb-6">
                  <Brain className="h-16 w-16 text-gen-z-electric mx-auto animate-pulse" />
                  <Sparkles className="absolute top-2 right-1/2 transform translate-x-8 h-4 w-4 text-gen-z-neon-pink animate-bounce" />
                  <Star className="absolute bottom-2 left-1/2 transform -translate-x-8 h-3 w-3 text-gen-z-cyber-yellow animate-bounce delay-300" />
                </div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
                  No insights yet ✨
                </h3>
                <p className="text-gray-600 mb-8 text-lg">
                  Ready to get some AI magic on your notes? Let's see what patterns we can find! 🔮
                </p>
                <Button 
                  onClick={generateInsights} 
                  disabled={notes.length === 0}
                  className="gen-z-gradient-electric text-white border-0 font-bold px-8 py-3 text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 neon-glow"
                >
                  <Flame className="mr-3 h-5 w-5" />
                  Analyze My Journey 🚀
                </Button>
              </div>
            </div>
          )}

          {loading && (
            <div className="text-center py-12">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-transparent bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-border mx-auto mb-6">
                  <div className="absolute inset-2 bg-white rounded-full"></div>
                </div>
                <Sparkles className="absolute top-8 left-1/2 transform -translate-x-1/2 h-4 w-4 text-gen-z-neon-pink animate-pulse" />
              </div>
              <p className="text-lg font-medium bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Analyzing your notes... This is about to be fire! 🔥
              </p>
            </div>
          )}

          {insightData && (
            <div className="space-y-8">
              {/* Overall Assessment */}
              <div className="relative overflow-hidden rounded-xl">
                <div className="absolute inset-0 gen-z-gradient-electric opacity-10"></div>
                <div className="relative p-6 border-2 border-purple-200 rounded-xl">
                  <h4 className="font-bold text-lg text-purple-800 mb-3 flex items-center gap-2">
                    <Brain className="h-5 w-5 text-gen-z-electric" />
                    <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      Overall Vibe Check ✨
                    </span>
                  </h4>
                  <p className="text-purple-700 leading-relaxed font-medium">{insightData.overall_assessment}</p>
                </div>
              </div>

              {/* Strengths */}
              <div className="space-y-4">
                <h4 className="font-bold text-xl flex items-center gap-3">
                  <CheckCircle className="h-6 w-6 text-gen-z-mint" />
                  <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    What You're Crushing 🔥
                  </span>
                </h4>
                <div className="grid grid-cols-1 gap-4">
                  {insightData.strengths.map((strength, index) => (
                    <div key={index} className="relative overflow-hidden rounded-xl group hover:scale-102 transition-transform duration-200">
                      <div className="absolute inset-0 gen-z-gradient-mint opacity-20 group-hover:opacity-30 transition-opacity"></div>
                      <div className="relative bg-green-50 border-2 border-green-200 rounded-xl p-4">
                        <p className="text-green-800 font-medium flex items-start gap-3">
                          <span className="text-gen-z-mint text-xl mt-1 flex-shrink-0">✨</span>
                          <span>{strength}</span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Patterns */}
              <div className="space-y-4">
                <h4 className="font-bold text-xl flex items-center gap-3">
                  <TrendingUp className="h-6 w-6 text-gen-z-electric" />
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Patterns I'm Seeing 👀
                  </span>
                </h4>
                <div className="grid grid-cols-1 gap-4">
                  {insightData.patterns.map((pattern, index) => (
                    <div key={index} className="relative overflow-hidden rounded-xl group hover:scale-102 transition-transform duration-200">
                      <div className="absolute inset-0 gen-z-gradient-electric opacity-15 group-hover:opacity-25 transition-opacity"></div>
                      <div className="relative bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                        <p className="text-blue-800 font-medium flex items-start gap-3">
                          <span className="text-gen-z-electric text-xl mt-1 flex-shrink-0">📊</span>
                          <span>{pattern}</span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendations */}
              <div className="space-y-4">
                <h4 className="font-bold text-xl flex items-center gap-3">
                  <Target className="h-6 w-6 text-gen-z-neon-pink" />
                  <span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                    Action Items (Do These!) 🎯
                  </span>
                </h4>
                <div className="grid grid-cols-1 gap-4">
                  {insightData.recommendations.map((rec, index) => (
                    <div key={index} className="relative overflow-hidden rounded-xl group hover:scale-102 transition-transform duration-200">
                      <div className="absolute inset-0 gen-z-gradient-sunset opacity-15 group-hover:opacity-25 transition-opacity"></div>
                      <div className="relative bg-purple-50 border-2 border-purple-200 rounded-xl p-4">
                        <p className="text-purple-800 font-medium flex items-start gap-3">
                          <span className="text-gen-z-neon-pink text-xl mt-1 flex-shrink-0">💡</span>
                          <span>{rec}</span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Improvement Areas */}
              {insightData.improvement_areas.length > 0 && (
                <div className="space-y-4">
                  <h4 className="font-bold text-xl flex items-center gap-3">
                    <Lightbulb className="h-6 w-6 text-gen-z-cyber-yellow" />
                    <span className="bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                      Room for Growth 🌱
                    </span>
                  </h4>
                  <div className="grid grid-cols-1 gap-4">
                    {insightData.improvement_areas.map((area, index) => (
                      <div key={index} className="relative overflow-hidden rounded-xl group hover:scale-102 transition-transform duration-200">
                        <div className="absolute inset-0 gen-z-gradient-sunset opacity-10 group-hover:opacity-20 transition-opacity"></div>
                        <div className="relative bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
                          <p className="text-yellow-800 font-medium flex items-start gap-3">
                            <span className="text-gen-z-cyber-yellow text-xl mt-1 flex-shrink-0">💪</span>
                            <span>{area}</span>
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Red Flags */}
              {insightData.red_flags.length > 0 && (
                <div className="space-y-4">
                  <h4 className="font-bold text-xl flex items-center gap-3">
                    <AlertTriangle className="h-6 w-6 text-gen-z-coral animate-pulse" />
                    <span className="bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                      Needs Attention ASAP ⚠️
                    </span>
                  </h4>
                  <div className="grid grid-cols-1 gap-4">
                    {insightData.red_flags.map((flag, index) => (
                      <div key={index} className="relative overflow-hidden rounded-xl group hover:scale-102 transition-transform duration-200 neon-pink-glow">
                        <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-pink-500 opacity-10 group-hover:opacity-20 transition-opacity"></div>
                        <div className="relative bg-red-50 border-2 border-red-300 rounded-xl p-4">
                          <p className="text-red-800 font-medium flex items-start gap-3">
                            <span className="text-gen-z-coral text-xl mt-1 flex-shrink-0 animate-pulse">🚨</span>
                            <span>{flag}</span>
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </div>
    </Card>
  );
};

export default EnhancedInsights;
