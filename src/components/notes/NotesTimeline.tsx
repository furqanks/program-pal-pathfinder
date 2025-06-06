
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Clock, 
  TrendingUp, 
  Target, 
  CheckCircle,
  AlertCircle,
  Sparkles,
  RefreshCw
} from "lucide-react";
import { useAINotesContext } from "@/contexts/AINotesContext";
import { useProgramContext } from "@/contexts/ProgramContext";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface TimelineEvent {
  date: string;
  title: string;
  description: string;
  type: "past" | "current" | "future";
  category: "academic" | "application" | "financial" | "personal";
  importance: "high" | "medium" | "low";
}

interface TimelineData {
  timeline_events: TimelineEvent[];
  current_phase: string;
  next_focus_areas: string[];
  motivation_message: string;
}

const NotesTimeline = () => {
  const [timelineData, setTimelineData] = useState<TimelineData | null>(null);
  const [loading, setLoading] = useState(false);
  const { notes } = useAINotesContext();
  const { programs } = useProgramContext();

  const generateTimeline = async () => {
    if (notes.length === 0) {
      toast.error("Add some notes first to generate a timeline!");
      return;
    }

    setLoading(true);
    try {
      // Mock AI analysis for now - in a real implementation, this would call an AI API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockTimeline: TimelineData = {
        timeline_events: [
          {
            date: "2024-01-15",
            title: "Started Research Phase",
            description: "Began exploring graduate programs and requirements",
            type: "past",
            category: "academic",
            importance: "high"
          },
          {
            date: "2024-03-01",
            title: "Current Focus: Applications",
            description: "Working on personal statements and gathering documents",
            type: "current",
            category: "application",
            importance: "high"
          },
          {
            date: "2024-04-15",
            title: "Application Deadlines",
            description: "Multiple program deadlines approaching",
            type: "future",
            category: "application",
            importance: "high"
          },
          {
            date: "2024-06-01",
            title: "Decision Period",
            description: "Expect to hear back from programs",
            type: "future",
            category: "academic",
            importance: "medium"
          }
        ],
        current_phase: "You're in the application crunch phase! 💪 Things are heating up but you're making solid progress.",
        next_focus_areas: [
          "Finish personal statements ASAP",
          "Request transcripts and letters of rec",
          "Prepare for potential interviews"
        ],
        motivation_message: "You've come so far already! The research phase is behind you and now it's execution time. Trust the process and keep pushing forward! 🚀"
      };

      setTimelineData(mockTimeline);
      toast.success("Timeline generated! Check out your journey so far 📅");
    } catch (error) {
      console.error("Error generating timeline:", error);
      toast.error("Failed to generate timeline");
    } finally {
      setLoading(false);
    }
  };

  const getEventIcon = (type: string, category: string) => {
    if (type === "past") return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (type === "current") return <Clock className="h-4 w-4 text-blue-600" />;
    if (category === "application") return <Target className="h-4 w-4 text-purple-600" />;
    return <Calendar className="h-4 w-4 text-gray-600" />;
  };

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case "high": return "border-red-200 bg-red-50";
      case "medium": return "border-yellow-200 bg-yellow-50";
      case "low": return "border-green-200 bg-green-50";
      default: return "border-gray-200 bg-gray-50";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "academic": return "bg-blue-100 text-blue-800";
      case "application": return "bg-purple-100 text-purple-800";
      case "financial": return "bg-green-100 text-green-800";
      case "personal": return "bg-pink-100 text-pink-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card className="bg-white/70 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-purple-600" />
            Your Journey Timeline
          </CardTitle>
          <Button 
            onClick={generateTimeline} 
            disabled={loading || notes.length === 0}
            variant="outline"
            size="sm"
          >
            {loading ? (
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            {timelineData ? "Refresh Timeline" : "Generate Timeline"}
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {!timelineData && !loading && (
          <div className="text-center py-8 border-2 border-dashed border-purple-200 rounded-lg">
            <TrendingUp className="h-12 w-12 text-purple-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No timeline yet</h3>
            <p className="text-gray-500 mb-6">
              Generate a personalized timeline based on your notes and goals
            </p>
            <Button onClick={generateTimeline} disabled={notes.length === 0}>
              <Sparkles className="mr-2 h-4 w-4" />
              Create My Timeline
            </Button>
          </div>
        )}

        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Analyzing your journey and creating timeline...</p>
          </div>
        )}

        {timelineData && (
          <div className="space-y-6">
            {/* Current Phase */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
              <h4 className="font-medium text-purple-800 mb-2 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Where You Are Now
              </h4>
              <p className="text-purple-700">{timelineData.current_phase}</p>
            </div>

            {/* Timeline Events */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-800 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Your Journey
              </h4>
              <div className="space-y-3">
                {timelineData.timeline_events.map((event, index) => (
                  <div 
                    key={index} 
                    className={cn(
                      "border rounded-lg p-4 transition-all hover:shadow-md",
                      getImportanceColor(event.importance)
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        {getEventIcon(event.type, event.category)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h5 className="font-medium text-sm">{event.title}</h5>
                            <Badge className={cn("text-xs", getCategoryColor(event.category))}>
                              {event.category}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-600 mb-2">{event.description}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(event.date).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Next Focus Areas */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-800 mb-3 flex items-center gap-2">
                <Target className="h-4 w-4" />
                Next Focus Areas
              </h4>
              <ul className="space-y-2">
                {timelineData.next_focus_areas.map((area, index) => (
                  <li key={index} className="text-green-700 text-sm flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    {area}
                  </li>
                ))}
              </ul>
            </div>

            {/* Motivation Message */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-4">
              <h4 className="font-medium text-amber-800 mb-2 flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Keep Going!
              </h4>
              <p className="text-amber-700 text-sm">{timelineData.motivation_message}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NotesTimeline;
