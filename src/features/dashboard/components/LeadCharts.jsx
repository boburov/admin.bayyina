import { useAppQuery } from "@/shared/lib/query/query-hooks";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { statisticsAPI } from "@/features/statistics/api/statistics.api";
import {
  formatStatMonth,
  LEAD_STATUS_LABELS,
} from "@/features/statistics/data/statistics.data";
import { UserPlus, BarChart2 } from "lucide-react";
import ChartCard from "./ChartCard";
import ChartEmpty from "./ChartEmpty";

const grid = { stroke: "#F1F5F9", strokeDasharray: "4 4" };
const tick = { fontSize: 10.5, fill: "#94A3B8" };

const TT_STYLE = {
  contentStyle: {
    borderRadius: "10px",
    border: "1px solid rgba(226,232,240,0.8)",
    boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
    backdropFilter: "blur(8px)",
    background: "rgba(255,255,255,0.92)",
    fontSize: "12px",
    padding: "8px 12px",
  },
  labelStyle: {
    color: "#64748B",
    fontSize: "11px",
    marginBottom: "3px",
    fontWeight: 600,
  },
};

const STATUS_GLASS = [
  "rgba(99,102,241,0.72)",
  "rgba(59,130,246,0.72)",
  "rgba(245,158,11,0.72)",
  "rgba(20,184,166,0.72)",
  "rgba(34,197,94,0.72)",
  "rgba(239,68,68,0.72)",
];

const LeadCharts = () => {
  const { data: leads, isLoading } = useAppQuery({
    queryKey: ["statistics", "leads"],
    queryFn: () => statisticsAPI.getLeads(),
    select: (r) => r.data,
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
      <ChartCard
        accent="bg-gradient-to-r from-blue-400 to-cyan-500"
        icon={UserPlus}
        iconBg="bg-blue-50 text-blue-600"
        title="Oylik sotuvlar"
        linkTo="/leads"
        loading={isLoading}
        legend={
          <div className="hidden sm:flex items-center gap-3">
            <span className="flex items-center gap-1 text-[10.5px] font-medium text-slate-400">
              <span className="inline-block w-2.5 h-[2.5px] rounded-full bg-blue-400" />
              Jami
            </span>
            <span className="flex items-center gap-1 text-[10.5px] font-medium text-slate-400">
              <span className="inline-block w-2.5 h-[2.5px] rounded-full bg-emerald-400" />
              Qabul
            </span>
          </div>
        }
      >
        {!trend.length ? (
          <ChartEmpty />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={trend}
              margin={{ top: 4, right: 4, left: -24, bottom: 16 }}
            >
              <defs>
                <linearGradient id="leadTotalGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="leadConvGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.22} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} {...grid} />
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                dy={8}
                tick={tick}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={tick}
                allowDecimals={false}
              />
              <Tooltip
                {...TT_STYLE}
                cursor={{ stroke: "#E2E8F0", strokeWidth: 1 }}
                formatter={(v, name) =>
                  name === "total"
                    ? [v, "Jami lead"]
                    : name === "converted"
                      ? [v, "Qabul qilindi"]
                      : [v, name]
                }
              />
              <Area
                type="monotone"
                dataKey="total"
                name="total"
                stroke="#3b82f6"
                strokeWidth={2.5}
                fill="url(#leadTotalGrad)"
                dot={false}
                activeDot={{
                  r: 5,
                  fill: "#3b82f6",
                  stroke: "#fff",
                  strokeWidth: 2,
                }}
              />
              <Area
                type="monotone"
                dataKey="converted"
                name="converted"
                stroke="#10b981"
                strokeWidth={2.5}
                fill="url(#leadConvGrad)"
                dot={false}
                activeDot={{
                  r: 5,
                  fill: "#10b981",
                  stroke: "#fff",
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      <ChartCard
        accent="bg-gradient-to-r from-violet-400 to-pink-500"
        icon={BarChart2}
        iconBg="bg-violet-50 text-violet-600"
        title="Sotuvlar holati"
        loading={isLoading}
        badge={
          leads?.conversionRate != null && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
              {leads.conversionRate}% konversiya
            </span>
          )
        }
      >
        {!statusData.length ? (
          <ChartEmpty />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={statusData}
              margin={{ top: 4, right: 4, left: -20, bottom: 16 }}
              layout="vertical"
            >
              <CartesianGrid horizontal={false} {...grid} />
              <XAxis
                type="number"
                axisLine={false}
                tickLine={false}
                tick={tick}
                allowDecimals={false}
              />
              <YAxis
                type="category"
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 9.5, fill: "#64748B" }}
                width={78}
              />
              <Tooltip
                {...TT_STYLE}
                cursor={{ fill: "rgba(241,245,249,0.7)" }}
                formatter={(v) => [v, "Lead"]}
              />
              <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={18}>
                {statusData.map((_, i) => (
                  <Cell key={i} fill={STATUS_GLASS[i % STATUS_GLASS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartCard>
    </div>
  );
};

export default LeadCharts;
