
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
      gradient: "from-blue-500/20 to-blue-600/20",
      iconColor: "text-blue-600",
      priority: "high"
    },
    {
      icon: PlusCircle,
      title: "Add to Shortlist",
      description: "Add a program to track",
      onClick: onAddProgram || (() => {}),
      gradient: "from-purple-500/20 to-purple-600/20",
      iconColor: "text-purple-600",
      priority: "high"
    },
    {
      icon: FileText,
      title: "Write Essays",
      description: "Create application documents",
      onClick: () => navigate("/documents"),
      gradient: "from-green-500/20 to-green-600/20",
      iconColor: "text-green-600",
      priority: "high"
    },
    {
      icon: StickyNote,
      title: "My Notes",
      description: "View and manage notes",
      onClick: onViewNotes || (() => {}),
      gradient: "from-yellow-500/20 to-yellow-600/20",
      iconColor: "text-yellow-600",
      priority: "high"
    },
    {
      icon: GraduationCap,
      title: "US Universities",
      description: "Search US college database",
      onClick: () => navigate("/us-search"),
      gradient: "from-indigo-500/20 to-indigo-600/20",
      iconColor: "text-indigo-600",
      priority: "medium"
    },
    {
      icon: Calendar,
      title: "Check Deadlines",
      description: "View upcoming deadlines",
      onClick: () => {}, // Will scroll to deadlines section
      gradient: "from-red-500/20 to-red-600/20",
      iconColor: "text-red-600",
      priority: "medium"
    },
    {
      icon: BarChart3,
      title: "Track Progress",
      description: "View application analytics",
      onClick: () => navigate("/insights"),
      gradient: "from-orange-500/20 to-orange-600/20",
      iconColor: "text-orange-600",
      priority: "medium"
    }
  ];

  // Show priority actions on mobile, all on desktop
  const displayActions = isMobile 
    ? actions.filter(action => action.priority === "high")
    : actions;

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-sm">
      <CardHeader className={cn(isMobile ? "px-4 pt-4 pb-3" : "px-6 pt-6 pb-4")}>
        <CardTitle className="text-lg flex items-center gap-2 text-card-foreground">
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
                "bg-gradient-to-br border-border/50 hover:border-border",
                action.gradient,
                "hover:shadow-md hover:scale-[1.02] active:scale-[0.98]",
                "group relative overflow-hidden",
                isMobile ? "min-h-[100px]" : "min-h-[110px]"
              )}
              onClick={action.onClick}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              <action.icon className={cn("h-6 w-6 shrink-0 relative z-10", action.iconColor)} />
              <div className="text-center space-y-1 relative z-10">
                <div className="font-medium text-sm leading-tight text-card-foreground">
                  {action.title}
                </div>
                <div className={cn(
                  "text-xs text-muted-foreground leading-tight",
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
              className="text-xs text-muted-foreground hover:text-primary hover:bg-accent/50"
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
