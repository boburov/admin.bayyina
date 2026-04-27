import { useState } from "react";
import {
  AreaChart, Area,
  BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from "recharts";

import { useAppQuery } from "@/shared/lib/query/query-hooks";
import { statisticsAPI } from "@/features/statistics/api/statistics.api";
import {
  formatStatMonth,
  CHART_COLORS,
  TOOLTIP_STYLE,
} from "@/features/statistics/data/statistics.data";
import Card from "@/shared/components/ui/Card";
import { Skeleton } from "@/shared/components/shadcn/skeleton";

import {
  Activity, CheckCircle2, XCircle, Calendar,
  Users, BarChart2, TrendingUp, Info
} from "lucide-react";

const GRID = { stroke: "#F3F4F6", strokeDasharray: "3 3" };
const TICK = { fontSize: 11, fill: "#9CA3AF" };
const TT = TOOLTIP_STYLE;

const PRESETS = [
  { label: "Bu oy", getDates: () => { const n = new Date(); return { startDate: `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}-01`, endDate: "" }; } },
  { label: "30 kun", getDates: () => { const e = new Date(); const s = new Date(); s.setDate(s.getDate() - 29); return { startDate: toISO(s), endDate: toISO(e) }; } },
  { label: "6 oy", getDates: () => { const e = new Date(); const s = new Date(); s.setMonth(s.getMonth() - 5); s.setDate(1); return { startDate: toISO(s), endDate: "" }; } },
  { label: "Hammasi", getDates: () => ({ startDate: "", endDate: "" }) },
];

const toISO = (d) => d.toISOString().slice(0, 10);

const CardLoader = ({ h = 200 }) => (
  <div className="flex items-center justify-center" style={{ height: h }}>
    <div className="w-6 h-6 rounded-full border-2 border-gray-200 border-t-brown-800 animate-spin" />
  </div>
);

const Empty = ({ text = "Ma'lumot yo'q" }) => (
  <div className="flex flex-col items-center justify-center gap-2 py-10">
    <BarChart2 size={28} className="text-gray-200" strokeWidth={1.5} />
    <p className="text-xs text-gray-400">{text}</p>
  </div>
);

const KpiCard = ({ label, value, sub, icon: Icon, color = "brown", loading }) => {
  const configs = {
    brown: { bg: "bg-brown-50", val: "text-brown-800", icon: "text-brown-700" },
    blue: { bg: "bg-blue-50", val: "text-blue-700", icon: "text-blue-500" },
    green: { bg: "bg-green-50", val: "text-green-700", icon: "text-green-500" },
    red: { bg: "bg-red-50", val: "text-red-700", icon: "text-red-500" },
    purple: { bg: "bg-purple-50", val: "text-purple-700", icon: "text-purple-500" },
  };
  const c = configs[color] || configs.brown;

  return (
    <Card className="flex items-center gap-4 !py-4">
      <div className={`${c.bg} ${c.icon} p-3 rounded-sm shrink-0`}>
        <Icon size={20} strokeWidth={1.5} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-gray-500 truncate">{label}</p>
        {loading ? (
          <Skeleton className="h-7 w-28 mt-1" />
        ) : (
          <p className={`text-2xl font-bold leading-tight mt-0.5 ${c.val}`}>{value}</p>
        )}
        {sub && !loading && <p className="text-xs text-gray-400 mt-0.5 truncate">{sub}</p>}
      </div>
    </Card>
  );
};

const DateFilter = ({ value, onChange }) => {
  const [active, setActive] = useState(3);
  const apply = (idx, preset) => {
    setActive(idx);
    onChange(preset.getDates());
  };
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex gap-1 border border-gray-200 rounded-md p-0.5">
        {PRESETS.map((p, i) => (
          <button
            key={p.label}
            onClick={() => apply(i, p)}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${active === i ? "bg-gray-900 text-white" : "text-gray-500 hover:text-gray-800"
              }`}
          >
            {p.label}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <input
          type="date"
          value={value.startDate}
          onChange={(e) => { setActive(-1); onChange({ ...value, startDate: e.target.value }); }}
          className="h-8 px-2.5 text-xs border border-gray-200 rounded-md bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-300"
        />
        <span className="text-xs text-gray-400">—</span>
        <input
          type="date"
          value={value.endDate}
          onChange={(e) => { setActive(-1); onChange({ ...value, endDate: e.target.value }); }}
          className="h-8 px-2.5 text-xs border border-gray-200 rounded-md bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-300"
        />
      </div>
    </div>
  );
};

const AttendanceDashboardPage = () => {
  const [dateRange, setDateRange] = useState({ startDate: "", endDate: "" });

  const params = {
    ...(dateRange.startDate && { startDate: dateRange.startDate }),
    ...(dateRange.endDate && { endDate: dateRange.endDate }),
  };

  const { data: attendance, isLoading: al } = useAppQuery({
    queryKey: ["statistics", "attendance", params],
    queryFn: () => statisticsAPI.getAttendance(params),
    select: (r) => r.data,
    staleTime: 60_000,
  });

  const attTrend = (attendance?.monthlyTrend ?? []).map((d) => ({
    label: formatStatMonth(d),
    present: d.present,
    absent: (d.total ?? 0) - (d.present ?? 0),
    rate: d.attendanceRate,
  }));

  const byGroup = [...(attendance?.byGroup ?? [])].sort((a, b) => b.attendanceRate - a.attendanceRate);
  
  const overall = attendance?.overall ?? { total: 0, present: 0, absent: 0, attendanceRate: 0 };

  const donutData = [
    { name: "Qatnashgan", value: overall.present, color: CHART_COLORS.green },
    { name: "Qatnashmagan", value: overall.absent, color: CHART_COLORS.red },
  ];

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Davomat statistikasi</h1>
          <p className="text-sm text-gray-400 mt-0.5">O'quvchilar davomati tahlili va ko'rsatkichlari</p>
        </div>
        <DateFilter value={dateRange} onChange={setDateRange} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard loading={al} label="Jami darslar" value={overall.total} icon={Calendar} color="blue" />
        <KpiCard loading={al} label="Qatnashgan" value={overall.present} icon={CheckCircle2} color="green" />
        <KpiCard loading={al} label="Qatnashmagan" value={overall.absent} icon={XCircle} color="red" />
        <KpiCard loading={al} label="O'rtacha davomat" value={`${overall.attendanceRate}%`} icon={Activity} color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Oylik davomat tendensiyasi" className="lg:col-span-2 h-80">
          {al ? <CardLoader h={250} /> : !attTrend.length ? <Empty /> : (
            <>
              <div className="flex items-center gap-4 mb-3">
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <span className="inline-block w-3 h-0.5 rounded" style={{ background: CHART_COLORS.green }} />
                  Qatnashgan
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <span className="inline-block w-3 h-0.5 rounded" style={{ background: CHART_COLORS.red }} />
                  Qatnashmagan
                </div>
              </div>
              <ResponsiveContainer width="100%" height="85%">
                <AreaChart data={attTrend} margin={{ top: 4, right: 16, left: -4, bottom: 28 }}>
                  <defs>
                    <linearGradient id="presentGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={CHART_COLORS.green} stopOpacity={0.15} />
                      <stop offset="100%" stopColor={CHART_COLORS.green} stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="absentGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={CHART_COLORS.red} stopOpacity={0.12} />
                      <stop offset="100%" stopColor={CHART_COLORS.red} stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} {...GRID} />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} dy={10} tick={TICK} />
                  <YAxis axisLine={false} tickLine={false} tick={TICK} allowDecimals={false} />
                  <Tooltip contentStyle={TT.contentStyle} labelStyle={TT.labelStyle}
                    cursor={{ stroke: "#E5E7EB", strokeWidth: 1 }}
                    formatter={(v, n) => [v, n === "present" ? "Qatnashgan" : "Qatnashmagan"]}
                  />
                  <Area type="monotone" dataKey="present" stroke={CHART_COLORS.green} fill="url(#presentGrad)"
                    strokeWidth={2.5} dot={false} activeDot={{ r: 5, strokeWidth: 2, stroke: "#fff" }} />
                  <Area type="monotone" dataKey="absent" stroke={CHART_COLORS.red} fill="url(#absentGrad)"
                    strokeWidth={2.5} dot={false} activeDot={{ r: 5, strokeWidth: 2, stroke: "#fff" }} />
                </AreaChart>
              </ResponsiveContainer>
            </>
          )}
        </Card>

        <Card title="Qatnashish nisbati" className="h-80">
          {al ? <CardLoader h={250} /> : (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="w-48 h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={donutData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {donutData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={TT.contentStyle} labelStyle={TT.labelStyle} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 space-y-2 w-full">
                {donutData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-gray-600">{item.name}</span>
                    </div>
                    <span className="font-bold text-gray-800">{item.value} ({overall.total > 0 ? Math.round(item.value / overall.total * 100) : 0}%)</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Guruhlar bo'yicha eng yaxshi davomat">
          {al ? <CardLoader h={300} /> : !byGroup.length ? <Empty /> : (
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              {byGroup.slice(0, 10).map((g, idx) => {
                const color = g.attendanceRate >= 85 ? CHART_COLORS.green
                  : g.attendanceRate >= 70 ? CHART_COLORS.amber
                  : CHART_COLORS.red;
                return (
                  <div key={g.groupId || idx} className="group">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xs font-bold text-gray-400 w-5">#{idx + 1}</span>
                        <span className="text-sm font-medium text-gray-700 truncate">{g.groupName || "Noma'lum guruh"}</span>
                      </div>
                      <span className="text-sm font-bold tabular-nums" style={{ color }}>{g.attendanceRate}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${g.attendanceRate}%`, background: color }} />
                    </div>
                    <div className="flex justify-between mt-1 text-[10px] text-gray-400">
                      <span>Jami darslar: {g.total}</span>
                      <span>Kelgan: {g.present}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        <Card title="Guruhlar bo'yicha eng past davomat">
          {al ? <CardLoader h={300} /> : !byGroup.length ? <Empty /> : (
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              {[...byGroup].reverse().slice(0, 10).map((g, idx) => {
                const color = g.attendanceRate >= 85 ? CHART_COLORS.green
                  : g.attendanceRate >= 70 ? CHART_COLORS.amber
                  : CHART_COLORS.red;
                return (
                  <div key={g.groupId || idx} className="group">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xs font-bold text-gray-400 w-5">#{idx + 1}</span>
                        <span className="text-sm font-medium text-gray-700 truncate">{g.groupName || "Noma'lum guruh"}</span>
                      </div>
                      <span className="text-sm font-bold tabular-nums" style={{ color }}>{g.attendanceRate}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${g.attendanceRate}%`, background: color }} />
                    </div>
                    <div className="flex justify-between mt-1 text-[10px] text-gray-400">
                      <span>Jami darslar: {g.total}</span>
                      <span>Kelgan: {g.present}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex gap-3">
        <Info className="text-blue-500 shrink-0" size={20} />
        <div className="text-xs text-blue-700 leading-relaxed">
          <p className="font-bold mb-1">Ma'lumot uchun:</p>
          Davomat statistikasi o'qituvchilar tomonidan belgilangan davomatlar asosida hisoblanadi. 
          Agar guruhda davomat belgilanmagan bo'lsa, u statistikada hisobga olinmaydi. 
          O'rtacha davomat = (Jami qatnashganlar / Jami darslar soni) * 100.
        </div>
      </div>
    </div>
  );
};

export default AttendanceDashboardPage;
