
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, FileText, CheckCircle2, AlertCircle } from "lucide-react";
import { Program } from "@/contexts/ProgramContext";
import { useTagContext } from "@/contexts/TagContext";
import { format, differenceInDays, parseISO, isValid } from "date-fns";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface ApplicationStatusCardProps {
  program: Program;
  onViewDetails: () => void;
}

const ApplicationStatusCard = ({ program, onViewDetails }: ApplicationStatusCardProps) => {
  const { getStatusTag } = useTagContext();
  const isMobile = useIsMobile();
  const statusTag = getStatusTag(program.statusTagId);
  
  // Calculate progress based on completed tasks
  const completedTasks = program.tasks.filter(task => task.completed).length;
  const totalTasks = program.tasks.length;
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  
  // Calculate days until deadline - with proper validation
  const isValidDeadline = program.deadline && isValid(parseISO(program.deadline));
  const daysUntilDeadline = isValidDeadline 
    ? differenceInDays(parseISO(program.deadline), new Date())
    : null;
  
  const getUrgencyColor = () => {
    if (!daysUntilDeadline) return "text-gray-500";
    if (daysUntilDeadline < 7) return "text-red-600";
    if (daysUntilDeadline < 30) return "text-orange-600";
    return "text-green-600";
  };

  const getStatusIcon = () => {
    switch (program.statusTagId) {
      case "status-applied":
        return <Clock className="h-4 w-4" />;
      case "status-accepted":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case "status-rejected":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className={cn("pb-3", isMobile ? "px-4" : "")}>
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1 min-w-0">
            <CardTitle className={cn(
              "font-semibold leading-tight",
              isMobile ? "text-base" : "text-lg"
            )}>
              {program.programName}
            </CardTitle>
            <p className={cn(
              "text-muted-foreground",
              isMobile ? "text-xs" : "text-sm"
            )}>
              {program.university} • {program.country}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {getStatusIcon()}
            {statusTag && (
              <Badge 
                style={{
                  backgroundColor: statusTag.color,
                  color: 'white'
                }}
                className={isMobile ? "text-xs px-2 py-1" : "text-xs"}
              >
                {statusTag.label}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className={cn("space-y-4", isMobile ? "px-4" : "")}>
        {/* Deadline Info - with proper date validation */}
        {isValidDeadline && (
          <div className={cn(
            "flex items-center gap-2",
            isMobile ? "text-xs" : "text-sm"
          )}>
            <Calendar className="h-4 w-4 flex-shrink-0" />
            <span>Due: {format(parseISO(program.deadline), "MMM dd, yyyy")}</span>
            {daysUntilDeadline !== null && (
              <span className={cn(
                "font-medium",
                getUrgencyColor(),
                isMobile ? "text-xs" : ""
              )}>
                ({daysUntilDeadline > 0 ? `${daysUntilDeadline} days left` : "Overdue"})
              </span>
            )}
          </div>
        )}
        
        {/* Progress */}
        <div className="space-y-2">
          <div className={cn(
            "flex items-center justify-between",
            isMobile ? "text-xs" : "text-sm"
          )}>
            <span>Application Progress</span>
            <span className="font-medium">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
          <p className={cn(
            "text-muted-foreground",
            isMobile ? "text-xs" : "text-xs"
          )}>
            {completedTasks} of {totalTasks} tasks completed
          </p>
        </div>
        
        {/* Actions */}
        <div className={cn(
          "flex gap-2 pt-2",
          isMobile ? "flex-col" : ""
        )}>
          <Button 
            variant="outline" 
            size={isMobile ? "default" : "sm"}
            onClick={onViewDetails}
            className={isMobile ? "w-full h-12" : "flex-1"}
          >
            View Details
          </Button>
          <Button 
            variant={progress === 100 ? "default" : "secondary"}
            size={isMobile ? "default" : "sm"}
            className={isMobile ? "w-full h-12" : "flex-1"}
          >
            {progress === 100 ? "Submit Application" : "Continue Working"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ApplicationStatusCard;
