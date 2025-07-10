import ApplicationStatusCard from "@/components/application/ApplicationStatusCard";
import UpcomingDeadlines from "@/components/application/UpcomingDeadlines";
import QuickActions from "@/components/application/QuickActions";
import { useProgramContext } from "@/contexts/ProgramContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Clock, FileText, Target } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import SubscriptionGuard from "@/components/auth/SubscriptionGuard";

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
    <SubscriptionGuard feature="the dashboard">
      <div className="min-h-screen bg-background">
        <div className={cn(
          "w-full mx-auto space-y-6",
          isMobile ? "px-4 py-4" : "px-6 py-6 max-w-7xl"
        )}>
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className={cn(
                "font-bold text-foreground",
                isMobile ? "text-2xl" : "text-3xl"
              )}>
                Dashboard
              </h1>
              <p className={cn(
                "text-muted-foreground mt-2",
                isMobile ? "text-sm" : "text-base"
              )}>
                Track your university applications and manage your progress
              </p>
            </div>
          </div>

          {/* Quick Stats Cards */}
          <div className={cn(
            "grid gap-4",
            isMobile ? "grid-cols-2" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
          )}>
            <Card className="bg-card border-border hover:shadow-lg transition-all duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className={cn(
                  "font-medium text-card-foreground",
                  isMobile ? "text-xs" : "text-sm"
                )}>
                  Total Programs
                </CardTitle>
                <div className="p-2 bg-primary/10 rounded-lg">
                  <BookOpen className={cn(
                    "text-primary",
                    isMobile ? "h-3 w-3" : "h-4 w-4"
                  )} />
                </div>
              </CardHeader>
              <CardContent className={isMobile ? "pt-1" : ""}>
                <div className={cn(
                  "font-bold text-card-foreground",
                  isMobile ? "text-xl" : "text-2xl"
                )}>
                  {stats.total}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Total tracked programs
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-card border-border hover:shadow-lg transition-all duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className={cn(
                  "font-medium text-card-foreground",
                  isMobile ? "text-xs" : "text-sm"
                )}>
                  In Progress
                </CardTitle>
                <div className="p-2 bg-orange-500/10 rounded-lg">
                  <Clock className={cn(
                    "text-orange-500",
                    isMobile ? "h-3 w-3" : "h-4 w-4"
                  )} />
                </div>
              </CardHeader>
              <CardContent className={isMobile ? "pt-1" : ""}>
                <div className={cn(
                  "font-bold text-card-foreground",
                  isMobile ? "text-xl" : "text-2xl"
                )}>
                  {stats.inProgress}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Active applications
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-card border-border hover:shadow-lg transition-all duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className={cn(
                  "font-medium text-card-foreground",
                  isMobile ? "text-xs" : "text-sm"
                )}>
                  Applied
                </CardTitle>
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <FileText className={cn(
                    "text-blue-500",
                    isMobile ? "h-3 w-3" : "h-4 w-4"
                  )} />
                </div>
              </CardHeader>
              <CardContent className={isMobile ? "pt-1" : ""}>
                <div className={cn(
                  "font-bold text-card-foreground",
                  isMobile ? "text-xl" : "text-2xl"
                )}>
                  {stats.applied}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Submitted applications
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-card border-border hover:shadow-lg transition-all duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className={cn(
                  "font-medium text-card-foreground",
                  isMobile ? "text-xs" : "text-sm"
                )}>
                  Accepted
                </CardTitle>
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <Target className={cn(
                    "text-green-500",
                    isMobile ? "h-3 w-3" : "h-4 w-4"
                  )} />
                </div>
              </CardHeader>
              <CardContent className={isMobile ? "pt-1" : ""}>
                <div className={cn(
                  "font-bold text-card-foreground",
                  isMobile ? "text-xl" : "text-2xl"
                )}>
                  {stats.accepted}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Successful applications
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Application Status Cards */}
          {programs.length > 0 ? (
            <div className="space-y-6">
              <h2 className={cn(
                "font-semibold text-foreground",
                isMobile ? "text-lg" : "text-xl"
              )}>
                Your Applications
              </h2>
              <div className={cn(
                "grid gap-4",
                isMobile ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
              )}>
                {programs.slice(0, 6).map(program => (
                  <ApplicationStatusCard 
                    key={program.id} 
                    program={program} 
                    onViewDetails={() => {
                      console.log('View details for:', program.id);
                    }} 
                  />
                ))}
              </div>
            </div>
          ) : (
            <Card className="bg-card border-border">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="p-4 bg-muted/50 rounded-full mb-4">
                  <BookOpen className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium text-card-foreground mb-2">No Programs Yet</h3>
                <p className="text-muted-foreground text-center mb-4 max-w-md">
                  Start building your university application shortlist by searching for programs that match your interests.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Status Overview Grid */}
          <div className={cn(
            "grid gap-6",
            isMobile ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
          )}>
            <div className={cn(
              isMobile ? "col-span-1" : "md:col-span-1"
            )}>
              <UpcomingDeadlines />
            </div>
            <div className={cn(
              isMobile ? "col-span-1" : "md:col-span-1 lg:col-span-2"
            )}>
              <QuickActions />
            </div>
          </div>
        </div>
      </div>
    </SubscriptionGuard>
  );
};

export default Dashboard;