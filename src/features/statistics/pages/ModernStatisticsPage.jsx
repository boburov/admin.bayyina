import { useState, useMemo } from "react";
import {
  AreaChart, Area,
  LineChart, Line,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
  BarChart, Bar
} from "recharts";

// TanStack Query
import { useAppQuery } from "@/shared/lib/query/query-hooks";

// API
import { statisticsAPI } from "@/features/statistics/api/statistics.api";

// Data & Helpers
import {
  formatStatMonth,
  CHART_COLORS,
  GENDER_PIE_COLORS,
  ENROLLMENT_PIE_COLORS,
  PAYMENT_PIE_COLORS,
  LEAD_STATUS_COLORS,
  ENROLLMENT_STATUS_LABELS,
  LEAD_STATUS_LABELS,
  LEAD_STATUS_FUNNEL_ORDER,
  LEAD_STATUS_FUNNEL_COLORS,
  LEAD_EVENT_TYPE_LABELS,
  AGE_GROUP_COLORS,
  PAYMENT_STATUS_LABELS,
  GENDER_LABELS,
  formatMoney,
  formatMoneyFull,
  TOOLTIP_STYLE,
} from "@/features/statistics/data/statistics.data";

// Shared Components
import Card from "@/shared/components/ui/Card";
import { Skeleton } from "@/shared/components/shadcn/skeleton";

// Icons
import {
  GraduationCap, TrendingUp, Activity, Wallet,
  Users, UserPlus, CreditCard, CheckCircle2,
  XCircle, BarChart2, AlertCircle, Calendar,
  ArrowUpRight, Filter, Download, Info
} from "lucide-react";

// ─── Constants & Styles ───────────────────────────────────────────────────────

const GRID_STYLE = { stroke: "#F3F4F6", strokeDasharray: "3 3" };
const TICK_STYLE = { fontSize: 11, fill: "#9CA3AF", fontWeight: 500 };
const TT_STYLE = TOOLTIP_STYLE;

const PRESETS = [
  { label: "1 oy",  getDates: () => { const e = new Date(); const s = new Date(); s.setMonth(s.getMonth()-1); return { startDate: toISO(s), endDate: toISO(e) }; } },
  { label: "3 oy",  getDates: () => { const e = new Date(); const s = new Date(); s.setMonth(s.getMonth()-3); return { startDate: toISO(s), endDate: toISO(e) }; } },
  { label: "6 oy",  getDates: () => { const e = new Date(); const s = new Date(); s.setMonth(s.getMonth()-6); return { startDate: toISO(s), endDate: toISO(e) }; } },
  { label: "1 yil", getDates: () => { const e = new Date(); const s = new Date(); s.setFullYear(s.getFullYear()-1); return { startDate: toISO(s), endDate: toISO(e) }; } },
];

const toISO = (d) => d.toISOString().slice(0, 10);

// ─── Sub-Components ───────────────────────────────────────────────────────────

const SectionHeader = ({ icon: Icon, title, sub }) => (
  <div className="flex items-center gap-3 mb-5">
    <div className="w-1 h-5 bg-brown-800 shrink-0" />
    <div className="flex items-center gap-2">
      {Icon && <Icon size={15} className="text-brown-800" strokeWidth={1.5} />}
      <div>
        <h2 className="text-sm font-semibold text-gray-800">{title}</h2>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  </div>
);

