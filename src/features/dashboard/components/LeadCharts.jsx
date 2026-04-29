import { useAppQuery } from "@/shared/lib/query/query-hooks";
import {
  AreaChart, Area,
  BarChart, Bar, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Link } from "react-router-dom";
import { statisticsAPI } from "@/features/statistics/api/statistics.api";
import {
  formatStatMonth,
  CHART_COLORS,
  LEAD_STATUS_LABELS,
  LEAD_STATUS_COLORS,
} from "@/features/statistics/data/statistics.data";
import { Skeleton } from "@/shared/components/shadcn/skeleton";
import { UserPlus, BarChart2, ArrowUpRight } from "lucide-react";

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
  labelStyle: { color: "#64748B", fontSize: "11px", marginBottom: "3px", fontWeight: 600 },
};

const STATUS_GLASS = [
  "rgba(99,102,241,0.72)",
  "rgba(59,130,246,0.72)",
  "rgba(245,158,11,0.72)",
  "rgba(20,184,166,0.72)",
  "rgba(34,197,94,0.72)",
  "rgba(239,68,68,0.72)",
];

const Empty = () => (
  <div className="flex flex-col items-center justify-center h-full gap-2 py-8">
    <BarChart2 className="size-7 text-slate-200" strokeWidth={1.5} />
    <p className="text-xs text-slate-400">Ma'lumot mavjud emas</p>
  </div>
);

const ChartCard = ({ accent, icon: Icon, iconBg, title, linkTo, badge, loading, legend, children }) => (
  <div className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white/90 backdrop-blur-sm shadow-sm h-64 p-5 flex flex-col">
    <div className={`absolute inset-x-0 top-0 h-[3px] ${accent}`} />
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2.5">
        <div className={`flex items-center justify-center w-8 h-8 rounded-xl ${iconBg}`}>
          <Icon size={15} strokeWidth={2} />
        </div>
        <span className="text-sm font-semibold text-slate-800">{title}</span>
      </div>
      <div className="flex items-center gap-2">
        {legend}
        {badge}
        {linkTo && (
          <Link to={linkTo} className="flex items-center gap-0.5 text-xs font-medium text-slate-400 hover:text-slate-700 transition-colors">
            Batafsil <ArrowUpRight size={12} strokeWidth={2} />
          </Link>
        )}
      </div>
    </div>
    <div className="flex-1 min-h-0">
      {loading ? <Skeleton className="w-full h-full rounded-xl" /> : children}
    </div>
  </div>
);

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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">

      <ChartCard
        accent="bg-gradient-to-r from-blue-400 to-cyan-500"
        icon={UserPlus}
        iconBg="bg-blue-50 text-blue-600"
        title="Oylik leadlar"
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
        {!trend.length ? <Empty /> : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trend} margin={{ top: 4, right: 4, left: -24, bottom: 16 }}>
              <defs>
                <linearGradient id="leadTotalGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#3b82f6" stopOpacity={0.20} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="leadConvGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#10b981" stopOpacity={0.22} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} {...grid} />
              <XAxis dataKey="label" axisLine={false} tickLine={false} dy={8} tick={tick} />
              <YAxis axisLine={false} tickLine={false} tick={tick} allowDecimals={false} />
              <Tooltip {...TT_STYLE} cursor={{ stroke: "#E2E8F0", strokeWidth: 1 }}
                formatter={(v, name) =>
                  name === "total" ? [v, "Jami lead"] :
                  name === "converted" ? [v, "Qabul qilindi"] : [v, name]
                }
              />
              <Area type="monotone" dataKey="total" name="total"
                stroke="#3b82f6" strokeWidth={2.5} fill="url(#leadTotalGrad)"
                dot={false} activeDot={{ r: 5, fill: "#3b82f6", stroke: "#fff", strokeWidth: 2 }}
              />
              <Area type="monotone" dataKey="converted" name="converted"
                stroke="#10b981" strokeWidth={2.5} fill="url(#leadConvGrad)"
                dot={false} activeDot={{ r: 5, fill: "#10b981", stroke: "#fff", strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      <ChartCard
        accent="bg-gradient-to-r from-violet-400 to-pink-500"
        icon={BarChart2}
        iconBg="bg-violet-50 text-violet-600"
        title="Leadlar holati"
        loading={isLoading}
        badge={
          leads?.conversionRate != null && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
              {leads.conversionRate}% konversiya
            </span>
          )
        }
      >
        {!statusData.length ? <Empty /> : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={statusData} margin={{ top: 4, right: 4, left: -20, bottom: 16 }} layout="vertical">
              <CartesianGrid horizontal={false} {...grid} />
              <XAxis type="number" axisLine={false} tickLine={false} tick={tick} allowDecimals={false} />
              <YAxis
                type="category" dataKey="label"
                axisLine={false} tickLine={false}
                tick={{ fontSize: 9.5, fill: "#64748B" }}
                width={78}
              />
              <Tooltip {...TT_STYLE} cursor={{ fill: "rgba(241,245,249,0.7)" }}
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
