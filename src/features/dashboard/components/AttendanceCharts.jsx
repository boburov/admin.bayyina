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
import { formatStatMonth } from "@/features/statistics/data/statistics.data";
import { Activity, CheckCircle2 } from "lucide-react";
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

const AttendanceCharts = () => {
  const { data: attendance, isLoading: al } = useAppQuery({
    queryKey: ["statistics", "attendance"],
    queryFn: () => statisticsAPI.getAttendance(),
    select: (r) => r.data,
    staleTime: 60_000,
  });

  const trend = (attendance?.monthlyTrend ?? []).map((d) => ({
    ...d,
    absent: (d.total ?? 0) - (d.present ?? 0),
    label: formatStatMonth(d),
  }));

  const topByAttendance = [...(attendance?.byGroup ?? [])]
    .sort((a, b) => b.attendanceRate - a.attendanceRate)
    .slice(0, 8)
    .map((g) => ({
      name: g.groupName ?? "Noma'lum",
      rate: g.attendanceRate,
      present: g.present,
      total: g.total,
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
          {!trend.length ? (
            <ChartEmpty />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={trend}
                margin={{ top: 4, right: 4, left: -24, bottom: 16 }}
              >
                <defs>
                  <linearGradient id="attPresGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.22} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="attAbsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.18} />
                    <stop offset="100%" stopColor="#f43f5e" stopOpacity={0} />
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
                    name === "present"
                      ? [v, "Kelgan"]
                      : name === "absent"
                        ? [v, "Kelmagan"]
                        : [v, name]
                  }
                />
                <Area
                  type="monotone"
                  dataKey="present"
                  name="present"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fill="url(#attPresGrad)"
                  dot={false}
                  activeDot={{
                    r: 5,
                    fill: "#10b981",
                    stroke: "#fff",
                    strokeWidth: 2,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="absent"
                  name="absent"
                  stroke="#f43f5e"
                  strokeWidth={2.5}
                  fill="url(#attAbsGrad)"
                  dot={false}
                  activeDot={{
                    r: 5,
                    fill: "#f43f5e",
                    stroke: "#fff",
                    strokeWidth: 2,
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard
          accent="bg-gradient-to-r from-amber-400 to-yellow-300"
          icon={CheckCircle2}
          iconBg="bg-amber-50 text-amber-600"
          title="Davomat reytingi"
          linkTo="/attendance-statistics"
          loading={al}
        >
          {!topByAttendance.length ? (
            <ChartEmpty />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topByAttendance}
                margin={{ top: 4, right: 4, left: -24, bottom: 16 }}
                layout="vertical"
              >
                <CartesianGrid horizontal={false} {...grid} />
                <XAxis
                  type="number"
                  domain={[0, 100]}
                  axisLine={false}
                  tickLine={false}
                  tick={tick}
                  tickFormatter={(v) => `${v}%`}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 9.5, fill: "#64748B" }}
                  width={96}
                  tickFormatter={(v) => v.slice(0, 10)}
                />
                <Tooltip
                  {...TT_STYLE}
                  cursor={{ fill: "rgba(241,245,249,0.7)" }}
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
