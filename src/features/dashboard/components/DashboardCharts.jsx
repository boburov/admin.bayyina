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
  formatMoney,
  formatMoneyFull,
} from "@/features/statistics/data/statistics.data";
import { Skeleton } from "@/shared/components/shadcn/skeleton";
import { TrendingUp, School, BarChart2, ArrowUpRight } from "lucide-react";

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

const BAR_PALETTE = [
  "rgba(99,102,241,0.75)",
  "rgba(59,130,246,0.75)",
  "rgba(16,185,129,0.75)",
  "rgba(245,158,11,0.75)",
  "rgba(239,68,68,0.75)",
  "rgba(168,85,247,0.75)",
  "rgba(20,184,166,0.75)",
  "rgba(236,72,153,0.75)",
];

const Empty = () => (
  <div className="flex flex-col items-center justify-center h-full gap-2 py-8">
    <BarChart2 className="size-7 text-slate-200" strokeWidth={1.5} />
    <p className="text-xs text-slate-400">Ma'lumot mavjud emas</p>
  </div>
);

const ChartCard = ({ accent, icon: Icon, iconBg, title, linkTo, linkLabel, loading, children }) => (
  <div className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white/90 backdrop-blur-sm shadow-sm h-64 p-5 flex flex-col">
    <div className={`absolute inset-x-0 top-0 h-[3px] ${accent}`} />
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2.5">
        <div className={`flex items-center justify-center w-8 h-8 rounded-xl ${iconBg}`}>
          <Icon size={15} strokeWidth={2} />
        </div>
        <span className="text-sm font-semibold text-slate-800">{title}</span>
      </div>
      {linkTo && (
        <Link to={linkTo} className="flex items-center gap-0.5 text-xs font-medium text-slate-400 hover:text-slate-700 transition-colors">
          {linkLabel ?? "Batafsil"}
          <ArrowUpRight size={12} strokeWidth={2} />
        </Link>
      )}
    </div>
    <div className="flex-1 min-h-0">
      {loading ? <Skeleton className="w-full h-full rounded-xl" /> : children}
    </div>
  </div>
);

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
    .map((g) => ({ name: g.groupName ?? "Noma'lum", count: g.studentCount }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">

      <ChartCard
        accent="bg-gradient-to-r from-emerald-400 to-teal-500"
        icon={TrendingUp}
        iconBg="bg-emerald-50 text-emerald-600"
        title="Oylik daromad"
        linkTo="/statistics"
        loading={rl}
      >
        {!revenueTrend.length ? <Empty /> : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueTrend} margin={{ top: 4, right: 4, left: 4, bottom: 16 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#10b981" stopOpacity={0.22} />
                  <stop offset="60%"  stopColor="#10b981" stopOpacity={0.06} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} {...grid} />
              <XAxis dataKey="label" axisLine={false} tickLine={false} dy={8} tick={tick} />
              <YAxis axisLine={false} tickLine={false} tick={tick} tickFormatter={formatMoney} width={40} />
              <Tooltip {...TT_STYLE} cursor={{ stroke: "#E2E8F0", strokeWidth: 1 }}
                formatter={(v) => [formatMoneyFull(v), "Daromad"]}
              />
              <Area type="monotone" dataKey="collected"
                stroke="#10b981" strokeWidth={2.5} fill="url(#revGrad)"
                dot={false} activeDot={{ r: 5, fill: "#10b981", stroke: "#fff", strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      <ChartCard
        accent="bg-gradient-to-r from-indigo-400 to-violet-500"
        icon={School}
        iconBg="bg-indigo-50 text-indigo-600"
        title="Guruhlar bo'yicha o'quvchilar"
        linkTo="/classes"
        linkLabel="Barcha guruhlar"
        loading={sl}
      >
        {!groupsData.length ? <Empty /> : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={groupsData} margin={{ top: 4, right: 4, left: -24, bottom: 16 }}>
              <CartesianGrid vertical={false} {...grid} />
              <XAxis
                dataKey="name"
                axisLine={false} tickLine={false} dy={8}
                tick={{ fontSize: 9.5, fill: "#94A3B8" }}
                interval={0}
                tickFormatter={(v) => v.length > 7 ? v.slice(0, 7) + "…" : v}
              />
              <YAxis axisLine={false} tickLine={false} tick={tick} allowDecimals={false} />
              <Tooltip {...TT_STYLE} cursor={{ fill: "rgba(241,245,249,0.7)" }}
                formatter={(v) => [v, "O'quvchi"]}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={32}>
                {groupsData.map((_, i) => (
                  <Cell key={i} fill={BAR_PALETTE[i % BAR_PALETTE.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

    </div>
  );
};

export default DashboardCharts;
