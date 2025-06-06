
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, Clock, CheckCircle2, AlertTriangle, TrendingUp } from "lucide-react";
import { useAINotesContext } from "@/contexts/AINotesContext";
import { cn } from "@/lib/utils";

const InsightsDashboard = () => {
  const { insights, reminders, completeReminder } = useAINotesContext();

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "pattern": return <TrendingUp className="h-4 w-4" />;
      case "recommendation": return <Lightbulb className="h-4 w-4" />;
      case "warning": return <AlertTriangle className="h-4 w-4" />;
      default: return <Lightbulb className="h-4 w-4" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case "pattern": return "bg-blue-50 border-blue-200 text-blue-800";
      case "recommendation": return "bg-green-50 border-green-200 text-green-800";
      case "warning": return "bg-red-50 border-red-200 text-red-800";
      default: return "bg-purple-50 border-purple-200 text-purple-800";
    }
  };

  const getPriorityColor = (priority: number) => {
    if (priority >= 8) return "bg-red-100 text-red-800";
    if (priority >= 5) return "bg-yellow-100 text-yellow-800";
    return "bg-green-100 text-green-800";
  };

  const formatDueDate = (dueDate: string) => {
    const date = new Date(dueDate);
    const now = new Date();
    const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return "Overdue";
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    return `${diffDays} days`;
  };

  return (
    <div className="space-y-6">
      {/* AI Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            AI Insights ({insights.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {insights.length > 0 ? (
            <div className="space-y-4">
              {insights.map((insight) => (
                <div
                  key={insight.id}
                  className={cn(
                    "p-4 rounded-lg border",
                    getInsightColor(insight.insight_type)
                  )}
                >
                  <div className="flex items-start gap-3">
                    {getInsightIcon(insight.insight_type)}
                    <div className="flex-1">
                      <h4 className="font-medium mb-2">{insight.title}</h4>
                      <p className="text-sm opacity-90 mb-2">{insight.content}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          Confidence: {Math.round(insight.confidence_score * 100)}%
                        </Badge>
                        <span className="text-xs opacity-70">
                          {new Date(insight.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Lightbulb className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No insights generated yet. Create some notes and use the "Analyze All Notes" feature!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Smart Reminders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-500" />
            Smart Reminders ({reminders.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {reminders.length > 0 ? (
            <div className="space-y-3">
              {reminders.map((reminder) => (
                <div
                  key={reminder.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{reminder.title}</h4>
                      <Badge
                        variant="outline"
                        className={cn("text-xs", getPriorityColor(reminder.priority))}
                      >
                        Priority {reminder.priority}
                      </Badge>
                      {reminder.ai_generated && (
                        <Badge variant="outline" className="text-xs bg-purple-100 text-purple-800">
                          AI Generated
                        </Badge>
                      )}
                    </div>
                    {reminder.description && (
                      <p className="text-sm text-gray-600 mb-1">{reminder.description}</p>
                    )}
                    {reminder.due_date && (
                      <p className="text-xs text-gray-500">
                        Due: {formatDueDate(reminder.due_date)}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => completeReminder(reminder.id)}
                    className="ml-4"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    Complete
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No smart reminders yet. The AI will generate helpful reminders as you create more notes!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InsightsDashboard;
