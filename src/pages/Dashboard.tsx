
import ApplicationStatusCard from "@/components/application/ApplicationStatusCard";
import UpcomingDeadlines from "@/components/application/UpcomingDeadlines";
import QuickActions from "@/components/application/QuickActions";
import AINotesSection from "@/components/application/AINotesSection";
import { useProgramContext } from "@/contexts/ProgramContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Clock, FileText, Target } from "lucide-react";

const Dashboard = () => {
  const { programs } = useProgramContext();

  const getApplicationStats = () => {
    const total = programs.length;
    const applied = programs.filter(p => p.statusTagId === 'status-applied').length;
    const accepted = programs.filter(p => p.statusTagId === 'status-accepted').length;
    const inProgress = programs.filter(p => !['status-applied', 'status-accepted', 'status-rejected'].includes(p.statusTagId)).length;

    return { total, applied, accepted, inProgress };
  };

  const stats = getApplicationStats();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-2">
              Track your university applications and manage your progress
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Programs</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.inProgress}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Applied</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.applied}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Accepted</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.accepted}</div>
            </CardContent>
          </Card>
        </div>

        {/* Application Status Cards */}
        {programs.length > 0 ? (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Your Applications</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {programs.slice(0, 6).map((program) => (
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
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BookOpen className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Programs Yet</h3>
              <p className="text-gray-600 text-center mb-4">
                Start building your university application shortlist by searching for programs that match your interests.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
