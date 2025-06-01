import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  FileText, 
  Calendar, 
  Search, 
  BookOpen, 
  PlusCircle, 
  BarChart3,
  Users,
  Globe
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

const QuickActions = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const actions = [
    {
      icon: Search,
      title: "Find Programs",
      description: "Discover new university programs",
      onClick: () => navigate("/search"),
      color: "bg-blue-50 text-blue-600 hover:bg-blue-100"
    },
    {
      icon: FileText,
      title: "Write Documents",
      description: "Create application essays & statements",
      onClick: () => navigate("/documents"),
      color: "bg-green-50 text-green-600 hover:bg-green-100"
    },
    {
      icon: PlusCircle,
      title: "Add Program",
      description: "Add a program to your shortlist",
      onClick: () => {}, // This will be handled by parent component
      color: "bg-purple-50 text-purple-600 hover:bg-purple-100"
    },
    {
      icon: BarChart3,
      title: "View Insights",
      description: "Analyze your application progress",
      onClick: () => navigate("/insights"),
      color: "bg-orange-50 text-orange-600 hover:bg-orange-100"
    },
    {
      icon: Calendar,
      title: "Deadlines",
      description: "Check upcoming deadlines",
      onClick: () => {}, // Will scroll to deadlines section
      color: "bg-red-50 text-red-600 hover:bg-red-100"
    },
    {
      icon: BookOpen,
      title: "Research Tips",
      description: "Get research and application tips",
      onClick: () => {},
      color: "bg-teal-50 text-teal-600 hover:bg-teal-100"
    }
  ];

  return (
    <Card>
      <CardHeader className={isMobile ? "pb-3 px-4" : ""}>
        <CardTitle className={isMobile ? "text-lg" : "text-lg"}>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className={isMobile ? "px-4" : ""}>
        <div className={cn(
          "grid gap-3",
          isMobile ? "grid-cols-2" : "grid-cols-2 md:grid-cols-3"
        )}>
          {actions.map((action, index) => (
            <Button
              key={index}
              variant="ghost"
              className={cn(
                "flex flex-col items-center gap-2 text-center",
                action.color,
                isMobile ? "h-20 p-3" : "h-auto p-3"
              )}
              onClick={action.onClick}
            >
              <action.icon className={isMobile ? "h-6 w-6" : "h-5 w-5"} />
              <div className="text-center">
                <div className={cn(
                  "font-medium",
                  isMobile ? "text-sm" : "text-xs"
                )}>
                  {action.title}
                </div>
                {!isMobile && (
                  <div className="text-xs opacity-75 hidden md:block">
                    {action.description}
                  </div>
                )}
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
