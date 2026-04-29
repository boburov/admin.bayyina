// Icons
import { Smile } from "lucide-react";

// Hooks
import useAuth from "@/shared/hooks/useAuth";

// Components
import Card from "@/shared/components/ui/Card";
import UsersStats from "../components/UsersStats";
import DashboardCharts from "../components/DashboardCharts";
import LeadCharts from "../components/LeadCharts";
import AttendanceCharts from "../components/AttendanceCharts";
import AllSchedulesToday from "../components/AllSchedulesToday";

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div>
      {/* Top Bar */}
      <div className="flex gap-4 mb-4">
        <Card className="flex items-center gap-2.5 !py-3 grow">
          <Smile className="w-5 h-5 text-brown-800" strokeWidth={1.5} />
          <h2 className="text-base font-semibold text-gray-900">
            Xush kelibsiz, {user?.firstName}!
          </h2>
        </Card>
      </div>

      {/* User Statistics */}
      <UsersStats />

      {/* Statistics Charts */}
      <DashboardCharts />

      {/* Lead Charts */}
      <LeadCharts />

      {/* Attendance & Group Ranking */}
      <AttendanceCharts />

      {/* Today's Schedules */}
      <AllSchedulesToday />
    </div>
  );
};

export default Dashboard;
