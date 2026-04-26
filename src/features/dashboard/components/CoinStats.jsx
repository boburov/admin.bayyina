// Recharts
import {
  Area,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

// Router
import { Link } from "react-router-dom";

// Tanstack Query
import { useQuery } from "@tanstack/react-query";

// API
import { classesAPI } from "@/features/classes/api/classes.api";
import { coinsAPI } from "@/features/coin-settings/api/coins.api";

// Utils
import { cn } from "@/shared/utils/cn";
import { formatDateUZ } from "@/shared/utils/date.utils";

// Components
import Card from "@/shared/components/ui/Card";
import Button from "@/shared/components/ui/button/Button";

const CoinStats = () => {
  const { data: stats } = useQuery({
    queryKey: ["coins", "stats"],
    queryFn: () => coinsAPI.getStats().then((res) => res.data.data),
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
      <div className="col-span-2 space-y-4">
        {/* Total coin */}
        {/* <Card
          title="Umumiy tarqatilgan tangalar"
          className="flex items-center justify-between"
        >
          <Counter
            value={stats?.totalCoinsDistributed ?? 0}
            className="text-2xl font-bold text-blue-500"
          />
        </Card> */}

        {/* Line Chart */}
        <Card
          className="col-span-2 h-80 space-y-2.5"
          title="So'nggi 30 kundagi O'quvchilar"
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={stats?.dailyDistribution || []}
              margin={{ top: 20, right: 10, left: -20, bottom: 40 }}
            >
              <defs>
                <linearGradient id="colorCoins" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
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
                tick={{ fontSize: 12, fill: "#9CA3AF" }}
                tickFormatter={(val) => formatDateUZ(val, { hideYear: true })}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#9CA3AF" }}
                tickFormatter={(value) => value.toLocaleString()}
              />
              <Tooltip
                labelStyle={{
                  color: "#6B7280",
                  fontSize: "14px",
                  marginBottom: "2px",
                }}
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid #E5E7EB",
                  boxShadow: "0 2px 6px -1px rgb(0 0 0 / 0.1)",
                }}
                labelFormatter={formatDateUZ}
                formatter={(value) => value.toLocaleString()}
                itemStyle={{ color: "#f59e0b", fontWeight: "bold" }}
              />
              <Area
                name="Tangalar"
                strokeWidth={2}
                fillOpacity={1}
                stroke="#f59e0b"
                type="monotone"
                fill="url(#colorCoins)"
                dataKey="totalDistributed"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Groups list */}
      <GroupsList />
    </div>
  );
};

const GroupsList = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-groups"],
    queryFn:  () => classesAPI.getAll({ limit: 200 }).then((res) => res.data),
  });

  const groups = data?.groups ?? [];

  return (
    <Card title="Guruhlar" className="flex flex-col gap-3">
      <div className="max-h-72 overflow-y-auto hidden-scrollbar divide-y divide-gray-100">
        {isLoading && (
          <p className="text-sm text-gray-400 py-4 text-center">Yuklanmoqda...</p>
        )}
        {!isLoading && groups.length === 0 && (
          <p className="text-sm text-gray-400 py-4 text-center">Guruhlar yo'q</p>
        )}
        {!isLoading && groups.map((group, idx) => (
          <div key={group._id} className="flex items-center justify-between py-2 gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="flex items-center justify-center size-6 shrink-0 bg-brown-50 border border-brown-200 text-xs font-semibold text-brown-800">
                {idx + 1}
              </span>
              <p className="text-sm font-medium text-gray-800 truncate">{group.name}</p>
            </div>
            {group.schedule?.time && (
              <span className="text-xs text-gray-400 shrink-0">{group.schedule.time}</span>
            )}
          </div>
        ))}
      </div>

      <Button asChild variant="link" className="inline-block py-0 size-auto mx-auto text-sm">
        <Link to="/classes">Barcha guruhlar</Link>
      </Button>
    </Card>
  );
};

export default CoinStats;
