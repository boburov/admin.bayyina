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
} from "@/features/statistics/data/statistics.data";
import { Skeleton } from "@/shared/components/shadcn/skeleton";
import { Activity, BarChart2, CheckCircle2, ArrowUpRight } from "lucide-react";

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

const RATE_GLASS = [
  "rgba(16,185,129,0.80)",
  "rgba(34,197,94,0.76)",
  "rgba(74,222,128,0.72)",
  "rgba(134,239,172,0.68)",
  "rgba(187,247,208,0.65)",
  "rgba(253,224,71,0.70)",
  "rgba(251,191,36,0.74)",
  "rgba(245,158,11,0.78)",
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

const AttendanceCharts = () => {
  const { data: attendance, isLoading: al } = useAppQuery({
    queryKey: ["statistics", "attendance"],
    queryFn:  () => statisticsAPI.getAttendance(),
    select:   (r) => r.data,
    staleTime: 60_000,
  });

  const trend = (attendance?.monthlyTrend ?? []).map((d) => ({
    ...d,
    absent: (d.total ?? 0) - (d.present ?? 0),
    label:  formatStatMonth(d),
  }));

  const topByAttendance = [...(attendance?.byGroup ?? [])]
    .sort((a, b) => b.attendanceRate - a.attendanceRate)
    .slice(0, 8)
    .map((g) => ({
      name:    g.groupName ?? "Noma'lum",
      rate:    g.attendanceRate,
      present: g.present,
      total:   g.total,
    }));

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">

        <ChartCard
          accent="bg-gradient-to-r from-rose-400 to-orange-400"
          icon={Activity}
          iconBg="bg-rose-50 text-rose-500"
          title="Oylik davomat"
          linkTo="/attendance-statistics"
          loading={al}
          legend={
            <div className="hidden sm:flex items-center gap-3">
              <span className="flex items-center gap-1 text-[10.5px] font-medium text-slate-400">
                <span className="inline-block w-2.5 h-[2.5px] rounded-full bg-emerald-400" />
                Kelgan
              </span>
              <span className="flex items-center gap-1 text-[10.5px] font-medium text-slate-400">
                <span className="inline-block w-2.5 h-[2.5px] rounded-full bg-rose-400" />
                Kelmagan
              </span>
            </div>
          }
        >
          {!trend.length ? <Empty /> : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend} margin={{ top: 4, right: 4, left: -24, bottom: 16 }}>
                <defs>
                  <linearGradient id="attPresGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#10b981" stopOpacity={0.22} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="attAbsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#f43f5e" stopOpacity={0.18} />
                    <stop offset="100%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} {...grid} />
                <XAxis dataKey="label" axisLine={false} tickLine={false} dy={8} tick={tick} />
                <YAxis axisLine={false} tickLine={false} tick={tick} allowDecimals={false} />
                <Tooltip {...TT_STYLE} cursor={{ stroke: "#E2E8F0", strokeWidth: 1 }}
                  formatter={(v, name) =>
                    name === "present" ? [v, "Kelgan"] :
                    name === "absent"  ? [v, "Kelmagan"] : [v, name]
                  }
                />
                <Area type="monotone" dataKey="present" name="present"
                  stroke="#10b981" strokeWidth={2.5} fill="url(#attPresGrad)"
                  dot={false} activeDot={{ r: 5, fill: "#10b981", stroke: "#fff", strokeWidth: 2 }}
                />
                <Area type="monotone" dataKey="absent" name="absent"
                  stroke="#f43f5e" strokeWidth={2.5} fill="url(#attAbsGrad)"
                  dot={false} activeDot={{ r: 5, fill: "#f43f5e", stroke: "#fff", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard
          accent="bg-gradient-to-r from-amber-400 to-yellow-300"
          icon={CheckCircle2}
          iconBg="bg-amber-50 text-amber-600"
          title="Davomat reytingi (guruhlar)"
          linkTo="/attendance-statistics"
          loading={al}
        >
          {!topByAttendance.length ? <Empty /> : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topByAttendance} margin={{ top: 4, right: 4, left: -24, bottom: 16 }} layout="vertical">
                <CartesianGrid horizontal={false} {...grid} />
                <XAxis
                  type="number" domain={[0, 100]}
                  axisLine={false} tickLine={false} tick={tick}
                  tickFormatter={(v) => `${v}%`}
                />
                <YAxis
                  type="category" dataKey="name"
                  axisLine={false} tickLine={false}
                  tick={{ fontSize: 9.5, fill: "#64748B" }}
                  width={86}
                  tickFormatter={(v) => v.length > 13 ? v.slice(0, 13) + "…" : v}
                />
                <Tooltip {...TT_STYLE} cursor={{ fill: "rgba(241,245,249,0.7)" }}
                  formatter={(v, _, p) => [
                    `${v}% (${p.payload.present}/${p.payload.total})`,
                    "Davomat",
                  ]}
                />
                <Bar dataKey="rate" radius={[0, 4, 4, 0]} maxBarSize={16}>
                  {topByAttendance.map((_, i) => (
                    <Cell key={i} fill={RATE_GLASS[i % RATE_GLASS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

      </div>
    </>
  );
};

export default AttendanceCharts;