const KPICard = ({ label, value, sub, icon: Icon, color = "brown", loading, trend }) => {
  const configs = {
    brown:  { bg: "bg-brown-50/50",  text: "text-brown-800", icon: "text-brown-600" },
    blue:   { bg: "bg-blue-50/50",   text: "text-blue-700",  icon: "text-blue-500"  },
    green:  { bg: "bg-green-50/50",  text: "text-green-700", icon: "text-green-500" },
    red:    { bg: "bg-red-50/50",    text: "text-red-700",   icon: "text-red-500"   },
    purple: { bg: "bg-purple-50/50", text: "text-purple-700",icon: "text-purple-500"},
    amber:  { bg: "bg-amber-50/50",  text: "text-amber-700", icon: "text-amber-500" },
  };
  const c = configs[color] ?? configs.brown;

  return (
    <div className="bg-white border border-border p-4 xs:p-5 flex items-center gap-4">
      <div className={`${c.bg} ${c.icon} p-3 shrink-0`}>
        <Icon size={20} strokeWidth={1.5} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-gray-500 truncate">{label}</p>
        {loading ? (
          <Skeleton className="h-7 w-28 mt-1" />
        ) : (
          <div className="flex items-baseline gap-2 mt-0.5">
            <p className={`text-2xl font-bold leading-tight ${c.text} tabular-nums`}>{value}</p>
            {trend && (
              <span className={`text-[10px] font-semibold px-1.5 py-0.5 ${trend > 0 ? 'bg-green-50/70 text-green-600' : 'bg-red-50/70 text-red-600'}`}>
                {trend > 0 ? '+' : ''}{trend}%
              </span>
            )}
          </div>
        )}
        {sub && !loading && <p className="text-xs text-gray-400 mt-0.5 truncate">{sub}</p>}
      </div>
    </div>
  );
};

const CardLoader = ({ h = 200 }) => (
  <div className="flex items-center justify-center" style={{ height: h }}>
    <div className="w-6 h-6 border-2 border-gray-200 border-t-brown-800 rounded-full animate-spin" />
  </div>
);

const EmptyState = ({ text = "Ma'lumot mavjud emas" }) => (
  <div className="flex flex-col items-center justify-center gap-2 py-10">
    <BarChart2 size={28} className="text-gray-200" strokeWidth={1.5} />
    <p className="text-xs text-gray-400">{text}</p>
  </div>
);

