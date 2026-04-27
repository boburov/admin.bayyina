// TanStack Query
import { useAppQuery } from "@/shared/lib/query/query-hooks";

// Recharts
import {
  AreaChart, Area,
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
import Card from "@/shared/components/ui/Card";
import Button from "@/shared/components/ui/button/Button";
import { Skeleton } from "@/shared/components/shadcn/skeleton";

// Icons
import { Activity, TrendingUp, BarChart2 } from "lucide-react";

// ─── Shared ───────────────────────────────────────────────────────────────────

const grid    = { stroke: "#F3F4F6", strokeDasharray: "3 3" };
const tick    = { fontSize: 11, fill: "#9CA3AF" };
const tooltip = TOOLTIP_STYLE;

const Empty = () => (
  <div className="flex flex-col items-center justify-center h-full gap-2 py-8">
    <BarChart2 className="size-7 text-gray-200" strokeWidth={1.5} />
    <p className="text-xs text-gray-400">Ma'lumot mavjud emas</p>
  </div>
);

// ─── Component ────────────────────────────────────────────────────────────────

const DashboardCharts = () => {
  const { data: attendance, isLoading: al } = useAppQuery({
    queryKey: ["statistics", "attendance"],
    queryFn:  () => statisticsAPI.getAttendance(),
    select:   (r) => r.data,
    staleTime: 60_000,
  });

  const { data: revenue, isLoading: rl } = useAppQuery({
    queryKey: ["statistics", "revenue"],
    queryFn:  () => statisticsAPI.getRevenue(),
    select:   (r) => r.data,
    staleTime: 60_000,
  });

  const attendanceTrend = (attendance?.monthlyTrend ?? []).map((d) => ({
    ...d,
    absent: (d.total ?? 0) - (d.present ?? 0),
    label:  formatStatMonth(d),
  }));

  const revenueTrend = (revenue?.monthlyRevenue ?? []).map((d) => ({
    ...d,
    label: formatStatMonth(d),
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">

      {/* ── Attendance chart ─────────────────────────────────────────────── */}
      <Card className="h-64">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Activity className="size-4 text-brown-800" strokeWidth={1.5} />
            <span className="text-sm font-semibold text-gray-800">Oylik davomat</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <span className="inline-block w-2.5 h-0.5 rounded" style={{ background: CHART_COLORS.green }} />
              Kelgan
            </span>
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <span className="inline-block w-2.5 h-0.5 rounded" style={{ background: CHART_COLORS.red }} />
              Kelmagan
            </span>
            <Button asChild variant="link" className="text-xs p-0 h-auto">
              <Link to="/statistics">Batafsil</Link>
            </Button>
          </div>
        </div>

        {al ? (
          <Skeleton className="w-full h-44" />
        ) : !attendanceTrend.length ? (
          <Empty />
        ) : (
          <ResponsiveContainer width="100%" height="85%">
            <AreaChart data={attendanceTrend} margin={{ top: 4, right: 8, left: -20, bottom: 20 }}>
              <defs>
                <linearGradient id="dashPresentGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor={CHART_COLORS.green} stopOpacity={0.15} />
                  <stop offset="100%" stopColor={CHART_COLORS.green} stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="dashAbsentGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor={CHART_COLORS.red} stopOpacity={0.12} />
                  <stop offset="100%" stopColor={CHART_COLORS.red} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} {...grid} />
              <XAxis dataKey="label" axisLine={false} tickLine={false} dy={8} tick={tick} />
              <YAxis axisLine={false} tickLine={false} tick={tick} allowDecimals={false} />
              <Tooltip
                contentStyle={tooltip.contentStyle}
                labelStyle={tooltip.labelStyle}
                cursor={{ stroke: "#E5E7EB", strokeWidth: 1 }}
                formatter={(v, name) =>
                  name === "present" ? [v, "Kelgan"] :
                  name === "absent"  ? [v, "Kelmagan"] : [v, name]
                }
              />
              <Area type="monotone" dataKey="present" name="present"
                stroke={CHART_COLORS.green} fill="url(#dashPresentGrad)"
                strokeWidth={2} dot={false} activeDot={{ r: 4, strokeWidth: 2, stroke: "#fff" }}
              />
              <Area type="monotone" dataKey="absent" name="absent"
                stroke={CHART_COLORS.red} fill="url(#dashAbsentGrad)"
                strokeWidth={2} dot={false} activeDot={{ r: 4, strokeWidth: 2, stroke: "#fff" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </Card>

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

    </div>
  );
};

export default DashboardCharts;
