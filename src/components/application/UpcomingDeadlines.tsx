
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useProgramContext } from "@/contexts/ProgramContext";
import { useTagContext } from "@/contexts/TagContext";
import { format, parseISO, differenceInDays, isValid } from "date-fns";
import { useState } from "react";

const UpcomingDeadlines = () => {
  const { programs } = useProgramContext();
  const { getStatusTag } = useTagContext();
  const [showAll, setShowAll] = useState(false);

  // Filter and sort programs by deadline
  const programsWithDeadlines = programs
    .filter(program => 
      program.deadline && 
      isValid(parseISO(program.deadline)) &&
      program.statusTagId !== "status-applied" &&
      program.statusTagId !== "status-accepted" &&
      program.statusTagId !== "status-rejected"
    )
    .map(program => ({
      ...program,
      daysUntilDeadline: differenceInDays(parseISO(program.deadline!), new Date())
    }))
    .sort((a, b) => a.daysUntilDeadline - b.daysUntilDeadline);

  const displayedPrograms = showAll ? programsWithDeadlines : programsWithDeadlines.slice(0, 5);

  const getUrgencyLevel = (days: number) => {
    if (days < 0) return "overdue";
    if (days <= 7) return "urgent";
    if (days <= 30) return "warning";
    return "normal";
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "overdue":
        return "bg-red-100 text-red-800 border-red-200";
      case "urgent":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "warning":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-green-100 text-green-800 border-green-200";
    }
  };

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case "overdue":
        return <AlertTriangle className="h-4 w-4" />;
      case "urgent":
        return <Clock className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  if (programsWithDeadlines.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Upcoming Deadlines
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              No upcoming deadlines! All caught up.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Upcoming Deadlines
          </CardTitle>
          <Badge variant="outline">
            {programsWithDeadlines.length} pending
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {displayedPrograms.map((program) => {
            const urgency = getUrgencyLevel(program.daysUntilDeadline);
            const statusTag = getStatusTag(program.statusTagId);
            
            return (
              <div
                key={program.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start gap-3 flex-1">
                  <div className="mt-0.5">
                    {getUrgencyIcon(urgency)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate">
                      {program.programName}
                    </h4>
                    <p className="text-xs text-muted-foreground truncate">
                      {program.university}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs">
                        {format(parseISO(program.deadline!), "MMM dd, yyyy")}
                      </p>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getUrgencyColor(urgency)}`}
                      >
                        {program.daysUntilDeadline < 0 
                          ? `${Math.abs(program.daysUntilDeadline)} days overdue`
                          : program.daysUntilDeadline === 0
                          ? "Due today"
                          : `${program.daysUntilDeadline} days left`
                        }
                      </Badge>
                    </div>
                  </div>
                </div>
                {statusTag && (
                  <Badge 
                    style={{
                      backgroundColor: statusTag.color,
                      color: 'white'
                    }}
                    className="text-xs ml-2"
                  >
                    {statusTag.label}
                  </Badge>
                )}
              </div>
            );
          })}
          
          {programsWithDeadlines.length > 5 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAll(!showAll)}
              className="w-full"
            >
              {showAll ? "Show Less" : `Show All ${programsWithDeadlines.length} Deadlines`}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default UpcomingDeadlines;