const ChartLegend = ({ items }) => (
  <div className="flex flex-wrap gap-4 mb-4">
    {items.map((item, i) => (
      <span key={i} className="flex items-center gap-1.5 text-xs text-gray-500">
        <span className="inline-block w-3 h-0.5" style={{ background: item.color }} />
        {item.label}
      </span>
    ))}
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const UZ_MONTHS_SHORT = ["Yan","Fev","Mar","Apr","May","Iyn","Iyl","Avg","Sen","Okt","Noy","Dek"];

const ModernStatisticsPage = () => {
  const [dateRange, setDateRange] = useState(PRESETS[0].getDates());
  const [activePreset, setActivePreset] = useState(0);
  const [activityDays, setActivityDays] = useState(30);

  const params = useMemo(() => ({
    ...(dateRange.startDate && { startDate: dateRange.startDate }),
    ...(dateRange.endDate   && { endDate:   dateRange.endDate   }),
  }), [dateRange]);

  // Data Fetching
  const { data: overview, isLoading: ol } = useAppQuery({
    queryKey: ["statistics", "overview", params],
    queryFn:  () => statisticsAPI.getOverview(),
    select:   (r) => r.data,
    staleTime: 60_000,
  });

  const { data: leads, isLoading: ll } = useAppQuery({
    queryKey: ["statistics", "leads", params],
    queryFn:  () => statisticsAPI.getLeads(params),
    select:   (r) => r.data,
    staleTime: 60_000,
  });

  const { data: students, isLoading: sl } = useAppQuery({
    queryKey: ["statistics", "students", params],
    queryFn:  () => statisticsAPI.getStudents(params),
    select:   (r) => r.data,
    staleTime: 60_000,
  });

  const { data: revenue, isLoading: rl } = useAppQuery({
    queryKey: ["statistics", "revenue", params],
    queryFn:  () => statisticsAPI.getRevenue(params),
    select:   (r) => r.data,
    staleTime: 60_000,
  });

  const { data: attendance, isLoading: al } = useAppQuery({
    queryKey: ["statistics", "attendance", params],
    queryFn:  () => statisticsAPI.getAttendance(params),
    select:   (r) => r.data,
    staleTime: 60_000,
  });

  const { data: leadActivity, isLoading: lal } = useAppQuery({
    queryKey: ["statistics", "leadActivity", activityDays],
    queryFn:  () => statisticsAPI.getLeadActivity({ days: activityDays }),
    select:   (r) => r.data,
    staleTime: 60_000,
  });

  // Derived Data
  const leadTrend = useMemo(() => (leads?.monthlyTrend ?? []).map((d) => ({
    label: formatStatMonth(d),
    total: d.total,
    converted: d.converted,
  })), [leads]);

  const leadStatusData = useMemo(() => (leads?.byStatus ?? []).map((s) => ({
    name: LEAD_STATUS_LABELS[s.status] ?? s.status,
    value: s.count,
  })), [leads]);

  const genderData = useMemo(() => (students?.genderDistribution ?? []).map((g) => ({
    name: GENDER_LABELS[g.gender] ?? g.gender,
    value: g.count,
  })), [students]);

  const revenueTrend = useMemo(() => (revenue?.monthlyRevenue ?? []).map((d) => ({
    label: formatStatMonth(d),
    amount: d.collected,
  })), [revenue]);

  const attendanceTrend = useMemo(() => (attendance?.monthlyTrend ?? []).map((d) => ({
    label: formatStatMonth(d),
    rate: d.attendanceRate,
    present: d.present,
    absent: (d.total ?? 0) - (d.present ?? 0),
  })), [attendance]);

  const attendanceDonut = useMemo(() => attendance?.overall ? [
    { name: "Kelgan", value: attendance.overall.present },
    { name: "Kelmagan", value: attendance.overall.absent },
  ] : [], [attendance]);

  // Lead extended derived data
  const leadFunnel = useMemo(() =>
    LEAD_STATUS_FUNNEL_ORDER.map((s) => ({
      status: s,
      label:  LEAD_STATUS_LABELS[s] ?? s,
      count:  leads?.byStatus?.find((b) => b.status === s)?.count ?? 0,
      color:  LEAD_STATUS_FUNNEL_COLORS[s],
    })), [leads]);

  const maxFunnelCount = useMemo(() =>
    Math.max(...leadFunnel.map((f) => f.count), 1), [leadFunnel]);

  const activityTrend = useMemo(() =>
    (leadActivity?.dailyActivity ?? []).map((d) => {
      const [, m, day] = d.date.split("-");
      return { label: `${parseInt(day)} ${UZ_MONTHS_SHORT[parseInt(m) - 1]}`, count: d.count };
    }), [leadActivity]);

  const totalActivity = useMemo(() =>
    (leadActivity?.dailyActivity ?? []).reduce((s, d) => s + d.count, 0), [leadActivity]);

  const sourceBarData = useMemo(() =>
    [...(leads?.bySource ?? [])].sort((a, b) => b.count - a.count).slice(0, 8), [leads]);

  const applyPreset = (idx, preset) => {
    setActivePreset(idx);
    setDateRange(preset.getDates());
  };

  return (
    <div className="space-y-10 pb-12">

      {/* ── Dashboard Header ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Statistika</h1>
          <p className="text-sm text-gray-400 mt-0.5">Barcha ko'rsatkichlar bir joyda</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex gap-1 border border-gray-200 p-0.5">
            {PRESETS.map((p, i) => (
              <button key={p.label} onClick={() => applyPreset(i, p)}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                  activePreset === i ? "bg-gray-900 text-white" : "text-gray-500 hover:text-gray-800"
                }`}>
                {p.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 border border-gray-200 px-3 h-8">
            <Calendar size={13} className="text-gray-400" />
            <input type="date" value={dateRange.startDate}
              onChange={(e) => { setActivePreset(-1); setDateRange(prev => ({ ...prev, startDate: e.target.value })); }}
              className="text-xs text-gray-600 focus:outline-none bg-transparent" />
            <span className="text-gray-300 text-xs">—</span>
            <input type="date" value={dateRange.endDate}
              onChange={(e) => { setActivePreset(-1); setDateRange(prev => ({ ...prev, endDate: e.target.value })); }}
              className="text-xs text-gray-600 focus:outline-none bg-transparent" />
          </div>
        </div>
      </div>

      {/* ── Section 1: Top Overview ──────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard loading={ol} label="Jami Murojaatlar" value={overview?.totalLeads ?? 0} icon={UserPlus} color="blue" />
        <KPICard loading={ol} label="O'quvchilar Soni" value={overview?.totalActiveStudents ?? 0} icon={GraduationCap} color="brown" />
        <KPICard loading={ol} label="Oylik Daromad" value={formatMoneyFull(overview?.revenueThisMonth)} icon={Wallet} color="green" sub="Bu oydagi tushum" />
        <KPICard loading={ol} label="O'rtacha Davomat" value={`${overview?.attendanceRateThisMonth ?? 0}%`} icon={Activity} color="purple" sub="Hozirgi oy bo'yicha" />
      </div>

      {/* ── Section 2: Leads & Conversions ────────────────────────────── */}
      <div className="space-y-4">
        <SectionHeader icon={UserPlus} title="Lidlar Analitikasi" sub="Murojaatlar dinamikasi va konversiya ko'rsatkichlari" />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2  !p-4 xs:!p-5 border-border">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-sm font-semibold text-gray-800 ">Murojaatlar Trendi</h3>
              <div className="flex items-center gap-1.5 text-[10px] font-medium text-purple-600 bg-purple-50/60 border border-purple-100 px-2 py-1">
                <ArrowUpRight size={10} />
                {leads?.conversionRate ?? 0}% Konversiya
              </div>
            </div>
            <ChartLegend items={[
              { label: "Jami Lidlar", color: CHART_COLORS.blue },
              { label: "Qabul qilingan", color: CHART_COLORS.green }
            ]} />
            
            <div className="h-[280px] w-full mt-4">
              {ll ? <CardLoader h={280} /> : !leadTrend.length ? <EmptyState /> : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={leadTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={CHART_COLORS.blue} stopOpacity={0.1}/>
                        <stop offset="95%" stopColor={CHART_COLORS.blue} stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorConv" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={CHART_COLORS.green} stopOpacity={0.1}/>
                        <stop offset="95%" stopColor={CHART_COLORS.green} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} {...GRID_STYLE} />
                    <XAxis dataKey="label" axisLine={false} tickLine={false} tick={TICK_STYLE} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={TICK_STYLE} />
                    <Tooltip {...TT_STYLE} />
                    <Area type="monotone" dataKey="total" stroke={CHART_COLORS.blue} strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
                    <Area type="monotone" dataKey="converted" stroke={CHART_COLORS.green} strokeWidth={3} fillOpacity={1} fill="url(#colorConv)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>

          <Card className="!p-4 xs:!p-5 border-border flex flex-col justify-between">
            <h3 className="text-sm font-semibold text-gray-800  mb-4">Holatlar Taqsimoti</h3>
            <div className="h-[240px] w-full flex items-center justify-center">
              {ll ? <CardLoader h={240} /> : !leadStatusData.length ? <EmptyState /> : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={leadStatusData}
                      innerRadius={65}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {leadStatusData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={LEAD_STATUS_COLORS[index % LEAD_STATUS_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip {...TT_STYLE} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {leadStatusData.slice(0, 4).map((item, i) => (
                <div key={i} className="flex flex-col p-2 bg-gray-50 border border-border">
                  <span className="text-[9px] font-medium text-gray-500 leading-none mb-1.5">{item.name}</span>
                  <span className="text-sm font-semibold text-gray-700">{item.value}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* ── Section 2b: Sotuvlar Tahlili ─────────────────────────────── */}
      <div className="space-y-4">
        <SectionHeader icon={BarChart2} title="Sotuvlar Tahlili" sub="Holat funeli, kurs turi, yosh, manba va jins bo'yicha" />

        {/* Status funnel — clean rectangular KPI row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {ll
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white border border-border p-4 animate-pulse">
                  <div className="h-3 w-16 bg-gray-100 rounded mb-3" />
                  <div className="h-7 w-10 bg-gray-100 rounded" />
                </div>
              ))
            : leadFunnel.map((item) => (
                <div key={item.status} className="bg-white border border-border p-4 flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 shrink-0" style={{ background: item.color }} />
                    <span className="text-[11px] font-medium text-gray-500 truncate">{item.label}</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-800 tabular-nums leading-none">{item.count}</p>
                  <div className="h-1 bg-gray-100 overflow-hidden">
                    <div className="h-full transition-all duration-700"
                      style={{ width: `${maxFunnelCount > 0 ? Math.max(Math.round((item.count / maxFunnelCount) * 100), item.count > 0 ? 4 : 0) : 0}%`, background: item.color }} />
                  </div>
                </div>
              ))
          }
        </div>

        {/* Course type + Age groups */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white border border-border p-4 xs:p-5">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-5">Kurs Turi Bo'yicha</h3>
            {ll ? <CardLoader h={200} /> : !(leads?.byCourseType?.length) ? <EmptyState /> : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={leads.byCourseType} layout="vertical"
                  margin={{ top: 0, right: 36, left: 0, bottom: 0 }}>
                  <CartesianGrid horizontal={false} {...GRID_STYLE} />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={TICK_STYLE} allowDecimals={false} />
                  <YAxis type="category" dataKey="course" axisLine={false} tickLine={false}
                    tick={{ fontSize: 11, fill: "#6B7280", fontWeight: 600 }} width={100} />
                  <Tooltip {...TT_STYLE} formatter={(v) => [v, "Murojaat"]} />
                  <Bar dataKey="count" fill={CHART_COLORS.blue} radius={0} maxBarSize={16}
                    label={{ position: "right", fontSize: 10, fill: "#9CA3AF", fontWeight: 600 }} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="bg-white border border-border p-4 xs:p-5">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-5">Yosh Guruhlari</h3>
            {ll ? <CardLoader h={200} /> : !(leads?.byAgeGroup?.some(g => g.count > 0)) ? <EmptyState /> : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={leads.byAgeGroup} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid vertical={false} {...GRID_STYLE} />
                  <XAxis dataKey="ageGroup" axisLine={false} tickLine={false} dy={10} tick={TICK_STYLE} />
                  <YAxis axisLine={false} tickLine={false} tick={TICK_STYLE} allowDecimals={false} />
                  <Tooltip {...TT_STYLE} formatter={(v) => [v, "Murojaat"]} />
                  <Bar dataKey="count" radius={0} maxBarSize={64}>
                    {(leads?.byAgeGroup ?? []).map((_, i) => (
                      <Cell key={i} fill={AGE_GROUP_COLORS[i % AGE_GROUP_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Source + Gender */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-white border border-border p-4 xs:p-5">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-5">Manba Bo'yicha</h3>
            {ll ? <CardLoader h={200} /> : !sourceBarData.length ? <EmptyState /> : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={sourceBarData} layout="vertical"
                  margin={{ top: 0, right: 36, left: 0, bottom: 0 }}>
                  <CartesianGrid horizontal={false} {...GRID_STYLE} />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={TICK_STYLE} allowDecimals={false} />
                  <YAxis type="category" dataKey="source" axisLine={false} tickLine={false}
                    tick={{ fontSize: 11, fill: "#6B7280", fontWeight: 600 }} width={100} />
                  <Tooltip {...TT_STYLE} formatter={(v) => [v, "Murojaat"]} />
                  <Bar dataKey="count" fill={CHART_COLORS.teal} radius={0} maxBarSize={16}
                    label={{ position: "right", fontSize: 10, fill: "#9CA3AF", fontWeight: 600 }} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="bg-white border border-border p-4 xs:p-5">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Jins Taqsimoti</h3>
            <div className="h-[160px]">
              {ll ? <CardLoader h={160} /> : !(leads?.byGender?.length) ? <EmptyState /> : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={(leads.byGender ?? []).map(g => ({ name: GENDER_LABELS[g.gender] ?? g.gender, value: g.count }))}
                      innerRadius={48} outerRadius={68} paddingAngle={4} dataKey="value" stroke="none">
                      {(leads?.byGender ?? []).map((_, i) => (
                        <Cell key={i} fill={GENDER_PIE_COLORS[i % GENDER_PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip {...TT_STYLE} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="flex justify-center gap-4 mt-2">
              {(leads?.byGender ?? []).map((g, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <div className="w-2 h-2" style={{ background: GENDER_PIE_COLORS[i] }} />
                  <span className="text-[10px] font-medium text-gray-500">
                    {GENDER_LABELS[g.gender] ?? g.gender}: {g.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Rejection reasons (conditional) */}
        {(leads?.byRejectionReason?.length > 0) && (
          <div className="bg-white border border-border p-4 xs:p-5">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-5">Rad Etish Sabablari</h3>
            <ResponsiveContainer width="100%" height={Math.min(leads.byRejectionReason.length * 40 + 16, 220)}>
              <BarChart data={leads.byRejectionReason} layout="vertical"
                margin={{ top: 0, right: 36, left: 0, bottom: 0 }}>
                <CartesianGrid horizontal={false} {...GRID_STYLE} />
                <XAxis type="number" axisLine={false} tickLine={false} tick={TICK_STYLE} allowDecimals={false} />
                <YAxis type="category" dataKey="reason" axisLine={false} tickLine={false}
                  tick={{ fontSize: 11, fill: "#6B7280", fontWeight: 600 }} width={140} />
                <Tooltip {...TT_STYLE} formatter={(v) => [v, "Murojaat"]} />
                <Bar dataKey="count" fill={CHART_COLORS.red} radius={0} maxBarSize={16}
                  label={{ position: "right", fontSize: 10, fill: "#9CA3AF", fontWeight: 600 }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* ── Section 2c: Lead Activity ─────────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <SectionHeader icon={Activity} title="Faollik Tahlili" sub="Murojaatlar bo'yicha harakatlar tarixi" />
          <div className="flex bg-gray-50 p-1 border border-border -mt-6">
            {[7, 14, 30].map((d) => (
              <button key={d} onClick={() => setActivityDays(d)}
                className={`px-3 py-1.5 text-[11px] font-medium transition-all ${
                  activityDays === d
                    ? "bg-white text-gray-900 border border-border"
                    : "text-gray-400 hover:text-gray-600"
                }`}>
                {d} kun
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Activity area chart */}
          <Card className="lg:col-span-2 !p-4 xs:!p-5 border-border">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xs font-medium text-gray-500 ">
                So'nggi {activityDays} kun
              </h3>
              <span className="text-[10px] font-medium text-blue-600 bg-blue-50/60 border border-blue-100 px-2 py-1">
                {totalActivity} ta harakat
              </span>
            </div>
            <div className="h-[200px]">
              {lal ? <CardLoader h={200} /> : !activityTrend.length ? <EmptyState /> : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={activityTrend} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="actGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor={CHART_COLORS.blue} stopOpacity={0.12} />
                        <stop offset="95%" stopColor={CHART_COLORS.blue} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} {...GRID_STYLE} />
                    <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#9CA3AF", fontWeight: 600 }}
                      dy={10} interval={activityDays <= 14 ? 1 : Math.floor(activityDays / 7)} />
                    <YAxis axisLine={false} tickLine={false} tick={TICK_STYLE} allowDecimals={false} />
                    <Tooltip {...TT_STYLE} formatter={(v) => [v, "Harakat"]} />
                    <Area type="monotone" dataKey="count" stroke={CHART_COLORS.blue} strokeWidth={2.5}
                      fill="url(#actGrad)" dot={false} activeDot={{ r: 4, strokeWidth: 2, stroke: "#fff" }} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>

          {/* Event type freq */}
          <Card className="!p-4 xs:!p-5 border-border">
            <h3 className="text-xs font-medium text-gray-500 mb-5">Harakat Turlari</h3>
            {lal ? <CardLoader h={180} /> : !(leadActivity?.byEventType?.length) ? <EmptyState /> : (
              <div className="space-y-4">
                {leadActivity.byEventType.map((e) => {
                  const max = leadActivity.byEventType[0]?.count || 1;
                  const pct = Math.round((e.count / max) * 100);
                  return (
                    <div key={e.eventType}>
                      <div className="flex justify-between mb-1.5">
                        <span className="text-[11px] font-medium text-gray-600 truncate flex-1 pr-2">
                          {LEAD_EVENT_TYPE_LABELS[e.eventType] ?? e.eventType}
                        </span>
                        <span className="text-[11px] font-semibold text-gray-800 tabular-nums shrink-0">{e.count}</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 overflow-hidden">
                        <div className="h-full bg-blue-500/80 transition-all duration-700"
                          style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Status transitions */}
        {(leadActivity?.statusTransitions?.length > 0) && (
          <Card className="!p-4 xs:!p-5 border-border">
            <h3 className="text-xs font-medium text-gray-500 mb-4">Holat O'tish Zanjiri</h3>
            <div className="flex flex-wrap gap-2">
              {leadActivity.statusTransitions.map((t, i) => (
                <div key={i} className="flex items-center gap-2 bg-gray-50 border border-border px-3 py-2">
                  <span className="text-[11px] font-medium px-2 py-0.5"
                    style={{ background: LEAD_STATUS_FUNNEL_COLORS[t.from] + "15", color: LEAD_STATUS_FUNNEL_COLORS[t.from] }}>
                    {LEAD_STATUS_LABELS[t.from] ?? t.from}
                  </span>
                  <span className="text-gray-300 text-xs">→</span>
                  <span className="text-[11px] font-medium px-2 py-0.5"
                    style={{ background: LEAD_STATUS_FUNNEL_COLORS[t.to] + "15", color: LEAD_STATUS_FUNNEL_COLORS[t.to] }}>
                    {LEAD_STATUS_LABELS[t.to] ?? t.to}
                  </span>
                  <span className="text-sm font-semibold text-gray-700 ml-1 tabular-nums">{t.count}</span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* ── Section 3: Revenue Analytics ─────────────────────────────── */}
      <div className="space-y-4">
        <SectionHeader icon={TrendingUp} title="Moliyaviy Ko'rsatkichlar" sub="Oylik tushumlar va to'lovlar dinamikasi" />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2 !p-4 xs:!p-5 border-border">
            <h3 className="text-sm font-semibold text-gray-800  mb-5">Daromad Grafigi</h3>
            <div className="h-[300px] w-full">
              {rl ? <CardLoader h={300} /> : !revenueTrend.length ? <EmptyState /> : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueTrend} margin={{ top: 0, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid vertical={false} {...GRID_STYLE} />
                    <XAxis dataKey="label" axisLine={false} tickLine={false} tick={TICK_STYLE} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={TICK_STYLE} tickFormatter={formatMoney} />
                    <Tooltip {...TT_STYLE} formatter={(v) => formatMoneyFull(v)} />
                    <Bar dataKey="amount" fill={CHART_COLORS.green} radius={0} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>

          <div className="space-y-4">
            <Card className="!p-4 xs:!p-5 border-border bg-brown-800 text-white">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-white/10 text-white/80">
                  <Info size={18} />
                </div>
                <span className="text-[10px] font-medium text-white/40">Kutilmoqda</span>
              </div>
              <p className="text-xs font-medium text-white/60 mb-1">Taxminiy oylik tushum</p>
              <h4 className="text-2xl font-semibold tabular-nums">{formatMoneyFull(revenue?.expectedMonthlyRevenue)}</h4>
              <div className="mt-6 pt-6 border-t border-white/10 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-medium text-white/40">Jami yig'ilgan</p>
                  <p className="text-sm font-semibold tabular-nums">{formatMoneyFull(revenue?.totalCollected)}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-medium text-white/40">To'lovlar soni</p>
                  <p className="text-sm font-semibold tabular-nums">{revenue?.totalPaymentsCount ?? 0}</p>
                </div>
              </div>
            </Card>

            <Card className="!p-4 xs:!p-5 border-border">
              <h3 className="text-sm font-semibold text-gray-800  mb-4">Qarzlar miqdori</h3>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-50 text-red-500 flex items-center justify-center shrink-0">
                  <AlertCircle size={24} strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-600 tabular-nums leading-none mb-1">
                    {formatMoneyFull(revenue?.totalOutstandingDebt)}
                  </p>
                  <p className="text-[10px] font-medium text-gray-500">Umumiy qarzdorlik</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* ── Section 4: Students & Attendance ─────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-6">
        
        {/* Student Demographics */}
        <div className="space-y-4">
          <SectionHeader icon={Users} title="O'quvchilar tarkibi" sub="Jins va guruhlar bo'yicha tahlil" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="!p-4 xs:!p-5 border-border ">
              <h3 className="text-xs font-medium text-gray-500 mb-4">Jins taqsimoti</h3>
              <div className="h-[180px]">
                {sl ? <CardLoader h={180} /> : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={genderData}
                        innerRadius={50}
                        outerRadius={70}
                        dataKey="value"
                        stroke="none"
                      >
                        {genderData.map((_, index) => (
                          <Cell key={index} fill={GENDER_PIE_COLORS[index % GENDER_PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip {...TT_STYLE} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
              <div className="flex justify-center gap-4 mt-2">
                {genderData.map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: GENDER_PIE_COLORS[i] }} />
                    <span className="text-[10px] font-medium text-gray-600">{item.name}: {item.value}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="!p-4 xs:!p-5 border-border max-h-[300px] overflow-hidden">
              <h3 className="text-xs font-medium text-gray-500 mb-4">Guruhlar hajmi</h3>
              <div className="space-y-3 overflow-y-auto max-h-[200px] pr-2 custom-scrollbar">
                {students?.studentsPerGroup?.slice(0, 8).map((g, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-600 truncate max-w-[120px]">{g.groupName}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-1.5 bg-gray-100 overflow-hidden">
                        <div
                          className="h-full bg-brown-400/70"
                          style={{ width: `${Math.min((g.studentCount / 20) * 100, 100)}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-semibold text-gray-700 tabular-nums">{g.studentCount}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        {/* Attendance Insights */}
        <div className="space-y-4">
          <SectionHeader icon={Activity} title="Davomat Ko'rsatkichlari" sub="Darslarda qatnashish trendi" />
          <Card className="!p-4 xs:!p-5 border-border ">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xs font-medium text-gray-500 ">Oylik Davomat %</h3>
              <div className="text-xl font-bold text-purple-600">{attendance?.overall?.attendanceRate ?? 0}%</div>
            </div>
            <div className="h-[200px]">
              {al ? <CardLoader h={200} /> : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={attendanceTrend} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <CartesianGrid vertical={false} {...GRID_STYLE} />
                    <XAxis dataKey="label" axisLine={false} tickLine={false} tick={TICK_STYLE} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={TICK_STYLE} />
                    <Tooltip {...TT_STYLE} />
                    <Line 
                      type="stepAfter" 
                      dataKey="rate" 
                      stroke={CHART_COLORS.purple} 
                      strokeWidth={3} 
                      dot={{ r: 4, fill: CHART_COLORS.purple, strokeWidth: 2, stroke: "#fff" }} 
                      activeDot={{ r: 6 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>
        </div>

      </div>

    </div>
  );
};

export default ModernStatisticsPage;
