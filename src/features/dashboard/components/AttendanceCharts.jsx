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
  CHART_COLORS,
  TOOLTIP_STYLE,
} from "@/features/statistics/data/statistics.data";

// Components
import Card   from "@/shared/components/ui/Card";
import Button from "@/shared/components/ui/button/Button";
import { Skeleton } from "@/shared/components/shadcn/skeleton";

// Icons
import { Activity, Award, BarChart2, CheckCircle2, XCircle } from "lucide-react";

// ─── Shared ───────────────────────────────────────────────────────────────────

const grid    = { stroke: "#F3F4F6", strokeDasharray: "3 3" };
const tick    = { fontSize: 11, fill: "#9CA3AF" };
const tooltip = TOOLTIP_STYLE;

const RATE_COLORS = [
  "#16a34a", "#22c55e", "#4ade80",
  "#86efac", "#bbf7d0", "#dcfce7",
  "#fef9c3", "#fde047",
];

const Empty = () => (
  <div className="flex flex-col items-center justify-center h-full gap-2 py-8">
    <BarChart2 className="size-7 text-gray-200" strokeWidth={1.5} />
    <p className="text-xs text-gray-400">Ma'lumot mavjud emas</p>
  </div>
);

// ─── Component ────────────────────────────────────────────────────────────────

