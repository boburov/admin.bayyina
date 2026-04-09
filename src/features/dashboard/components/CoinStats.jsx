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
import { coinsAPI } from "@/features/coin-settings/api/coins.api";

// Utils
import { cn } from "@/shared/utils/cn";
import { formatDateUZ } from "@/shared/utils/date.utils";

// Components
import Card from "@/shared/components/ui/Card";
import Counter from "@/shared/components/ui/Counter";
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

      {/* Top 10 coin owner */}
      <TopTenCoinOwner stats={stats} />
    </div>
  );
};

const TopTenCoinOwner = ({ stats }) => {
  const getRankColor = (index) => {
    if (index === 0)
      return "size-10 bg-gradient-to-tr from-yellow-400 to-yellow-600";
    if (index === 1)
      return "size-9 mx-0.5 bg-gradient-to-tr from-slate-400 to-slate-700";
    if (index === 2)
      return "size-8 mx-1 bg-gradient-to-tr from-orange-400 to-orange-700";
    return "size-7 mx-1.5 bg-gray-100 text-gray-500";
  };

  return (
    <Card
      title="Top 10 ta guruhlar"
      className="flex flex-col gap-1.5 xs:gap-3.5"
    >
      {/* Main  */}
      <div className="max-h-72 overflow-y-auto hidden-scrollbar">
        {stats?.topEarners.map((student, index) => (
          <div
            key={student._id}
            className={cn(
              "flex items-center justify-between py-2",
              index === 0 ? "sticky top-0 bg-white" : "",
            )}
          >
            {/* Info */}
            <div className="flex items-center gap-2.5">
              <div
                className={cn(
                  "flex items-center justify-center size-8 rounded-full text-sm font-bold text-white",
                  getRankColor(index),
                )}
              >
                {index + 1}
              </div>

              <p className="text-sm font-medium text-gray-800">
                {student.fullName}
              </p>
            </div>

            {/* Coin */}
            <Counter
              value={student?.coinBalance || 0}
              className="text-sm font-semibold text-blue-600"
            />
          </div>
        ))}
      </div>

      {/* Coin controller link */}
      <Button
        asChild
        variant="link"
        className="inline-block py-0 size-auto mx-auto text-sm"
      >
        <Link to="/coin-settings">Tanga sozlamalari</Link>
      </Button>
    </Card>
  );
};

export default CoinStats;
