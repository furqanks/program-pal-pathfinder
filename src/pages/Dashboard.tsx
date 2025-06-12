
import ApplicationStatusCard from "@/components/application/ApplicationStatusCard";
import UpcomingDeadlines from "@/components/application/UpcomingDeadlines";
import QuickActions from "@/components/application/QuickActions";
import AINotesSection from "@/components/application/AINotesSection";
import { useProgramContext } from "@/contexts/ProgramContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Clock, FileText, Target } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

const Dashboard = () => {
  const { programs } = useProgramContext();
  const isMobile = useIsMobile();
  
  const getApplicationStats = () => {
    const total = programs.length;
    const applied = programs.filter(p => p.statusTagId === 'status-applied').length;
    const accepted = programs.filter(p => p.statusTagId === 'status-accepted').length;
    const inProgress = programs.filter(p => !['status-applied', 'status-accepted', 'status-rejected'].includes(p.statusTagId)).length;
    return {
      total,
      applied,
      accepted,
      inProgress
    };
  };
  
  const stats = getApplicationStats();
  
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground mt-2">
              Track your university applications and manage your progress
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className={cn(
          "grid gap-4",
          isMobile ? "grid-cols-2" : "grid-cols-1 md:grid-cols-4"
        )}>
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className={cn(
                "font-medium text-foreground",
                isMobile ? "text-xs" : "text-sm"
              )}>
                Total Programs
              </CardTitle>
              <BookOpen className={cn(
                "text-muted-foreground",
                isMobile ? "h-3 w-3" : "h-4 w-4"
              )} />
            </CardHeader>
            <CardContent className={isMobile ? "pt-1" : ""}>
              <div className={cn(
                "font-bold text-foreground",
                isMobile ? "text-lg" : "text-2xl"
              )}>
                {stats.total}
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className={cn(
                "font-medium text-foreground",
                isMobile ? "text-xs" : "text-sm"
              )}>
                In Progress
              </CardTitle>
              <Clock className={cn(
                "text-muted-foreground",
                isMobile ? "h-3 w-3" : "h-4 w-4"
              )} />
            </CardHeader>
            <CardContent className={isMobile ? "pt-1" : ""}>
              <div className={cn(
                "font-bold text-foreground",
                isMobile ? "text-lg" : "text-2xl"
              )}>
                {stats.inProgress}
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className={cn(
                "font-medium text-foreground",
                isMobile ? "text-xs" : "text-sm"
              )}>
                Applied
              </CardTitle>
              <FileText className={cn(
                "text-muted-foreground",
                isMobile ? "h-3 w-3" : "h-4 w-4"
              )} />
            </CardHeader>
            <CardContent className={isMobile ? "pt-1" : ""}>
              <div className={cn(
                "font-bold text-foreground",
                isMobile ? "text-lg" : "text-2xl"
              )}>
                {stats.applied}
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className={cn(
                "font-medium text-foreground",
                isMobile ? "text-xs" : "text-sm"
              )}>
                Accepted
              </CardTitle>
              <Target className={cn(
                "text-muted-foreground",
                isMobile ? "h-3 w-3" : "h-4 w-4"
              )} />
            </CardHeader>
            <CardContent className={isMobile ? "pt-1" : ""}>
              <div className={cn(
                "font-bold text-foreground",
                isMobile ? "text-lg" : "text-2xl"
              )}>
                {stats.accepted}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Application Status Cards */}
        {programs.length > 0 ? (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-foreground">Your Applications</h2>
            <div className={cn(
              "grid gap-4",
              isMobile ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
            )}>
              {programs.slice(0, 6).map(program => (
                <ApplicationStatusCard 
                  key={program.id} 
                  program={program} 
                  onViewDetails={() => {
                    // TODO: Navigate to program details
                    console.log('View details for:', program.id);
                  }} 
                />
              ))}
            </div>
          </div>
        ) : (
          <Card className="bg-card border-border">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No Programs Yet</h3>
              <p className="text-muted-foreground text-center mb-4 max-w-md">
                Start building your university application shortlist by searching for programs that match your interests.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Status Overview */}
        <div className={cn(
          "grid gap-6",
          isMobile ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
        )}>
          <UpcomingDeadlines />
          <QuickActions />
        </div>

        {/* AI Notes Section */}
        <AINotesSection />
      </div>
    </div>
  );
};

export default Dashboard;