const AttendanceCharts = () => {
  const { data: attendance, isLoading: al } = useAppQuery({
    queryKey: ["statistics", "attendance"],
    queryFn:  () => statisticsAPI.getAttendance(),
    select:   (r) => r.data,
    staleTime: 60_000,
  });

  const { data: students, isLoading: sl } = useAppQuery({
    queryKey: ["statistics", "students"],
    queryFn:  () => statisticsAPI.getStudents(),
    select:   (r) => r.data,
    staleTime: 60_000,
  });

  // Monthly trend
  const trend = (attendance?.monthlyTrend ?? []).map((d) => ({
    ...d,
    absent: (d.total ?? 0) - (d.present ?? 0),
    label:  formatStatMonth(d),
  }));

  // Top 8 groups by attendance rate
  const topByAttendance = [...(attendance?.byGroup ?? [])]
    .sort((a, b) => b.attendanceRate - a.attendanceRate)
    .slice(0, 8)
    .map((g) => ({
      name:  g.groupName ?? "Noma'lum",
      rate:  g.attendanceRate,
      present: g.present,
      total:   g.total,
    }));

  // Merge attendance byGroup + studentsPerGroup → joint ranking
  const studentMap = {};
  (students?.studentsPerGroup ?? []).forEach((g) => {
    studentMap[g.groupName] = g.studentCount;
  });

  const combined = [...(attendance?.byGroup ?? [])]
    .filter((g) => g.groupName)
    .map((g) => ({
      name:     g.groupName,
      rate:     g.attendanceRate,
      students: studentMap[g.groupName] ?? 0,
      score:    g.attendanceRate * (studentMap[g.groupName] ?? 1),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);

  const loading = al || sl;

  return (
    <>
      {/* ── Row 1: trend + top attendance ────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">

        {/* Oylik davomat trend */}
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
                <Link to="/attendance-statistics">Batafsil</Link>
              </Button>
            </div>
          </div>

          {al ? (
            <Skeleton className="w-full h-44" />
          ) : !trend.length ? (
            <Empty />
          ) : (
            <ResponsiveContainer width="100%" height="85%">
              <AreaChart data={trend} margin={{ top: 4, right: 8, left: -20, bottom: 20 }}>
                <defs>
                  <linearGradient id="attPresentGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor={CHART_COLORS.green} stopOpacity={0.18} />
                    <stop offset="100%" stopColor={CHART_COLORS.green} stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="attAbsentGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor={CHART_COLORS.red} stopOpacity={0.14} />
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
                  stroke={CHART_COLORS.green} fill="url(#attPresentGrad)"
                  strokeWidth={2} dot={false} activeDot={{ r: 4, strokeWidth: 2, stroke: "#fff" }}
                />
                <Area type="monotone" dataKey="absent" name="absent"
                  stroke={CHART_COLORS.red} fill="url(#attAbsentGrad)"
                  strokeWidth={2} dot={false} activeDot={{ r: 4, strokeWidth: 2, stroke: "#fff" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Top guruhlar by attendance rate */}
        <Card className="h-64">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-brown-800" strokeWidth={1.5} />
              <span className="text-sm font-semibold text-gray-800">Davomat reytingi (guruhlar)</span>
            </div>
            <Button asChild variant="link" className="text-xs p-0 h-auto">
              <Link to="/attendance-statistics">Batafsil</Link>
            </Button>
          </div>

          {al ? (
            <Skeleton className="w-full h-44" />
          ) : !topByAttendance.length ? (
            <Empty />
          ) : (
            <ResponsiveContainer width="100%" height="85%">
              <BarChart data={topByAttendance} margin={{ top: 4, right: 16, left: -20, bottom: 20 }} layout="vertical">
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
                  tick={{ fontSize: 9.5, fill: "#6B7280" }}
                  width={88}
                  tickFormatter={(v) => v.length > 14 ? v.slice(0, 14) + "…" : v}
                />
                <Tooltip
                  contentStyle={tooltip.contentStyle}
                  labelStyle={tooltip.labelStyle}
                  cursor={{ fill: "#F9FAFB" }}
                  formatter={(v, _, props) => [
                    `${v}% (${props.payload.present}/${props.payload.total})`,
                    "Davomat"
                  ]}
                />
                <Bar dataKey="rate" name="Davomat %" radius={[0, 3, 3, 0]} maxBarSize={18}>
                  {topByAttendance.map((_, i) => (
                    <Cell key={i} fill={RATE_COLORS[i % RATE_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      {/* ── Row 2: combined ranking table ────────────────────────────────── */}
      {!loading && combined.length > 0 && (
        <div className="mb-4">
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <Award className="size-4 text-brown-800" strokeWidth={1.5} />
              <span className="text-sm font-semibold text-gray-800">
                Guruhlar reytingi — davomat × o'quvchilar soni
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left pb-2 pr-3 text-xs font-medium text-gray-400 w-8">#</th>
                    <th className="text-left pb-2 pr-3 text-xs font-medium text-gray-400">Guruh</th>
                    <th className="text-center pb-2 pr-3 text-xs font-medium text-gray-400">O'quvchilar</th>
                    <th className="text-left pb-2 text-xs font-medium text-gray-400 min-w-[140px]">Davomat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {combined.map((g, i) => {
                    const barColor =
                      g.rate >= 80 ? CHART_COLORS.green :
                      g.rate >= 60 ? CHART_COLORS.amber :
                                     CHART_COLORS.red;
                    return (
                      <tr key={g.name} className="hover:bg-gray-50 transition-colors">
                        <td className="py-2.5 pr-3 text-xs text-gray-400 font-mono">{i + 1}</td>
                        <td className="py-2.5 pr-3 font-medium text-gray-800 text-xs max-w-[200px] truncate">
                          {g.name}
                        </td>
                        <td className="py-2.5 pr-3 text-center text-xs text-gray-600 font-semibold">
                          {g.students}
                        </td>
                        <td className="py-2.5">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-100 rounded-full h-1.5 max-w-[100px]">
                              <div
                                className="h-1.5 rounded-full transition-all"
                                style={{ width: `${g.rate}%`, background: barColor }}
                              />
                            </div>
                            <span
                              className="text-xs font-semibold w-10 shrink-0"
                              style={{ color: barColor }}
                            >
                              {g.rate}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100">
              <span className="flex items-center gap-1.5 text-xs text-gray-400">
                <span className="inline-block w-2.5 h-1.5 rounded-full bg-green-500" />
                80%+ yaxshi
              </span>
              <span className="flex items-center gap-1.5 text-xs text-gray-400">
                <span className="inline-block w-2.5 h-1.5 rounded-full bg-amber-400" />
                60–79% o'rtacha
              </span>
              <span className="flex items-center gap-1.5 text-xs text-gray-400">
                <span className="inline-block w-2.5 h-1.5 rounded-full bg-red-500" />
                60%dan past
              </span>
            </div>
          </Card>
        </div>
      )}
    </>
  );
};

export default AttendanceCharts;
