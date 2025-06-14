
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
      color: "bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-200",
      priority: "high"
    },
    {
      icon: PlusCircle,
      title: "Add to Shortlist",
      description: "Add a program to track",
      onClick: onAddProgram || (() => {}),
      color: "bg-purple-50 text-purple-600 hover:bg-purple-100 border-purple-200",
      priority: "high"
    },
    {
      icon: FileText,
      title: "Write Essays",
      description: "Create application documents",
      onClick: () => navigate("/documents"),
      color: "bg-green-50 text-green-600 hover:bg-green-100 border-green-200",
      priority: "high"
    },
    {
      icon: StickyNote,
      title: "My Notes",
      description: "View and manage notes",
      onClick: onViewNotes || (() => {}),
      color: "bg-yellow-50 text-yellow-600 hover:bg-yellow-100 border-yellow-200",
      priority: "high"
    },
    {
      icon: GraduationCap,
      title: "US Universities",
      description: "Search US college database",
      onClick: () => navigate("/us-search"),
      color: "bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border-indigo-200",
      priority: "medium"
    },
    {
      icon: Calendar,
      title: "Check Deadlines",
      description: "View upcoming deadlines",
      onClick: () => {}, // Will scroll to deadlines section
      color: "bg-red-50 text-red-600 hover:bg-red-100 border-red-200",
      priority: "medium"
    },
    {
      icon: BarChart3,
      title: "Track Progress",
      description: "View application analytics",
      onClick: () => navigate("/insights"),
      color: "bg-orange-50 text-orange-600 hover:bg-orange-100 border-orange-200",
      priority: "medium"
    }
  ];

  // Show priority actions on mobile, all on desktop
  const displayActions = isMobile 
    ? actions.filter(action => action.priority === "high")
    : actions;

  return (
    <Card className="shadow-sm">
      <CardHeader className={cn("pb-4", isMobile ? "px-4 pt-4" : "px-6 pt-6")}>
        <CardTitle className="text-lg flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className={cn(isMobile ? "px-4 pb-4" : "px-6 pb-6")}>
        <div className={cn(
          "grid gap-3",
          isMobile ? "grid-cols-2" : "grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        )}>
          {displayActions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              className={cn(
                "h-auto p-4 flex flex-col items-center gap-3 text-center justify-start transition-all duration-200",
                action.color,
                "hover:shadow-md hover:scale-105",
                isMobile ? "min-h-[100px]" : "min-h-[120px]"
              )}
              onClick={action.onClick}
            >
              <action.icon className="h-6 w-6 shrink-0" />
              <div className="text-center space-y-1">
                <div className="font-medium text-sm leading-tight">
                  {action.title}
                </div>
                <div className={cn(
                  "text-xs opacity-75 leading-tight",
                  isMobile ? "line-clamp-2" : ""
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
              variant="ghost"
              size="sm"
              onClick={() => navigate("/insights")}
              className="text-xs text-muted-foreground hover:text-primary"
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
