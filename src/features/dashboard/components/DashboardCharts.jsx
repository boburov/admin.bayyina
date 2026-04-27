// TanStack Query
import { useAppQuery } from "@/shared/lib/query/query-hooks";

// Recharts
import {
  AreaChart, Area,
  BarChart, Bar, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from "recharts";

// Router
import { Link } from "react-router-dom";

// API
import { statisticsAPI } from "@/features/statistics/api/statistics.api";

// Data
import {
  formatStatMonth,
  formatMoney,
  formatMoneyFull,
  CHART_COLORS,
  TOOLTIP_STYLE,
} from "@/features/statistics/data/statistics.data";

// Components
import Card   from "@/shared/components/ui/Card";
import Button from "@/shared/components/ui/button/Button";
import { Skeleton } from "@/shared/components/shadcn/skeleton";

// Icons
import { TrendingUp, School, BarChart2 } from "lucide-react";

// ─── Shared ───────────────────────────────────────────────────────────────────

const grid    = { stroke: "#F3F4F6", strokeDasharray: "3 3" };
const tick    = { fontSize: 11, fill: "#9CA3AF" };
const tooltip = TOOLTIP_STYLE;

const BAR_COLORS = [
  "#92400e", "#b45309", "#d97706", "#f59e0b",
  "#16a34a", "#15803d", "#2563eb", "#4f46e5",
];

const Empty = () => (
  <div className="flex flex-col items-center justify-center h-full gap-2 py-8">
    <BarChart2 className="size-7 text-gray-200" strokeWidth={1.5} />
    <p className="text-xs text-gray-400">Ma'lumot mavjud emas</p>
  </div>
);

// ─── Component ────────────────────────────────────────────────────────────────

const DashboardCharts = () => {
  const { data: revenue, isLoading: rl } = useAppQuery({
    queryKey: ["statistics", "revenue"],
    queryFn:  () => statisticsAPI.getRevenue(),
    select:   (r) => r.data,
    staleTime: 60_000,
  });

  const { data: students, isLoading: sl } = useAppQuery({
    queryKey: ["statistics", "students"],
    queryFn:  () => statisticsAPI.getStudents(),
    select:   (r) => r.data,
    staleTime: 60_000,
  });

  const revenueTrend = (revenue?.monthlyRevenue ?? []).map((d) => ({
    ...d,
    label: formatStatMonth(d),
  }));

  const groupsData = (students?.studentsPerGroup ?? [])
    .slice(0, 8)
    .map((g) => ({
      name:  g.groupName ?? "Noma'lum",
      count: g.studentCount,
    }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">

      {/* ── Revenue chart ────────────────────────────────────────────────── */}
      <Card className="h-64">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="size-4 text-brown-800" strokeWidth={1.5} />
            <span className="text-sm font-semibold text-gray-800">Oylik daromad</span>
          </div>
          <Button asChild variant="link" className="text-xs p-0 h-auto">
            <Link to="/statistics">Batafsil</Link>
          </Button>
        </div>

        {rl ? (
          <Skeleton className="w-full h-44" />
        ) : !revenueTrend.length ? (
          <Empty />
        ) : (
          <ResponsiveContainer width="100%" height="85%">
            <AreaChart data={revenueTrend} margin={{ top: 4, right: 8, left: 8, bottom: 20 }}>
              <defs>
                <linearGradient id="dashRevGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor={CHART_COLORS.green} stopOpacity={0.18} />
                  <stop offset="100%" stopColor={CHART_COLORS.green} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} {...grid} />
              <XAxis dataKey="label" axisLine={false} tickLine={false} dy={8} tick={tick} />
              <YAxis axisLine={false} tickLine={false} tick={tick} tickFormatter={formatMoney} width={44} />
              <Tooltip
                contentStyle={tooltip.contentStyle}
                labelStyle={tooltip.labelStyle}
                cursor={{ stroke: "#E5E7EB", strokeWidth: 1 }}
                formatter={(v) => [formatMoneyFull(v), "Daromad"]}
              />
              <Area type="monotone" dataKey="collected" name="Daromad"
                stroke={CHART_COLORS.green} fill="url(#dashRevGrad)"
                strokeWidth={2} dot={false} activeDot={{ r: 4, strokeWidth: 2, stroke: "#fff" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </Card>

      {/* ── Groups by student count chart ────────────────────────────────── */}
      <Card className="h-64">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <School className="size-4 text-brown-800" strokeWidth={1.5} />
            <span className="text-sm font-semibold text-gray-800">Guruhlar bo'yicha o'quvchilar</span>
          </div>
          <Button asChild variant="link" className="text-xs p-0 h-auto">
            <Link to="/classes">Barcha guruhlar</Link>
          </Button>
        </div>

        {sl ? (
          <Skeleton className="w-full h-44" />
        ) : !groupsData.length ? (
          <Empty />
        ) : (
          <ResponsiveContainer width="100%" height="85%">
            <BarChart data={groupsData} margin={{ top: 4, right: 8, left: -20, bottom: 20 }}>
              <CartesianGrid vertical={false} {...grid} />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                dy={8}
                tick={{ fontSize: 10, fill: "#9CA3AF" }}
                interval={0}
                tickFormatter={(v) => v.length > 8 ? v.slice(0, 8) + "…" : v}
              />
              <YAxis axisLine={false} tickLine={false} tick={tick} allowDecimals={false} />
              <Tooltip
                contentStyle={tooltip.contentStyle}
                labelStyle={tooltip.labelStyle}
                cursor={{ fill: "#F9FAFB" }}
                formatter={(v) => [v, "O'quvchi"]}
              />
              <Bar dataKey="count" name="O'quvchi" radius={[3, 3, 0, 0]} maxBarSize={36}>
                {groupsData.map((_, i) => (
                  <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>

    </div>
  );
};

export default DashboardCharts;
