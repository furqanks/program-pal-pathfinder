
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, Clock, AlertTriangle } from "lucide-react";
import { Program } from "@/contexts/ProgramContext";
import { format, parseISO, isValid, isPast, isFuture } from "date-fns";

interface TimelineEvent {
  id: string;
  title: string;
  date: string;
  status: "completed" | "current" | "upcoming" | "overdue";
  description?: string;
}

interface ApplicationTimelineProps {
  program: Program;
}

const ApplicationTimeline = ({ program }: ApplicationTimelineProps) => {
  // Generate timeline events based on program data
  const generateTimelineEvents = (): TimelineEvent[] => {
    const events: TimelineEvent[] = [];
    const now = new Date();
    
    // Research phase
    events.push({
      id: "research",
      title: "Research & Requirements",
      date: program.createdAt || new Date().toISOString(),
      status: "completed",
      description: "Program added to shortlist"
    });
    
    // Document preparation
    const hasDocumentTasks = program.tasks.some(task => 
      task.title.toLowerCase().includes("document") || 
      task.title.toLowerCase().includes("essay") ||
      task.title.toLowerCase().includes("statement")
    );
    
    if (hasDocumentTasks) {
      const documentTasksCompleted = program.tasks
        .filter(task => 
          task.title.toLowerCase().includes("document") || 
          task.title.toLowerCase().includes("essay") ||
          task.title.toLowerCase().includes("statement")
        )
        .every(task => task.completed);
      
      events.push({
        id: "documents",
        title: "Document Preparation",
        date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 2 weeks ago
        status: documentTasksCompleted ? "completed" : "current",
        description: "Prepare application documents"
      });
    }
    
    // Application submission
    if (program.deadline) {
      const deadlineDate = parseISO(program.deadline);
      const isDeadlinePast = isPast(deadlineDate);
      const isApplied = program.statusTagId === "status-applied" || 
                      program.statusTagId === "status-accepted" || 
                      program.statusTagId === "status-rejected";
      
      events.push({
        id: "submission",
        title: "Application Submission",
        date: program.deadline,
        status: isApplied ? "completed" : isDeadlinePast ? "overdue" : "upcoming",
        description: `Deadline: ${format(deadlineDate, "MMM dd, yyyy")}`
      });
    }
    
    // Decision
    if (program.statusTagId === "status-accepted" || program.statusTagId === "status-rejected") {
      events.push({
        id: "decision",
        title: "Admission Decision",
        date: new Date().toISOString(), // Approximate
        status: "completed",
        description: program.statusTagId === "status-accepted" ? "Accepted!" : "Decision received"
      });
    }
    
    return events;
  };

  const events = generateTimelineEvents();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case "current":
        return <Clock className="h-4 w-4 text-blue-600" />;
      case "overdue":
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Circle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "current":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "overdue":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Application Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {events.map((event, index) => (
            <div key={event.id} className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                {getStatusIcon(event.status)}
                {index < events.length - 1 && (
                  <div className="w-px h-8 bg-gray-200 mt-2" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-sm">{event.title}</h4>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${getStatusColor(event.status)}`}
                  >
                    {event.status}
                  </Badge>
                </div>
                {event.description && (
                  <p className="text-xs text-muted-foreground mb-1">
                    {event.description}
                  </p>
                )}
                {event.date && isValid(parseISO(event.date)) && (
                  <p className="text-xs text-muted-foreground">
                    {format(parseISO(event.date), "MMM dd, yyyy")}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ApplicationTimeline;
