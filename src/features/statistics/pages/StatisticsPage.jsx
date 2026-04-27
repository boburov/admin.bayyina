// TanStack Query
import { useAppQuery } from "@/shared/lib/query/query-hooks";

// Recharts
import {
  AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";

// API
import { statisticsAPI } from "@/features/statistics/api/statistics.api";

// Data
import {
  formatStatMonth,
  CHART_COLORS, PAYMENT_PIE_COLORS,
  PAYMENT_STATUS_LABELS,
  formatMoney, formatMoneyFull, TOOLTIP_STYLE,
} from "@/features/statistics/data/statistics.data";

// Components
import Card from "@/shared/components/ui/Card";
import { Skeleton } from "@/shared/components/shadcn/skeleton";

// Icons
import {
  GraduationCap, TrendingUp, Activity, Wallet,
  CheckCircle2, XCircle, BarChart2, CreditCard,
  AlertCircle, BookOpen, UserPlus,
} from "lucide-react";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const ATTENDANCE_COLORS = {
  good:   CHART_COLORS.green,
  mid:    CHART_COLORS.amber,
  low:    CHART_COLORS.red,
};

const getAttColor = (rate) =>
  rate >= 85 ? ATTENDANCE_COLORS.good :
  rate >= 70 ? ATTENDANCE_COLORS.mid  : ATTENDANCE_COLORS.low;

// ─── Shared UI pieces ─────────────────────────────────────────────────────────

const KpiCard = ({ label, value, icon: Icon, color, loading, sub }) => {
  const cfg = {
    green:  { bg: "bg-green-50",  text: "text-green-700",  icon: "text-green-500"  },
    blue:   { bg: "bg-blue-50",   text: "text-blue-700",   icon: "text-blue-500"   },
    brown:  { bg: "bg-brown-50",  text: "text-brown-800",  icon: "text-brown-800"  },
    red:    { bg: "bg-red-50",    text: "text-red-700",    icon: "text-red-500"    },
    orange: { bg: "bg-orange-50", text: "text-orange-700", icon: "text-orange-500" },
    purple: { bg: "bg-purple-50", text: "text-purple-700", icon: "text-purple-500" },
  }[color] ?? { bg: "bg-gray-50", text: "text-gray-700", icon: "text-gray-500" };

  return (
    <Card className="flex items-center gap-4 !py-4">
      <div className={`${cfg.bg} ${cfg.icon} p-3 rounded-sm shrink-0`}>
        <Icon className="size-5" strokeWidth={1.5} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-gray-500 truncate">{label}</p>
        {loading ? (
          <Skeleton className="w-24 h-7 mt-1" />
        ) : (
          <p className={`text-2xl font-bold leading-tight mt-0.5 ${cfg.text}`}>{value}</p>
        )}
        {sub && !loading && (
          <p className="text-xs text-gray-400 mt-0.5 truncate">{sub}</p>
        )}
      </div>
    </Card>
  );
};

const SecTitle = ({ icon: Icon, title, sub }) => (
  <div className="flex items-start gap-3 mb-5">
    <div className="w-1 h-5 bg-brown-800 rounded-full shrink-0 mt-0.5" />
    <div>
      <div className="flex items-center gap-1.5">
        {Icon && <Icon className="size-4 text-brown-800" strokeWidth={1.5} />}
        <h2 className="text-sm font-semibold text-gray-800">{title}</h2>
      </div>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  </div>
);

const Loader = () => (
  <div className="flex items-center justify-center min-h-[200px]">
    <div className="h-7 w-7 rounded-full border-2 border-gray-200 border-t-brown-800 animate-spin" />
  </div>
);

const Empty = ({ text = "Ma'lumot mavjud emas" }) => (
  <div className="flex flex-col items-center justify-center min-h-[160px] gap-2">
    <BarChart2 className="size-8 text-gray-200" strokeWidth={1.5} />
    <p className="text-xs text-gray-400">{text}</p>
  </div>
);

const chartStyle = {
  grid:    { stroke: "#F3F4F6", strokeDasharray: "3 3" },
  tick:    { fontSize: 11, fill: "#9CA3AF" },
  tooltip: TOOLTIP_STYLE,
};

// ─── Page ─────────────────────────────────────────────────────────────────────

const Statistics = () => {
  const { data: overview, isLoading: ol } = useAppQuery({
    queryKey: ["statistics", "overview"],
    queryFn:  () => statisticsAPI.getOverview(),
    select:   (r) => r.data,
    staleTime: 60_000,
  });

  const { data: attendance, isLoading: al } = useAppQuery({
    queryKey: ["statistics", "attendance"],
    queryFn:  () => statisticsAPI.getAttendance(),
    select:   (r) => r.data,
    staleTime: 60_000,
  });

  const { data: revenue, isLoading: rl } = useAppQuery({
    queryKey: ["statistics", "revenue"],
    queryFn:  () => statisticsAPI.getRevenue(),
    select:   (r) => r.data,
    staleTime: 60_000,
  });

  const { data: leadStats, isLoading: ll } = useAppQuery({
    queryKey: ["statistics", "leads"],
    queryFn:  () => statisticsAPI.getLeads(),
    select:   (r) => r.data,
    staleTime: 60_000,
  });

  const attendanceTrend = (attendance?.monthlyTrend ?? []).map((d) => ({
    ...d,
    absent: (d.total ?? 0) - (d.present ?? 0),
    label:  formatStatMonth(d),
  }));

  const revenueTrend = (revenue?.monthlyRevenue ?? []).map((d) => ({
    ...d, label: formatStatMonth(d),
  }));

  const byGroup = (attendance?.byGroup ?? [])
    .slice()
    .sort((a, b) => b.attendanceRate - a.attendanceRate);

  return (
    <div className="space-y-10">

      {/* Page header */}
      <div className="pb-4 border-b border-border">
        <h1 className="page-title">Statistika</h1>
        <p className="text-sm text-gray-400 mt-1">Davomat va to'lovlar tahlili</p>
      </div>

      {/* ── 1. Umumiy ko'rsatkichlar ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          loading={ol}
          label="Faol o'quvchilar"
          value={overview?.totalActiveStudents ?? 0}
          sub="Hozirda o'qiyotganlar"
          icon={GraduationCap}
          color="brown"
        />
        <KpiCard
          loading={ol}
          label="Bu oy davomat"
          value={`${overview?.attendanceRateThisMonth ?? 0}%`}
          sub="Joriy oy ko'rsatkichi"
          icon={Activity}
          color="blue"
        />
        <KpiCard
          loading={ol}
          label="Bu oy daromad"
          value={formatMoneyFull(overview?.revenueThisMonth)}
          sub="To'langan to'lovlar"
          icon={TrendingUp}
          color="green"
        />
        <KpiCard
          loading={rl}
          label="Jami yig'ilgan"
          value={formatMoneyFull(revenue?.totalCollected)}
          sub="Barcha vaqt uchun"
          icon={Wallet}
          color="purple"
        />
      </div>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* ── 2. DAVOMAT ────────────────────────────────────────────────── */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <div>
        <SecTitle
          icon={Activity}
          title="Davomat statistikasi"
          sub="O'quvchilar qatnashuvining oylik tendensiyasi"
        />

        {/* Davomat KPI */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <KpiCard
            loading={al}
            label="Jami darslar"
            value={attendance?.overall?.total ?? 0}
            icon={BookOpen}
            color="blue"
          />
          <KpiCard
            loading={al}
            label="Qatnashgan"
            value={attendance?.overall?.present ?? 0}
            sub={`${attendance?.overall?.attendanceRate ?? 0}% davomat`}
            icon={CheckCircle2}
            color="green"
          />
          <KpiCard
            loading={al}
            label="Qatnashmagan"
            value={attendance?.overall?.absent ?? 0}
            icon={XCircle}
            color="red"
          />
          <KpiCard
            loading={al}
            label="O'rtacha davomat"
            value={`${attendance?.overall?.attendanceRate ?? 0}%`}
            sub="Barcha guruhlar bo'yicha"
            icon={Activity}
            color="brown"
          />
        </div>

        {/* Trend chart + by group */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Area chart — present vs absent per month */}
          <Card
            title="Oylik davomat (qatnashgan / qatnashmagan)"
            className="lg:col-span-2 h-80"
          >
            {al ? <Loader /> : !attendanceTrend.length ? <Empty /> : (
              <>
                {/* Legend */}
                <div className="flex items-center gap-4 mb-3">
                  <span className="flex items-center gap-1.5 text-xs text-gray-500">
                    <span className="inline-block w-3 h-0.5 rounded" style={{ background: CHART_COLORS.green }} />
                    Qatnashgan
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-gray-500">
                    <span className="inline-block w-3 h-0.5 rounded" style={{ background: CHART_COLORS.red }} />
                    Qatnashmagan
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-gray-500 ml-auto">
                    <span className="inline-block w-3 h-0.5 rounded border-dashed border border-gray-400" />
                    Davomat %
                  </span>
                </div>
                <ResponsiveContainer width="100%" height="88%">
                  <AreaChart
                    data={attendanceTrend}
                    margin={{ top: 8, right: 16, left: -4, bottom: 32 }}
                  >
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
                    <CartesianGrid vertical={false} {...chartStyle.grid} />
                    <XAxis
                      dataKey="label"
                      axisLine={false} tickLine={false} dy={10}
                      tick={chartStyle.tick}
                    />
                    <YAxis
                      axisLine={false} tickLine={false}
                      tick={chartStyle.tick}
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={chartStyle.tooltip.contentStyle}
                      labelStyle={chartStyle.tooltip.labelStyle}
                      cursor={{ stroke: "#E5E7EB", strokeWidth: 1 }}
                      formatter={(value, name) => {
                        if (name === "present") return [value, "Qatnashgan"];
                        if (name === "absent")  return [value, "Qatnashmagan"];
                        return [value, name];
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="present"
                      name="present"
                      stroke={CHART_COLORS.green}
                      fill="url(#presentGrad)"
                      strokeWidth={2.5}
                      dot={false}
                      activeDot={{ r: 5, strokeWidth: 2, stroke: "#fff" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="absent"
                      name="absent"
                      stroke={CHART_COLORS.red}
                      fill="url(#absentGrad)"
                      strokeWidth={2.5}
                      dot={false}
                      activeDot={{ r: 5, strokeWidth: 2, stroke: "#fff" }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </>
            )}
          </Card>

          {/* By group progress bars */}
          <Card title="Guruh bo'yicha davomat">
            {al ? <Loader /> : !byGroup.length ? <Empty /> : (
              <div className="space-y-4 overflow-y-auto max-h-56 pr-1">
                {byGroup.map((g) => (
                  <div key={g.groupId}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-medium text-gray-700 truncate flex-1 pr-2">
                        {g.groupName ?? "—"}
                      </span>
                      <span
                        className="text-xs font-bold shrink-0 tabular-nums"
                        style={{ color: getAttColor(g.attendanceRate) }}
                      >
                        {g.attendanceRate}%
                      </span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${g.attendanceRate}%`,
                          background: getAttColor(g.attendanceRate),
                        }}
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1 tabular-nums">
                      {g.present} / {g.total} dars
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* ── 3. LEADLAR VA RAD ETISHLAR ─────────────────────────────────── */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <div>
        <SecTitle
          icon={UserPlus}
          title="Leadlar va rad etishlar tahlili"
          sub="Murojaatlarning holati va rad etilish sabablari"
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Status distribution */}
          <Card title="Leadlar holati">
            {ll ? <Loader /> : !leadStats?.byStatus?.length ? <Empty /> : (
              <div className="space-y-3">
                {leadStats.byStatus.map((s) => {
                  const pct = leadStats.totalLeads > 0 ? Math.round((s.count / leadStats.totalLeads) * 100) : 0;
                  return (
                    <div key={s.status}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-medium text-gray-700 capitalize">{s.status}</span>
                        <span className="text-gray-500">{s.count} ta ({pct}%)</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div
                          className="h-1.5 rounded-full bg-brown-600"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Rejection reasons - IMPORTANT */}
          <Card title="Rad etilish sabablari" className="lg:col-span-2">
            {ll ? <Loader /> : !leadStats?.byRejectionReason?.length ? (
              <Empty text="Rad etilgan leadlar yo'q yoki sababi ko'rsatilmagan" />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  {leadStats.byRejectionReason.map((r, i) => {
                    const totalRejected = leadStats.byRejectionReason.reduce((sum, item) => sum + item.count, 0);
                    const pct = totalRejected > 0 ? Math.round((r.count / totalRejected) * 100) : 0;
                    return (
                      <div key={i}>
                        <div className="flex justify-between text-xs mb-1.5">
                          <span className="font-semibold text-gray-800 truncate pr-2">{r.reason}</span>
                          <span className="text-gray-500 shrink-0">{r.count} ta ({pct}%)</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div
                            className="h-2 rounded-full bg-red-500 transition-all duration-700"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Donut chart for reasons */}
                <div className="h-48 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={leadStats.byRejectionReason}
                        dataKey="count"
                        nameKey="reason"
                        cx="50%" cy="50%"
                        innerRadius="40%" outerRadius="75%"
                        paddingAngle={2}
                      >
                        {leadStats.byRejectionReason.map((_, i) => (
                          <Cell key={i} fill={CHART_COLORS.red + (99 - i * 15)} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={chartStyle.tooltip.contentStyle}
                        labelStyle={chartStyle.tooltip.labelStyle}
                        formatter={(v) => [v, "Soni"]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* ── 4. TO'LOVLAR ──────────────────────────────────────────────── */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <div>
        <SecTitle
          icon={CreditCard}
          title="To'lovlar statistikasi"
          sub="Oylik daromad va to'lov holati tahlili"
        />

        {/* Payment KPI */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <KpiCard
            loading={rl}
            label="Jami yig'ilgan"
            value={formatMoneyFull(revenue?.totalCollected)}
            sub="Barcha vaqt"
            icon={TrendingUp}
            color="green"
          />
          <KpiCard
            loading={rl}
            label="Jami qarz"
            value={formatMoneyFull(revenue?.totalOutstandingDebt)}
            sub="Faol o'quvchilar"
            icon={AlertCircle}
            color="red"
          />
          <KpiCard
            loading={rl}
            label="Kutilayotgan oylik"
            value={formatMoneyFull(revenue?.expectedMonthlyRevenue)}
            sub="Faol guruhlar bo'yicha"
            icon={Wallet}
            color="orange"
          />
          <KpiCard
            loading={rl}
            label="To'lovlar soni"
            value={revenue?.totalPaymentsCount ?? 0}
            sub="To'langan to'lovlar"
            icon={CreditCard}
            color="blue"
          />
        </div>

        {/* Revenue trend + payment status */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Area chart — monthly revenue */}
          <Card title="Oylik daromad tendensiyasi (so'm)" className="lg:col-span-2 h-72">
            {rl ? <Loader /> : !revenueTrend.length ? <Empty /> : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={revenueTrend}
                  margin={{ top: 10, right: 16, left: 0, bottom: 36 }}
                >
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%"   stopColor={CHART_COLORS.green} stopOpacity={0.18} />
                      <stop offset="100%" stopColor={CHART_COLORS.green} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} {...chartStyle.grid} />
                  <XAxis
                    dataKey="label"
                    axisLine={false} tickLine={false} dy={10}
                    tick={chartStyle.tick}
                  />
                  <YAxis
                    axisLine={false} tickLine={false}
                    tick={chartStyle.tick}
                    tickFormatter={formatMoney}
                    width={52}
                  />
                  <Tooltip
                    contentStyle={chartStyle.tooltip.contentStyle}
                    labelStyle={chartStyle.tooltip.labelStyle}
                    formatter={(v) => [formatMoneyFull(v), "Daromad"]}
                    cursor={{ stroke: "#E5E7EB", strokeWidth: 1 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="collected"
                    name="Daromad"
                    stroke={CHART_COLORS.green}
                    fill="url(#revGrad)"
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{ r: 5, strokeWidth: 2, stroke: "#fff" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </Card>

          {/* Payment status donut */}
          <Card title="To'lov holati taqsimoti">
            {rl ? <Loader /> : (
              <>
                <PaymentDonut
                  data={revenue?.paymentStatusDistribution ?? []}
                  colors={PAYMENT_PIE_COLORS}
                  labelMap={PAYMENT_STATUS_LABELS}
                />
                <div className="mt-5 pt-4 border-t border-border space-y-2.5">
                  {[
                    { label: "Jami yig'ilgan",    val: formatMoneyFull(revenue?.totalCollected),          cls: "text-green-700"  },
                    { label: "Jami qarz",          val: formatMoneyFull(revenue?.totalOutstandingDebt),    cls: "text-red-600"    },
                    { label: "Kutilayotgan oylik", val: formatMoneyFull(revenue?.expectedMonthlyRevenue),  cls: "text-orange-600" },
                  ].map(({ label, val, cls }) => (
                    <div key={label} className="flex items-center justify-between gap-2">
                      <span className="text-xs text-gray-500">{label}</span>
                      <span className={`text-xs font-semibold tabular-nums ${cls}`}>{val}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </Card>
        </div>
      </div>

    </div>
  );
};

// ─── Payment donut ─────────────────────────────────────────────────────────────
const PaymentDonut = ({ data = [], colors, labelMap }) => {
  const total = data.reduce((s, d) => s + (d.count ?? 0), 0);

  if (!data.length || total === 0) return (
    <div className="flex flex-col items-center justify-center min-h-[120px] gap-2">
      <BarChart2 className="size-7 text-gray-200" strokeWidth={1.5} />
      <p className="text-xs text-gray-400">Ma'lumot mavjud emas</p>
    </div>
  );

  return (
    <div className="flex items-center gap-4">
      <div className="w-28 h-28 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="count"
              cx="50%" cy="50%"
              innerRadius="50%" outerRadius="78%"
              strokeWidth={2} stroke="#fff"
            >
              {data.map((_, i) => (
                <Cell key={i} fill={colors[i % colors.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(v, _n, p) => [v, labelMap?.[p.payload.status] || p.payload.status]}
              contentStyle={TOOLTIP_STYLE.contentStyle}
              labelStyle={TOOLTIP_STYLE.labelStyle}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="space-y-2.5 flex-1 min-w-0">
        {data.map((item, i) => {
          const pct  = total > 0 ? ((item.count / total) * 100).toFixed(0) : 0;
          const name = labelMap?.[item.status] || item.status;
          return (
            <div key={i} className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full shrink-0" style={{ background: colors[i % colors.length] }} />
              <span className="text-xs text-gray-600 truncate flex-1">{name}</span>
              <span className="text-xs font-semibold text-gray-800 tabular-nums shrink-0">{item.count}</span>
              <span className="text-xs text-gray-400 tabular-nums w-8 text-right shrink-0">{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Statistics;
