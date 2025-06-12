
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useProgramContext } from "@/contexts/ProgramContext";
import { useTagContext } from "@/contexts/TagContext";
import { format, parseISO, differenceInDays, isValid } from "date-fns";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

const UpcomingDeadlines = () => {
  const { programs } = useProgramContext();
  const { getStatusTag } = useTagContext();
  const [showAll, setShowAll] = useState(false);
  const isMobile = useIsMobile();

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
        return "bg-red-500/10 text-red-600 border-red-500/20";
      case "urgent":
        return "bg-orange-500/10 text-orange-600 border-orange-500/20";
      case "warning":
        return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
      default:
        return "bg-green-500/10 text-green-600 border-green-500/20";
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
      <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-sm">
        <CardHeader className={cn(isMobile ? "px-4 pt-4 pb-3" : "px-6 pt-6 pb-4")}>
          <CardTitle className="text-lg flex items-center gap-2 text-card-foreground">
            <Calendar className="h-5 w-5 text-primary" />
            Upcoming Deadlines
          </CardTitle>
        </CardHeader>
        <CardContent className={cn(isMobile ? "px-4 pb-4" : "px-6 pb-6")}>
          <div className="text-center py-8">
            <div className="p-3 bg-green-500/10 rounded-full w-fit mx-auto mb-3">
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
            <h3 className="font-medium text-card-foreground mb-1">All caught up!</h3>
            <p className="text-sm text-muted-foreground">
              No upcoming deadlines to worry about.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-sm">
      <CardHeader className={cn(isMobile ? "px-4 pt-4 pb-3" : "px-6 pt-6 pb-4")}>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2 text-card-foreground">
            <Calendar className="h-5 w-5 text-primary" />
            Upcoming Deadlines
          </CardTitle>
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
            {programsWithDeadlines.length} pending
          </Badge>
        </div>
      </CardHeader>
      <CardContent className={cn(isMobile ? "px-4 pb-4" : "px-6 pb-6")}>
        <div className="space-y-3">
          {displayedPrograms.map((program) => {
            const urgency = getUrgencyLevel(program.daysUntilDeadline);
            const statusTag = getStatusTag(program.statusTagId);
            
            return (
              <div
                key={program.id}
                className="flex items-center justify-between p-4 bg-card border border-border/50 rounded-lg hover:bg-accent/30 transition-all duration-200 hover:shadow-sm"
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="mt-1 text-muted-foreground">
                    {getUrgencyIcon(urgency)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm text-card-foreground truncate mb-1">
                      {program.programName}
                    </h4>
                    <p className="text-xs text-muted-foreground truncate mb-2">
                      {program.university}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {format(parseISO(program.deadline!), "MMM dd, yyyy")}
                      </span>
                      <Badge 
                        variant="outline" 
                        className={cn("text-xs", getUrgencyColor(urgency))}
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
                      color: '#fff',
                      borderColor: statusTag.color
                    }}
                    className="text-xs ml-3 shrink-0"
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
              className="w-full mt-3 text-muted-foreground hover:text-primary hover:bg-accent/50"
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
