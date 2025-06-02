
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  FileText, 
  Calendar, 
  Search, 
  Target, 
  PlusCircle, 
  BarChart3,
  GraduationCap,
  TrendingUp,
  StickyNote
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface QuickActionsProps {
  onAddProgram?: () => void;
  onViewNotes?: () => void;
}

const QuickActions = ({ onAddProgram, onViewNotes }: QuickActionsProps) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const actions = [
    {
      icon: Search,
      title: "Discover Programs",
      description: "Find programs that match your profile",
      onClick: () => navigate("/search"),
      color: "bg-blue-50 text-blue-600 hover:bg-blue-100",
      priority: "high"
    },
    {
      icon: PlusCircle,
      title: "Add to Shortlist",
      description: "Add a program to track",
      onClick: onAddProgram || (() => {}),
      color: "bg-purple-50 text-purple-600 hover:bg-purple-100",
      priority: "high"
    },
    {
      icon: FileText,
      title: "Write Essays",
      description: "Create application documents",
      onClick: () => navigate("/documents"),
      color: "bg-green-50 text-green-600 hover:bg-green-100",
      priority: "high"
    },
    {
      icon: StickyNote,
      title: "My Notes",
      description: "View and manage notes",
      onClick: onViewNotes || (() => {}),
      color: "bg-yellow-50 text-yellow-600 hover:bg-yellow-100",
      priority: "high"
    },
    {
      icon: GraduationCap,
      title: "US Universities",
      description: "Search US college database",
      onClick: () => navigate("/us-search"),
      color: "bg-indigo-50 text-indigo-600 hover:bg-indigo-100",
      priority: "medium"
    },
    {
      icon: Calendar,
      title: "Check Deadlines",
      description: "View upcoming deadlines",
      onClick: () => {}, // Will scroll to deadlines section
      color: "bg-red-50 text-red-600 hover:bg-red-100",
      priority: "medium"
    },
    {
      icon: BarChart3,
      title: "Track Progress",
      description: "View application analytics",
      onClick: () => navigate("/insights"),
      color: "bg-orange-50 text-orange-600 hover:bg-orange-100",
      priority: "medium"
    }
  ];

  // Show priority actions on mobile, all on desktop
  const displayActions = isMobile 
    ? actions.filter(action => action.priority === "high")
    : actions;

  return (
    <Card>
      <CardHeader className={isMobile ? "pb-3 px-4" : ""}>
        <CardTitle className={isMobile ? "text-lg" : "text-lg flex items-center gap-2"}>
          <Target className="h-5 w-5" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className={isMobile ? "px-4" : ""}>
        <div className={cn(
          "grid gap-3",
          isMobile ? "grid-cols-2" : "grid-cols-2 md:grid-cols-3"
        )}>
          {displayActions.map((action, index) => (
            <Button
              key={index}
              variant="ghost"
              className={cn(
                "flex flex-col items-center gap-2 text-center justify-start",
                action.color,
                isMobile ? "h-auto p-3" : "h-auto p-3"
              )}
              onClick={action.onClick}
            >
              <action.icon className={isMobile ? "h-5 w-5" : "h-5 w-5"} />
              <div className="text-center">
                <div className={cn(
                  "font-medium",
                  isMobile ? "text-xs" : "text-xs"
                )}>
                  {action.title}
                </div>
                <div className={cn(
                  "opacity-75",
                  isMobile ? "text-xs mt-1" : "text-xs hidden md:block"
                )}>
                  {action.description}
                </div>
              </div>
            </Button>
          ))}
        </div>
        {isMobile && (
          <div className="mt-4 text-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/insights")}
              className="text-xs"
            >
              <TrendingUp className="h-3 w-3 mr-1" />
              View All Features
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QuickActions;
