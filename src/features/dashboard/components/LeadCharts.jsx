// TanStack Query
import { useAppQuery } from "@/shared/lib/query/query-hooks";

// Recharts
import {
  AreaChart, Area,
  BarChart, Bar, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from "recharts";

// Router
import { Link } from "react-router-dom";

// API
import { statisticsAPI } from "@/features/statistics/api/statistics.api";

// Data
import {
  formatStatMonth,
  CHART_COLORS,
  TOOLTIP_STYLE,
  LEAD_STATUS_LABELS,
  LEAD_STATUS_COLORS,
} from "@/features/statistics/data/statistics.data";

// Components
import Card   from "@/shared/components/ui/Card";
import Button from "@/shared/components/ui/button/Button";
import { Skeleton } from "@/shared/components/shadcn/skeleton";

// Icons
import { UserPlus, BarChart2 } from "lucide-react";

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

const LeadCharts = () => {
  const { data: leads, isLoading } = useAppQuery({
    queryKey: ["statistics", "leads"],
    queryFn:  () => statisticsAPI.getLeads(),
    select:   (r) => r.data,
    staleTime: 60_000,
  });

  const trend = (leads?.monthlyTrend ?? []).map((d) => ({
    ...d,
    label: formatStatMonth(d),
  }));

  const statusData = (leads?.byStatus ?? []).map((d) => ({
    label: LEAD_STATUS_LABELS[d.status] ?? d.status,
    count: d.count,
    status: d.status,
  }));

  const sourceData = (leads?.bySource ?? []).slice(0, 7).map((d) => ({
    label: d.source,
    count: d.count,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">

      {/* ── Lead monthly trend ───────────────────────────────────────────── */}
      <Card className="h-64">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <UserPlus className="size-4 text-brown-800" strokeWidth={1.5} />
            <span className="text-sm font-semibold text-gray-800">Oylik leadlar</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <span className="inline-block w-2.5 h-0.5 rounded" style={{ background: CHART_COLORS.blue }} />
              Jami
            </span>
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <span className="inline-block w-2.5 h-0.5 rounded" style={{ background: CHART_COLORS.green }} />
              Qabul
            </span>
            <Button asChild variant="link" className="text-xs p-0 h-auto">
              <Link to="/leads">Batafsil</Link>
            </Button>
          </div>
        </div>

        {isLoading ? (
          <Skeleton className="w-full h-44" />
        ) : !trend.length ? (
          <Empty />
        ) : (
          <ResponsiveContainer width="100%" height="85%">
            <AreaChart data={trend} margin={{ top: 4, right: 8, left: -20, bottom: 20 }}>
              <defs>
                <linearGradient id="leadTotalGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor={CHART_COLORS.blue}  stopOpacity={0.15} />
                  <stop offset="100%" stopColor={CHART_COLORS.blue}  stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="leadConvGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor={CHART_COLORS.green} stopOpacity={0.18} />
                  <stop offset="100%" stopColor={CHART_COLORS.green} stopOpacity={0.02} />
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
                  name === "total"     ? [v, "Jami lead"] :
                  name === "converted" ? [v, "Qabul qilindi"] : [v, name]
                }
              />
              <Area type="monotone" dataKey="total" name="total"
                stroke={CHART_COLORS.blue}  fill="url(#leadTotalGrad)"
                strokeWidth={2} dot={false} activeDot={{ r: 4, strokeWidth: 2, stroke: "#fff" }}
              />
              <Area type="monotone" dataKey="converted" name="converted"
                stroke={CHART_COLORS.green} fill="url(#leadConvGrad)"
                strokeWidth={2} dot={false} activeDot={{ r: 4, strokeWidth: 2, stroke: "#fff" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </Card>

      {/* ── Lead status + source ─────────────────────────────────────────── */}
      <Card className="h-64">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <BarChart2 className="size-4 text-brown-800" strokeWidth={1.5} />
            <span className="text-sm font-semibold text-gray-800">Leadlar holati</span>
          </div>
          {leads?.conversionRate != null && (
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-50 border border-green-200 text-green-700">
              Konversiya: {leads.conversionRate}%
            </span>
          )}
        </div>

        {isLoading ? (
          <Skeleton className="w-full h-44" />
        ) : !statusData.length ? (
          <Empty />
        ) : (
          <ResponsiveContainer width="100%" height="85%">
            <BarChart data={statusData} margin={{ top: 4, right: 8, left: -20, bottom: 20 }} layout="vertical">
              <CartesianGrid horizontal={false} {...grid} />
              <XAxis type="number" axisLine={false} tickLine={false} tick={tick} allowDecimals={false} />
              <YAxis
                type="category"
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "#6B7280" }}
                width={80}
              />
              <Tooltip
                contentStyle={tooltip.contentStyle}
                labelStyle={tooltip.labelStyle}
                cursor={{ fill: "#F9FAFB" }}
                formatter={(v) => [v, "Lead"]}
              />
              <Bar dataKey="count" name="Lead" radius={[0, 3, 3, 0]} maxBarSize={20}>
                {statusData.map((d, i) => (
                  <Cell
                    key={d.status}
                    fill={LEAD_STATUS_COLORS[i % LEAD_STATUS_COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>

    </div>
  );
};

export default LeadCharts;
