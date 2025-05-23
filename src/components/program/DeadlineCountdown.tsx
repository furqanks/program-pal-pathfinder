
import { format, isValid, parseISO, differenceInDays } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";

interface DeadlineCountdownProps {
  deadline: string | null;
  className?: string;
}

const DeadlineCountdown = ({ deadline, className = "" }: DeadlineCountdownProps) => {
  if (!deadline || !isValid(parseISO(deadline))) {
    return (
      <div className={`flex items-center text-sm text-muted-foreground ${className}`}>
        <Calendar className="h-4 w-4 mr-1" />
        <span>No deadline set</span>
      </div>
    );
  }

  const deadlineDate = parseISO(deadline);
  const today = new Date();
  const daysLeft = differenceInDays(deadlineDate, today);

  let content;
  let badgeVariant: "default" | "outline" | "destructive" | "secondary" = "default";

  if (daysLeft < 0) {
    content = "Deadline passed";
    badgeVariant = "destructive";
  } else if (daysLeft === 0) {
    content = "Due today!";
    badgeVariant = "destructive";
  } else if (daysLeft <= 7) {
    content = `${daysLeft} day${daysLeft !== 1 ? 's' : ''} left`;
    badgeVariant = "secondary";
  } else {
    content = `${daysLeft} days left`;
    badgeVariant = "outline";
  }

  return (
    <div className={`flex items-center ${className}`}>
      <Calendar className="h-4 w-4 mr-1" />
      <span className="text-sm mr-2">{format(deadlineDate, "MMM d, yyyy")}</span>
      <Badge variant={badgeVariant} className="text-xs">
        {content}
      </Badge>
    </div>
  );
};

export default DeadlineCountdown;
