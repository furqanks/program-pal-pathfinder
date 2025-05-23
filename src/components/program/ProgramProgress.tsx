
import { useMemo } from "react";
import { Progress } from "@/components/ui/progress";
import { Program } from "@/contexts/ProgramContext";

interface ProgramProgressProps {
  program: Program;
}

const ProgramProgress = ({ program }: ProgramProgressProps) => {
  const progressPercentage = useMemo(() => {
    // Calculate based on tasks
    const totalTasks = program.tasks.length;
    const completedTasks = program.tasks.filter(task => task.completed).length;
    
    // If no tasks, base progress on status
    if (totalTasks === 0) {
      switch (program.statusTagId) {
        case "status-considering":
          return 10;
        case "status-applied":
          return 50;
        case "status-accepted":
        case "status-rejected":
        case "status-waitlisted":
          return 100;
        default:
          return 0;
      }
    }
    
    return Math.round((completedTasks / totalTasks) * 100);
  }, [program.tasks, program.statusTagId]);

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Progress</span>
        <span>{progressPercentage}%</span>
      </div>
      <Progress value={progressPercentage} className="h-2" />
    </div>
  );
};

export default ProgramProgress;
