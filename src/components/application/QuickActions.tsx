
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
      color: "bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-200"
    },
    {
      icon: FileText,
      title: "Write Essays",
      description: "Create application documents",
      onClick: () => navigate("/documents"),
      color: "bg-green-50 text-green-600 hover:bg-green-100 border-green-200"
    },
    {
      icon: StickyNote,
      title: "My Notes",
      description: "View and manage notes",
      onClick: () => navigate("/notes"),
      color: "bg-yellow-50 text-yellow-600 hover:bg-yellow-100 border-yellow-200"
    }
  ];

  return (
    <Card className="shadow-sm">
      <CardHeader className={cn("pb-4", isMobile ? "px-4 pt-4" : "px-6 pt-6")}>
        <CardTitle className="text-lg flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className={cn(isMobile ? "px-4 pb-4" : "px-6 pb-6")}>
        <div className="space-y-3">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              className={cn(
                "h-auto p-4 flex flex-row items-center gap-4 text-left justify-start transition-all duration-200 w-full",
                action.color,
                "hover:shadow-md"
              )}
              onClick={action.onClick}
            >
              <action.icon className="h-6 w-6 shrink-0" />
              <div className="flex-1 space-y-1">
                <div className="font-medium text-sm leading-tight">
                  {action.title}
                </div>
                <div className="text-xs opacity-75 leading-tight">
                  {action.description}
                </div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
