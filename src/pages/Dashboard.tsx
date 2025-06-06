
import ApplicationStatusCard from "@/components/application/ApplicationStatusCard";
import UpcomingDeadlines from "@/components/application/UpcomingDeadlines";
import QuickActions from "@/components/application/QuickActions";
import AINotesSection from "@/components/application/AINotesSection";
import { useProgramContext } from "@/contexts/ProgramContext";

const Dashboard = () => {
  const { programs } = useProgramContext();

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

        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ApplicationStatusCard />
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
