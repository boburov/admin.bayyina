// Router
import { Link } from "react-router-dom";

// Recharts
import {
  Line,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";

// Tanstack Query
import { useQuery } from "@tanstack/react-query";

// API
import { penaltiesAPI } from "@/features/penalties/api/penalties.api";

// Utils
import { cn } from "@/shared/utils/cn";
import { formatDateUZ } from "@/shared/utils/date.utils";

// Components
import Card from "@/shared/components/ui/Card";
import Counter from "@/shared/components/ui/Counter";
import Button from "@/shared/components/ui/button/Button";

// Hooks
import useArrayStore from "@/shared/hooks/useArrayStore";

// Helpers
import { getRoleLabel } from "@/shared/helpers/role.helpers";

const PenaltyStats = () => {
  const { data: stats } = useQuery({
    queryKey: ["penalties", "stats"],
    queryFn: () => penaltiesAPI.getStats().then((res) => res.data.data),
  });

  const { getCollectionData } = useArrayStore();
  const roles = getCollectionData("roles") || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
      <div className="col-span-2 space-y-4">
        {/* Umumiy statistika */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card
            title="Jami jarima ballar"
            className="flex items-center justify-between"
          >
            <Counter
              value={stats?.totalApprovedPoints ?? 0}
              className="text-2xl font-bold text-red-500"
            />
          </Card>

          <Card
            title="Kamaytirilgan ballar"
            className="flex items-center justify-between"
          >
            <Counter
              value={stats?.totalReducedPoints ?? 0}
              className="text-2xl font-bold text-green-500"
            />
          </Card>

          <Card
            title="Kutilayotgan jarimalar"
            className="flex items-center justify-between"
          >
            <Counter
              value={stats?.pendingCount ?? 0}
              className="text-2xl font-bold text-yellow-500"
            />
          </Card>
        </div>

        {/* Top 10 foydalanuvchilar (barcha rollar) */}
        <div className="grid grid-cols-2 gap-4">
          <TopTenList
            title="Top 10 jarima olgan foydalanuvchilar"
            data={stats?.topUsers || []}
            roles={roles}
          />

          {/* Penalty Stats Chart */}
          <Card
            title="So'nggi 30 kunlik jarimalar statistikasi"
            className="min-h-80 space-y-4"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={stats?.dailyTrend || []}
                margin={{ left: -32, bottom: 40 }}
              >
                <defs>
                  <linearGradient id="colorPenalty" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient
                    id="colorReduction"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  vertical={false}
                  stroke="#E5E7EB"
                  strokeDasharray="3 3"
                />
                <XAxis
                  dy={10}
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#9CA3AF" }}
                  tickFormatter={(val) => formatDateUZ(val, { hideYear: true })}
                  interval={4}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#9CA3AF" }}
                />
                <Tooltip
                  labelStyle={{
                    color: "#6B7280",
                    fontSize: "13px",
                    marginBottom: "2px",
                  }}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid #E5E7EB",
                    boxShadow: "0 2px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                  labelFormatter={formatDateUZ}
                />
                <Legend
                  wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }}
                />
                <Line
                  name="Berilgan jarimalar"
                  type="monotone"
                  dataKey="penaltyPoints"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
                <Line
                  name="Ayirilgan jarimalar"
                  type="monotone"
                  dataKey="reductionPoints"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </div>

      <TopTenList
        roles={roles}
        title="Top 10 jarima olgan o'quvchilar"
        data={stats?.topStudents || []}
        colorClass="text-orange-600"
      />
    </div>
  );
};

const TopTenList = ({ title, data, roles = [] }) => {
  const getRankColor = (index) => {
    if (index === 0) return "size-10 bg-gradient-to-tr from-red-400 to-red-600";
    if (index === 1)
      return "size-9 mx-0.5 bg-gradient-to-tr from-orange-400 to-orange-600";
    if (index === 2)
      return "size-8 mx-1 bg-gradient-to-tr from-yellow-400 to-yellow-600";
    return "size-7 mx-1.5 bg-gray-100 text-gray-500";
  };

  return (
    <Card title={title} className="flex flex-col gap-1.5 xs:gap-3.5">
      <div className="max-h-72 overflow-y-auto hidden-scrollbar">
        {data.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-4">
            Ma'lumot yo'q
          </p>
        )}

        {data.map((user, index) => (
          <div
            key={user._id}
            className={cn(
              "flex items-center justify-between py-2",
              index === 0 ? "sticky top-0 bg-white z-10" : "z-0",
            )}
          >
            <div className="flex items-center gap-2.5">
              <div
                className={cn(
                  "flex items-center justify-center size-8 rounded-full text-sm font-bold text-white",
                  getRankColor(index),
                )}
              >
                {index + 1}
              </div>

              <div>
                <p className="text-sm font-medium text-gray-800">
                  {user.fullName ||
                    `${user.firstName} ${user.lastName || ""}`.trim()}
                </p>

                <p className="text-xs leading-[8px] text-gray-400 translate-y-1">
                  {getRoleLabel(user.role, roles)}
                </p>
              </div>
            </div>

            <Counter
              value={user?.penaltyPoints || 0}
              className="text-sm font-semibold text-red-600"
            />
          </div>
        ))}
      </div>

      <Button
        asChild
        variant="link"
        className="inline-block py-0 size-auto mx-auto text-sm"
      >
        <Link to="/penalties">Barcha jarimalar</Link>
      </Button>
    </Card>
  );
};

export default PenaltyStats;
