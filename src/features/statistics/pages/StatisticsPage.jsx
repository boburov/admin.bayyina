import { useState } from "react";

import {
  AreaChart, Area,
  BarChart, Bar,
  LineChart, Line,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from "recharts";

import { useAppQuery } from "@/shared/lib/query/query-hooks";
import { statisticsAPI } from "@/features/statistics/api/statistics.api";
import {
  formatStatMonth,
  CHART_COLORS,
  GENDER_PIE_COLORS,
  ENROLLMENT_PIE_COLORS,
  LEAD_STATUS_COLORS,
  ENROLLMENT_STATUS_LABELS,
  LEAD_STATUS_LABELS,
  LEAD_STATUS_FUNNEL_ORDER,
  LEAD_STATUS_FUNNEL_COLORS,
  LEAD_EVENT_TYPE_LABELS,
  AGE_GROUP_COLORS,
  GENDER_LABELS,
  formatMoneyFull,
  TOOLTIP_STYLE,
} from "@/features/statistics/data/statistics.data";
import Card from "@/shared/components/ui/Card";
import { Skeleton } from "@/shared/components/shadcn/skeleton";
import DashboardCharts from "@/features/dashboard/components/DashboardCharts";

import {
  GraduationCap, TrendingUp, Activity, Wallet,
  Users, UserPlus, CreditCard, CheckCircle2,
  XCircle, BarChart2, AlertCircle, Calendar,
  ArrowUpRight, BookOpen, LogOut, Banknote,
} from "lucide-react";

// ─── constants ────────────────────────────────────────────────────────────────

const GRID  = { stroke: "#F3F4F6", strokeDasharray: "3 3" };
const TICK  = { fontSize: 11, fill: "#9CA3AF" };
const TT    = TOOLTIP_STYLE;

const AGE_BUCKET_COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#f97316", "#8b5cf6"];
const UZ_MONTHS = ["Yan","Fev","Mar","Apr","May","Iyn","Iyl","Avg","Sen","Okt","Noy","Dek"];

const DROPOUT_PERIOD_OPTIONS = [
  { value: "1m", label: "1 oy" },
  { value: "3m", label: "3 oy" },
  { value: "6m", label: "6 oy" },
  { value: "1y", label: "1 yil" },
];

const PRESETS = [
  { label: "Bu oy",    getDates: () => { const n = new Date(); return { startDate: `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,"0")}-01`, endDate: "" }; } },
  { label: "30 kun",   getDates: () => { const e = new Date(); const s = new Date(); s.setDate(s.getDate()-29); return { startDate: toISO(s), endDate: toISO(e) }; } },
  { label: "6 oy",     getDates: () => { const e = new Date(); const s = new Date(); s.setMonth(s.getMonth()-5); s.setDate(1); return { startDate: toISO(s), endDate: "" }; } },
  { label: "Hammasi",  getDates: () => ({ startDate: "", endDate: "" }) },
];

const toISO = (d) => d.toISOString().slice(0, 10);

// ─── shared UI ────────────────────────────────────────────────────────────────

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

const SecHeader = ({ icon: Icon, title, sub }) => (
  <div className="flex items-center gap-3 mb-5">
    <div className="w-1 h-5 bg-brown-800 rounded-full shrink-0" />
    <div>
      <div className="flex items-center gap-1.5">
        {Icon && <Icon size={15} className="text-brown-800" strokeWidth={1.5} />}
        <h2 className="text-sm font-semibold text-gray-800">{title}</h2>
      </div>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  </div>
);

// ─── KPI card ─────────────────────────────────────────────────────────────────

const KPI_CFG = {
  brown:  { bg: "bg-brown-50",  val: "text-brown-800",  icon: "text-brown-700"  },
  blue:   { bg: "bg-blue-50",   val: "text-blue-700",   icon: "text-blue-500"   },
  green:  { bg: "bg-green-50",  val: "text-green-700",  icon: "text-green-500"  },
  red:    { bg: "bg-red-50",    val: "text-red-700",    icon: "text-red-500"    },
  purple: { bg: "bg-purple-50", val: "text-purple-700", icon: "text-purple-500" },
  amber:  { bg: "bg-amber-50",  val: "text-amber-700",  icon: "text-amber-500"  },
};

const KpiCard = ({ label, value, sub, icon: Icon, color = "brown", loading }) => {
  const c = KPI_CFG[color] ?? KPI_CFG.brown;
  return (
    <Card className="flex items-center gap-4 !py-4">
      <div className={`${c.bg} ${c.icon} p-3 rounded-sm shrink-0`}>
        <Icon size={20} strokeWidth={1.5} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-gray-500 truncate">{label}</p>
        {loading
          ? <Skeleton className="h-7 w-28 mt-1" />
          : <p className={`text-2xl font-bold leading-tight mt-0.5 ${c.val}`}>{value}</p>
        }
        {sub && !loading && <p className="text-xs text-gray-400 mt-0.5 truncate">{sub}</p>}
      </div>
    </Card>
  );
};

// ─── Donut ────────────────────────────────────────────────────────────────────

const Donut = ({ data, total, colors, labelMap, loading }) => {
  if (loading) return <CardLoader h={180} />;
  if (!data?.length) return <Empty />;
  return (
    <div className="flex items-center gap-5">
      <div className="w-32 h-32 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" cx="50%" cy="50%"
              innerRadius="48%" outerRadius="78%" paddingAngle={2} strokeWidth={2} stroke="#fff">
              {data.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
            </Pie>
            <Tooltip
              formatter={(v, _, p) => [v, labelMap?.[p.payload.key] ?? p.payload.name]}
              contentStyle={TT.contentStyle} labelStyle={TT.labelStyle}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="space-y-2 flex-1 min-w-0">
        {data.map((item, i) => {
          const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
          const name = labelMap?.[item.key] ?? item.name ?? item.key;
          return (
            <div key={i} className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: colors[i % colors.length] }} />
              <span className="text-xs text-gray-600 flex-1 truncate">{name}</span>
              <span className="text-xs font-semibold text-gray-800 tabular-nums">{item.value}</span>
              <span className="text-xs text-gray-400 w-8 text-right tabular-nums shrink-0">{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── Date filter ─────────────────────────────────────────────────────────────

const DateFilter = ({ value, onChange }) => {
  const [active, setActive] = useState(3); // default: "Hammasi"
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
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
              active === i ? "bg-gray-900 text-white" : "text-gray-500 hover:text-gray-800"
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

// ─── Page ─────────────────────────────────────────────────────────────────────

const StatisticsPage = () => {
  const [dateRange, setDateRange] = useState({ startDate: "", endDate: "" });
  const [dropoutPeriod, setDropoutPeriod] = useState("1y");
  const [activityDays, setActivityDays] = useState(30);
  const financeYear = new Date().getFullYear();

  const params = {
    ...(dateRange.startDate && { startDate: dateRange.startDate }),
    ...(dateRange.endDate   && { endDate:   dateRange.endDate   }),
  };

  const { data: overview,   isLoading: ol } = useAppQuery({
    queryKey: ["statistics", "overview", params],
    queryFn:  () => statisticsAPI.getOverview(),
    select:   (r) => r.data,
    staleTime: 60_000,
  });

  const { data: leads,      isLoading: ll } = useAppQuery({
    queryKey: ["statistics", "leads", params],
    queryFn:  () => statisticsAPI.getLeads(params),
    select:   (r) => r.data,
    staleTime: 60_000,
  });

  const { data: students,   isLoading: sl } = useAppQuery({
    queryKey: ["statistics", "students", params],
    queryFn:  () => statisticsAPI.getStudents(params),
    select:   (r) => r.data,
    staleTime: 60_000,
  });

  const { data: revenue,    isLoading: rl } = useAppQuery({
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

  const { data: courseAge, isLoading: cal } = useAppQuery({
    queryKey: ["statistics", "courseAge", params],
    queryFn:  () => statisticsAPI.getCourseAge(params),
    select:   (r) => r.data,
    staleTime: 60_000,
  });

  const { data: dropout, isLoading: dol } = useAppQuery({
    queryKey: ["statistics", "dropout", dropoutPeriod],
    queryFn:  () => statisticsAPI.getDropoutReasons({ period: dropoutPeriod }),
    select:   (r) => r.data,
    staleTime: 60_000,
  });

  const { data: finance, isLoading: fl } = useAppQuery({
    queryKey: ["statistics", "finance", financeYear],
    queryFn:  () => statisticsAPI.getFinance({ year: financeYear }),
    select:   (r) => r.data,
    staleTime: 60_000,
  });

  // ── derived data ────────────────────────────────────────────────────────────

  const leadTrend = (leads?.monthlyTrend ?? []).map((d) => ({
    label:     formatStatMonth(d),
    total:     d.total,
    converted: d.converted,
  }));

  const leadStatusDonut = (leads?.byStatus ?? []).map((s) => ({
    key:   s.status,
    name:  LEAD_STATUS_LABELS[s.status] ?? s.status,
    value: s.count,
  }));

  const genderDonut = (leads?.byGender ?? []).map((g) => ({
    key:   g.gender,
    name:  GENDER_LABELS[g.gender] ?? g.gender,
    value: g.count,
  }));

  const enrollDonut = (students?.enrollmentsByStatus ?? []).map((e) => ({
    key:   e.status,
    name:  ENROLLMENT_STATUS_LABELS[e.status] ?? e.status,
    value: e.count,
  }));

  const studentGenderDonut = (students?.genderDistribution ?? []).map((g) => ({
    key:   g.gender,
    name:  GENDER_LABELS[g.gender] ?? g.gender,
    value: g.count,
  }));

const attTrend = (attendance?.monthlyTrend ?? []).map((d) => ({
    label:   formatStatMonth(d),
    present: d.present,
    absent:  (d.total ?? 0) - (d.present ?? 0),
    rate:    d.attendanceRate,
  }));

  const attDonut = attendance?.overall
    ? [
        { key: "present", name: "Qatnashgan", value: attendance.overall.present },
        { key: "absent",  name: "Qatnashmagan", value: attendance.overall.absent },
      ]
    : [];

  const byGroup = [...(attendance?.byGroup ?? [])].sort((a, b) => b.attendanceRate - a.attendanceRate);
  const debt    = students?.debtOverview ?? {};
  const totalEnroll = enrollDonut.reduce((s, e) => s + e.value, 0);
  const totalLead   = leadStatusDonut.reduce((s, e) => s + e.value, 0);
const totalAtt    = (attendance?.overall?.total ?? 0);
  const totalGender = studentGenderDonut.reduce((s, e) => s + e.value, 0);

  // ── Leads extended derived ───────────────────────────────────────────────
  const leadFunnel = LEAD_STATUS_FUNNEL_ORDER.map((s) => ({
    status: s,
    label:  LEAD_STATUS_LABELS[s] ?? s,
    count:  leads?.byStatus?.find((b) => b.status === s)?.count ?? 0,
    color:  LEAD_STATUS_FUNNEL_COLORS[s],
  }));
  const maxFunnelCount = Math.max(...leadFunnel.map((f) => f.count), 1);

  const activityTrend = (leadActivity?.dailyActivity ?? []).map((d) => {
    const [, m, day] = d.date.split("-");
    return { label: `${parseInt(day)} ${UZ_MONTHS[parseInt(m) - 1]}`, count: d.count };
  });

  const totalActivity = (leadActivity?.dailyActivity ?? []).reduce((s, d) => s + d.count, 0);

  const sourceBarData = [...(leads?.bySource ?? [])].sort((a, b) => b.count - a.count).slice(0, 10);

  return (
    <div className="space-y-10 pb-12">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Statistika</h1>
          <p className="text-sm text-gray-400 mt-0.5">Barcha ko'rsatkichlar bir joyda</p>
        </div>
        <DateFilter value={dateRange} onChange={setDateRange} />
      </div>

      {/* ── 1. Overview KPIs ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard loading={ol} label="Jami sotuvlar"     value={overview?.totalLeads ?? 0}                              icon={UserPlus}      color="blue"   />
        <KpiCard loading={ol} label="Faol o'quvchilar" value={overview?.totalActiveStudents ?? 0}                    icon={GraduationCap} color="brown"  />
        <KpiCard loading={ol} label="Bu oy daromad"    value={formatMoneyFull(overview?.revenueThisMonth)}            icon={TrendingUp}    color="green"  sub="To'langan to'lovlar" />
        <KpiCard loading={ol} label="Bu oy davomat"    value={`${overview?.attendanceRateThisMonth ?? 0}%`}           icon={Activity}      color="purple" sub="Joriy oy ko'rsatkichi" />
      </div>

      {/* ── 2. Revenue ─────────────────────────────────────────────────── */}
      <div>
        <SecHeader icon={TrendingUp} title="Daromad tahlili" sub="Oylik to'lovlar va holat taqsimoti" />

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <KpiCard loading={rl} label="Jami yig'ilgan"    value={formatMoneyFull(revenue?.totalCollected)}          icon={TrendingUp}  color="green"  />
          <KpiCard loading={rl} label="Jami qarz"         value={formatMoneyFull(revenue?.totalOutstandingDebt)}    icon={AlertCircle} color="red"    />
          <KpiCard loading={rl} label="Kutilayotgan oylik" value={formatMoneyFull(revenue?.expectedMonthlyRevenue)} icon={Calendar}    color="amber"  />
          <KpiCard loading={rl} label="To'lovlar soni"    value={revenue?.totalPaymentsCount ?? 0}                  icon={CreditCard}  color="blue"   />
        </div>

        <DashboardCharts />
      </div>

      {/* ── 3. Leads ──────────────────────────────────────────────────── */}
      <div className="space-y-4">
        <SecHeader icon={UserPlus} title="Sotuvlar tahlili" sub="Murojaatlar dinamikasi, holat va konversiya tahlili" />

        {/* KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <KpiCard loading={ll} label="Jami sotuvlar"  value={leads?.totalLeads ?? 0}                                             icon={Users}        color="blue"   />
          <KpiCard loading={ll} label="Qabul qilindi"  value={leads?.byStatus?.find(s=>s.status==="converted")?.count ?? 0}       icon={CheckCircle2} color="green"  />
          <KpiCard loading={ll} label="Bekor qilindi"  value={leads?.byStatus?.find(s=>s.status==="rejected")?.count ?? 0}        icon={XCircle}      color="red"    />
          <KpiCard loading={ll} label="Konversiya"     value={`${leads?.conversionRate ?? 0}%`}                                   icon={ArrowUpRight} color="purple" />
        </div>

        {/* Row: trend + status donut */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card title="Oylik sotuvlar dinamikasi" className="lg:col-span-2 h-72">
            {ll ? <CardLoader h={220} /> : !leadTrend.length ? <Empty /> : (
              <>
                <div className="flex items-center gap-4 mb-3">
                  <Legend_ color={CHART_COLORS.blue}  label="Jami" />
                  <Legend_ color={CHART_COLORS.green} label="Qabul qilindi" />
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={leadTrend} margin={{ top: 4, right: 16, left: -8, bottom: 8 }}>
                    <CartesianGrid vertical={false} {...GRID} />
                    <XAxis dataKey="label" axisLine={false} tickLine={false} dy={10} tick={TICK} />
                    <YAxis axisLine={false} tickLine={false} tick={TICK} allowDecimals={false} />
                    <Tooltip contentStyle={TT.contentStyle} labelStyle={TT.labelStyle}
                      formatter={(v, n) => [v, n === "total" ? "Jami" : "Qabul qilindi"]}
                      cursor={{ stroke: "#E5E7EB", strokeWidth: 1 }} />
                    <Line type="monotone" dataKey="total"     stroke={CHART_COLORS.blue}  strokeWidth={2.5} dot={false} activeDot={{ r: 5, strokeWidth: 2, stroke: "#fff" }} />
                    <Line type="monotone" dataKey="converted" stroke={CHART_COLORS.green} strokeWidth={2.5} dot={false} activeDot={{ r: 5, strokeWidth: 2, stroke: "#fff" }} />
                  </LineChart>
                </ResponsiveContainer>
              </>
            )}
          </Card>

          <Card title="Holat taqsimoti">
            {ll ? <CardLoader h={180} /> : (
              <Donut data={leadStatusDonut} total={totalLead} colors={LEAD_STATUS_COLORS} labelMap={LEAD_STATUS_LABELS} loading={false} />
            )}
          </Card>
        </div>

        {/* Row: status funnel */}
        <Card title="Holat funeli (murojaat yulagi)">
          {ll ? <CardLoader h={160} /> : (
            <div className="space-y-2.5">
              {leadFunnel.map((item) => {
                const pct = maxFunnelCount > 0 ? Math.round((item.count / maxFunnelCount) * 100) : 0;
                return (
                  <div key={item.status} className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 w-32 shrink-0 truncate">{item.label}</span>
                    <div className="flex-1 h-5 bg-gray-100 rounded-sm overflow-hidden">
                      <div className="h-full rounded-sm transition-all duration-500 flex items-center px-2"
                        style={{ width: `${Math.max(pct, item.count > 0 ? 2 : 0)}%`, background: item.color }}>
                        {item.count > 0 && pct > 10 && (
                          <span className="text-[10px] font-semibold text-white leading-none">{item.count}</span>
                        )}
                      </div>
                    </div>
                    <span className="text-xs font-bold text-gray-700 tabular-nums w-8 text-right shrink-0">{item.count}</span>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Row: course type + age groups */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card title="Kurs turi bo'yicha murojaatlar" className="h-72">
            {ll ? <CardLoader h={220} /> : !(leads?.byCourseType?.length) ? <Empty /> : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={leads.byCourseType} layout="vertical"
                  margin={{ top: 4, right: 40, left: 0, bottom: 4 }}>
                  <CartesianGrid horizontal={false} {...GRID} />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={TICK} allowDecimals={false} />
                  <YAxis type="category" dataKey="course" axisLine={false} tickLine={false}
                    tick={{ fontSize: 11, fill: "#6B7280" }} width={100} />
                  <Tooltip contentStyle={TT.contentStyle} formatter={(v) => [v, "Murojaat"]} />
                  <Bar dataKey="count" fill={CHART_COLORS.blue} radius={[0,3,3,0]} maxBarSize={18}
                    label={{ position: "right", fontSize: 10, fill: "#9CA3AF" }} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>

          <Card title="Yosh guruhlari bo'yicha murojaatlar" className="h-72">
            {ll ? <CardLoader h={220} /> : !(leads?.byAgeGroup?.some(g => g.count > 0)) ? <Empty /> : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={leads.byAgeGroup} margin={{ top: 4, right: 16, left: -8, bottom: 8 }}>
                  <CartesianGrid vertical={false} {...GRID} />
                  <XAxis dataKey="ageGroup" axisLine={false} tickLine={false} dy={10} tick={TICK} />
                  <YAxis axisLine={false} tickLine={false} tick={TICK} allowDecimals={false} />
                  <Tooltip contentStyle={TT.contentStyle} formatter={(v) => [v, "Murojaat"]} />
                  <Bar dataKey="count" radius={[4,4,0,0]} maxBarSize={60}>
                    {(leads?.byAgeGroup ?? []).map((_, i) => (
                      <Cell key={i} fill={AGE_GROUP_COLORS[i % AGE_GROUP_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>
        </div>

        {/* Row: source + gender + rejection reasons */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card title="Manba bo'yicha" className="h-72 lg:col-span-2">
            {ll ? <CardLoader h={220} /> : !sourceBarData.length ? <Empty /> : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={sourceBarData} layout="vertical"
                  margin={{ top: 4, right: 40, left: 0, bottom: 4 }}>
                  <CartesianGrid horizontal={false} {...GRID} />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={TICK} allowDecimals={false} />
                  <YAxis type="category" dataKey="source" axisLine={false} tickLine={false}
                    tick={{ fontSize: 11, fill: "#6B7280" }} width={90} />
                  <Tooltip contentStyle={TT.contentStyle} formatter={(v) => [v, "Murojaat"]} />
                  <Bar dataKey="count" fill={CHART_COLORS.teal} radius={[0,3,3,0]} maxBarSize={18}
                    label={{ position: "right", fontSize: 10, fill: "#9CA3AF" }} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>

          <Card title="Jins taqsimoti">
            {ll ? <CardLoader h={180} /> : (
              <Donut data={genderDonut} total={genderDonut.reduce((s,e)=>s+e.value,0)}
                colors={GENDER_PIE_COLORS} labelMap={GENDER_LABELS} loading={false} />
            )}
          </Card>
        </div>

        {/* Rejection reasons (if data exists) */}
        {(leads?.byRejectionReason?.length > 0) && (
          <Card title="Rad etish sabablari">
            {ll ? <CardLoader h={180} /> : (
              <ResponsiveContainer width="100%" height={Math.min(leads.byRejectionReason.length * 36 + 24, 220)}>
                <BarChart data={leads.byRejectionReason} layout="vertical"
                  margin={{ top: 4, right: 40, left: 0, bottom: 4 }}>
                  <CartesianGrid horizontal={false} {...GRID} />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={TICK} allowDecimals={false} />
                  <YAxis type="category" dataKey="reason" axisLine={false} tickLine={false}
                    tick={{ fontSize: 11, fill: "#6B7280" }} width={130} />
                  <Tooltip contentStyle={TT.contentStyle} formatter={(v) => [v, "Murojaat"]} />
                  <Bar dataKey="count" fill={CHART_COLORS.red} radius={[0,3,3,0]} maxBarSize={18}
                    label={{ position: "right", fontSize: 10, fill: "#9CA3AF" }} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>
        )}

        {/* Activity section */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-1 h-5 bg-brown-800 rounded-full shrink-0" />
              <h3 className="text-sm font-semibold text-gray-800">Faollik tahlili</h3>
            </div>
            <div className="flex gap-1 border border-gray-200 rounded-md p-0.5">
              {[7, 14, 30].map((d) => (
                <button key={d} onClick={() => setActivityDays(d)}
                  className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                    activityDays === d ? "bg-gray-900 text-white" : "text-gray-500 hover:text-gray-800"
                  }`}>
                  {d} kun
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Activity line chart */}
            <Card className="lg:col-span-2 h-64"
              title={`So'nggi ${activityDays} kun faolligi`}
              headerRight={<span className="text-xs text-gray-400">{totalActivity} ta harakat</span>}>
              {lal ? <CardLoader h={190} /> : !activityTrend.length ? <Empty /> : (
                <ResponsiveContainer width="100%" height={190}>
                  <AreaChart data={activityTrend} margin={{ top: 4, right: 8, left: -20, bottom: 8 }}>
                    <defs>
                      <linearGradient id="activityGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%"   stopColor={CHART_COLORS.blue} stopOpacity={0.15} />
                        <stop offset="100%" stopColor={CHART_COLORS.blue} stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} {...GRID} />
                    <XAxis dataKey="label" axisLine={false} tickLine={false} dy={10} tick={{ fontSize: 10, fill: "#9CA3AF" }}
                      interval={activityDays <= 14 ? 1 : Math.floor(activityDays / 8)} />
                    <YAxis axisLine={false} tickLine={false} tick={TICK} allowDecimals={false} />
                    <Tooltip contentStyle={TT.contentStyle} formatter={(v) => [v, "Harakat"]} />
                    <Area type="monotone" dataKey="count" stroke={CHART_COLORS.blue} fill="url(#activityGrad)"
                      strokeWidth={2} dot={false} activeDot={{ r: 4, strokeWidth: 2, stroke: "#fff" }} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </Card>

            {/* Event type frequency */}
            <div className="space-y-4">
              <Card title="Harakat turlari">
                {lal ? <CardLoader h={100} /> : !(leadActivity?.byEventType?.length) ? <Empty /> : (
                  <div className="space-y-2.5">
                    {leadActivity.byEventType.map((e, i) => {
                      const max = leadActivity.byEventType[0]?.count || 1;
                      const pct = Math.round((e.count / max) * 100);
                      return (
                        <div key={e.eventType}>
                          <div className="flex justify-between mb-1">
                            <span className="text-xs text-gray-600 truncate flex-1 pr-2">
                              {LEAD_EVENT_TYPE_LABELS[e.eventType] ?? e.eventType}
                            </span>
                            <span className="text-xs font-bold text-gray-800 tabular-nums shrink-0">{e.count}</span>
                          </div>
                          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full rounded-full bg-blue-500 transition-all duration-500"
                              style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>
            </div>
          </div>

          {/* Status transitions */}
          {(leadActivity?.statusTransitions?.length > 0) && (
            <Card title="Holat o'tish zanjiri" className="mt-4">
              {lal ? <CardLoader h={80} /> : (
                <div className="flex flex-wrap gap-2">
                  {leadActivity.statusTransitions.map((t, i) => (
                    <div key={i} className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-md px-2.5 py-1.5">
                      <span className="text-xs font-medium px-1.5 py-0.5 rounded"
                        style={{ background: LEAD_STATUS_FUNNEL_COLORS[t.from] + "20", color: LEAD_STATUS_FUNNEL_COLORS[t.from] }}>
                        {LEAD_STATUS_LABELS[t.from] ?? t.from}
                      </span>
                      <span className="text-gray-300 text-xs">→</span>
                      <span className="text-xs font-medium px-1.5 py-0.5 rounded"
                        style={{ background: LEAD_STATUS_FUNNEL_COLORS[t.to] + "20", color: LEAD_STATUS_FUNNEL_COLORS[t.to] }}>
                        {LEAD_STATUS_LABELS[t.to] ?? t.to}
                      </span>
                      <span className="text-xs font-bold text-gray-700 ml-1">{t.count}</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}
        </div>
      </div>

      {/* ── 4. Students ────────────────────────────────────────────────── */}
      <div>
        <SecHeader icon={GraduationCap} title="O'quvchilar tahlili" sub="Ro'yxatga olishlar, jins va qarz holati" />

        {/* Debt KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <KpiCard loading={sl} label="Faol ro'yxatlar"  value={debt.activeEnrollments ?? 0}                   icon={Users}       color="brown"  />
          <KpiCard loading={sl} label="Qarzli o'quvchi"  value={debt.studentsInDebt ?? 0}                      icon={AlertCircle} color="amber"  />
          <KpiCard loading={sl} label="Jami qarz"        value={formatMoneyFull(debt.totalOutstandingDebt)}     icon={CreditCard}  color="red"    />
          <KpiCard loading={sl} label="Ortiqcha balans"  value={formatMoneyFull(debt.totalBalance)}             icon={Wallet}      color="green"  />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Enrollment status donut */}
          <Card title="Ro'yxat holati">
            <Donut
              data={enrollDonut} total={totalEnroll}
              colors={ENROLLMENT_PIE_COLORS}
              labelMap={ENROLLMENT_STATUS_LABELS}
              loading={sl}
            />
          </Card>

          {/* Gender donut */}
          <Card title="Jins taqsimoti">
            <Donut
              data={studentGenderDonut} total={totalGender}
              colors={GENDER_PIE_COLORS}
              labelMap={GENDER_LABELS}
              loading={sl}
            />
          </Card>

          {/* Students per group */}
          <Card title="Guruh bo'yicha o'quvchilar">
            {sl ? <CardLoader h={180} /> : !(students?.studentsPerGroup?.length) ? <Empty /> : (
              <div className="space-y-3 overflow-y-auto max-h-52 pr-1">
                {students.studentsPerGroup.map((g) => {
                  const max = students.studentsPerGroup[0]?.studentCount || 1;
                  const pct = Math.round((g.studentCount / max) * 100);
                  return (
                    <div key={g.groupId}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-gray-700 truncate flex-1 pr-2">{g.groupName ?? "—"}</span>
                        <span className="text-xs font-bold text-gray-800 tabular-nums shrink-0">{g.studentCount}</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-brown-600 transition-all duration-500" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* ── 5a. Finance overview ───────────────────────────────────────── */}
      <div>
        <SecHeader icon={Banknote} title="Moliyaviy xarajatlar" sub={`${financeYear} yil — maosh, avans, ushlab qolishlar`} />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          <KpiCard loading={fl} label="Jami maosh to'landi"   value={formatMoneyFull(finance?.totals?.salaryPaid)}  icon={Banknote}    color="green" />
          <KpiCard loading={fl} label="Jami avanslar"         value={formatMoneyFull(finance?.totals?.advances)}    icon={Wallet}      color="amber" />
          <KpiCard loading={fl} label="Jami ushlab qolishlar" value={formatMoneyFull(finance?.totals?.deductions)}  icon={AlertCircle} color="red"   />
        </div>

        <Card title={`Oylik moliyaviy xarajatlar (${financeYear})`} className="h-72">
          {fl ? <CardLoader h={220} /> : !(finance?.months?.some(m => m.salaryPaid > 0 || m.advances > 0)) ? <Empty /> : (
            <>
              <div className="flex items-center gap-4 mb-3">
                <Legend_ color={CHART_COLORS.green}  label="Maosh" />
                <Legend_ color={CHART_COLORS.amber}  label="Avans" />
                <Legend_ color={CHART_COLORS.red}    label="Ushlab qolish" />
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={finance.months.map(m => ({ ...m, label: UZ_MONTHS[m.month - 1] }))}
                  margin={{ top: 4, right: 16, left: -8, bottom: 8 }}>
                  <CartesianGrid vertical={false} {...GRID} />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} dy={10} tick={TICK} />
                  <YAxis axisLine={false} tickLine={false} tick={TICK} tickFormatter={(v) => v >= 1_000_000 ? `${(v/1_000_000).toFixed(1)}M` : v >= 1000 ? `${(v/1000).toFixed(0)}K` : v} />
                  <Tooltip contentStyle={TT.contentStyle} labelStyle={TT.labelStyle}
                    formatter={(v, n) => [
                      `${Number(v).toLocaleString("uz-UZ")} so'm`,
                      n === "salaryPaid" ? "Maosh" : n === "advances" ? "Avans" : "Ushlab qolish",
                    ]}
                  />
                  <Bar dataKey="salaryPaid"  fill={CHART_COLORS.green} radius={[3,3,0,0]} />
                  <Bar dataKey="advances"    fill={CHART_COLORS.amber} radius={[3,3,0,0]} />
                  <Bar dataKey="deductions"  fill={CHART_COLORS.red}   radius={[3,3,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </>
          )}
        </Card>
      </div>

      {/* ── 5. Attendance ──────────────────────────────────────────────── */}
      <div>
        <SecHeader icon={Activity} title="Davomat tahlili" sub="Qatnashish tendensiyasi va guruh bo'yicha ko'rsatkichlar" />

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <KpiCard loading={al} label="Jami darslar"    value={attendance?.overall?.total ?? 0}          icon={Calendar}     color="blue"   />
          <KpiCard loading={al} label="Qatnashgan"      value={attendance?.overall?.present ?? 0}        icon={CheckCircle2} color="green"  />
          <KpiCard loading={al} label="Qatnashmagan"    value={attendance?.overall?.absent ?? 0}         icon={XCircle}      color="red"    />
          <KpiCard loading={al} label="O'rtacha davomat" value={`${attendance?.overall?.attendanceRate ?? 0}%`} icon={Activity} color="purple" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Area chart — monthly trend */}
          <Card title="Oylik davomat tendensiyasi" className="lg:col-span-2 h-72">
            {al ? <CardLoader h={220} /> : !attTrend.length ? <Empty /> : (
              <>
                <div className="flex items-center gap-4 mb-3">
                  <Legend_ color={CHART_COLORS.green} label="Qatnashgan" />
                  <Legend_ color={CHART_COLORS.red}   label="Qatnashmagan" />
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={attTrend} margin={{ top: 4, right: 16, left: -4, bottom: 8 }}>
                    <defs>
                      <linearGradient id="presentGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%"   stopColor={CHART_COLORS.green} stopOpacity={0.15} />
                        <stop offset="100%" stopColor={CHART_COLORS.green} stopOpacity={0.02} />
                      </linearGradient>
                      <linearGradient id="absentGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%"   stopColor={CHART_COLORS.red} stopOpacity={0.12} />
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
                    <Area type="monotone" dataKey="absent"  stroke={CHART_COLORS.red}   fill="url(#absentGrad)"
                      strokeWidth={2.5} dot={false} activeDot={{ r: 5, strokeWidth: 2, stroke: "#fff" }} />
                  </AreaChart>
                </ResponsiveContainer>
              </>
            )}
          </Card>

          <div className="space-y-4">
            {/* Present/absent donut */}
            <Card title="Qatnashish nisbati">
              <Donut
                data={attDonut} total={totalAtt}
                colors={[CHART_COLORS.green, CHART_COLORS.red]}
                loading={al}
              />
            </Card>

            {/* By group progress bars */}
            <Card title="Guruh bo'yicha davomat">
              {al ? <CardLoader h={120} /> : !byGroup.length ? <Empty /> : (
                <div className="space-y-3 overflow-y-auto max-h-44 pr-1">
                  {byGroup.map((g) => {
                    const color = g.attendanceRate >= 85 ? CHART_COLORS.green
                      : g.attendanceRate >= 70 ? CHART_COLORS.amber
                      : CHART_COLORS.red;
                    return (
                      <div key={g.groupId}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-gray-700 truncate flex-1 pr-2">{g.groupName ?? "—"}</span>
                          <span className="text-xs font-bold tabular-nums shrink-0" style={{ color }}>{g.attendanceRate}%</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${g.attendanceRate}%`, background: color }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>

      {/* ── 6. Course demand by age ────────────────────────────────────── */}
      <div>
        <SecHeader icon={BookOpen} title="Kurs turlari bo'yicha yosh talabi" sub="Qaysi kursga necha yoshdan ko'proq murojaat" />

        <Card title="Kurs turiga qarab yosh taqsimoti" className="h-80">
          {cal ? <CardLoader h={260} /> : !(courseAge?.byCourseType?.length) ? <Empty /> : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={courseAge.byCourseType} margin={{ top: 4, right: 16, left: -8, bottom: 8 }}>
                <CartesianGrid vertical={false} {...GRID} />
                <XAxis dataKey="courseType" axisLine={false} tickLine={false} dy={10} tick={TICK} />
                <YAxis axisLine={false} tickLine={false} tick={TICK} allowDecimals={false} />
                <Tooltip contentStyle={TT.contentStyle} labelStyle={TT.labelStyle} />
                <Legend wrapperStyle={{ fontSize: 11, color: "#9CA3AF", paddingTop: 8 }} />
                {(courseAge.ageBuckets ?? []).map((bucket, i) => (
                  <Bar key={bucket} dataKey={bucket} fill={AGE_BUCKET_COLORS[i % AGE_BUCKET_COLORS.length]}
                    radius={[3,3,0,0]} maxBarSize={24} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      {/* ── 7. Dropout reasons ─────────────────────────────────────────── */}
      <div>
        <SecHeader icon={LogOut} title="Guruhdan chiqib ketish sabablari"
          sub="Qaysi sabablar bilan o'quvchilar kursni tark etmoqda" />

        <Card
          title="Tashlab ketish sabablari"
          headerRight={
            <div className="flex gap-1 border border-gray-200 rounded-md p-0.5">
              {DROPOUT_PERIOD_OPTIONS.map((opt) => (
                <button key={opt.value} onClick={() => setDropoutPeriod(opt.value)}
                  className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                    dropoutPeriod === opt.value ? "bg-gray-900 text-white" : "text-gray-500 hover:text-gray-800"
                  }`}>
                  {opt.label}
                </button>
              ))}
            </div>
          }
          className="h-80"
        >
          {dol ? <CardLoader h={240} /> : !(dropout?.byReason?.length) ? (
            <Empty text="Bu davr uchun ma'lumot yo'q" />
          ) : (
            <>
              <p className="text-xs text-gray-400 mb-3">
                Jami {dropout.total} ta tashlab ketish, shu jumladan sababli: {dropout.byReason.reduce((s,r)=>s+r.count,0)} ta
              </p>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={dropout.byReason} layout="vertical"
                  margin={{ top: 4, right: 40, left: 0, bottom: 4 }}>
                  <CartesianGrid horizontal={false} {...GRID} />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={TICK} allowDecimals={false} />
                  <YAxis type="category" dataKey="reason" axisLine={false} tickLine={false}
                    tick={{ fontSize: 11, fill: "#6B7280" }} width={140} />
                  <Tooltip contentStyle={TT.contentStyle} labelStyle={TT.labelStyle}
                    formatter={(v) => [v, "Soni"]} />
                  <Bar dataKey="count" fill={CHART_COLORS.red} radius={[0,3,3,0]} maxBarSize={20}
                    label={{ position: "right", fontSize: 11, fill: "#6B7280" }} />
                </BarChart>
              </ResponsiveContainer>
            </>
          )}
        </Card>
      </div>

    </div>
  );
};

// ─── tiny helpers ─────────────────────────────────────────────────────────────

const Legend_ = ({ color, label }) => (
  <span className="flex items-center gap-1.5 text-xs text-gray-500">
    <span className="inline-block w-3 h-0.5 rounded" style={{ background: color }} />
    {label}
  </span>
);

export default StatisticsPage;
