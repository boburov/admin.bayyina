import { useState } from "react";

import {
  AreaChart, Area,
  LineChart, Line,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip,
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
  ArrowUpRight,
} from "lucide-react";

// ─── constants ────────────────────────────────────────────────────────────────

const GRID  = { stroke: "#F3F4F6", strokeDasharray: "3 3" };
const TICK  = { fontSize: 11, fill: "#9CA3AF" };
const TT    = TOOLTIP_STYLE;

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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard loading={ol} label="Jami leadlar"     value={overview?.totalLeads ?? 0}                              icon={UserPlus}      color="blue"   />
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
      <div>
        <SecHeader icon={UserPlus} title="Leadlar tahlili" sub="Murojaatlar dinamikasi va holat taqsimoti" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">

          {/* Leads KPIs */}
          <div className="lg:col-span-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <KpiCard loading={ll} label="Jami leadlar"   value={leads?.totalLeads ?? 0}         icon={Users}        color="blue"   />
            <KpiCard loading={ll} label="Qabul qilindi"  value={leads?.byStatus?.find(s=>s.status==="converted")?.count ?? 0}  icon={CheckCircle2} color="green"  />
            <KpiCard loading={ll} label="Bekor qilindi"  value={leads?.byStatus?.find(s=>s.status==="rejected")?.count ?? 0}   icon={XCircle}      color="red"    />
            <KpiCard loading={ll} label="Konversiya"     value={`${leads?.conversionRate ?? 0}%`}                              icon={ArrowUpRight}  color="purple" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Line chart — monthly trend */}
          <Card title="Leadlar dinamikasi (6 oy)" className="lg:col-span-2 h-72">
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
                      cursor={{ stroke: "#E5E7EB", strokeWidth: 1 }}
                    />
                    <Line type="monotone" dataKey="total"     stroke={CHART_COLORS.blue}  strokeWidth={2.5} dot={false} activeDot={{ r: 5, strokeWidth: 2, stroke: "#fff" }} />
                    <Line type="monotone" dataKey="converted" stroke={CHART_COLORS.green} strokeWidth={2.5} dot={false} activeDot={{ r: 5, strokeWidth: 2, stroke: "#fff" }} />
                  </LineChart>
                </ResponsiveContainer>
              </>
            )}
          </Card>

          {/* Donut — status distribution */}
          <Card title="Holat taqsimoti">
            {ll ? <CardLoader h={180} /> : (
              <Donut
                data={leadStatusDonut} total={totalLead}
                colors={LEAD_STATUS_COLORS}
                labelMap={LEAD_STATUS_LABELS}
                loading={false}
              />
            )}
          </Card>
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
