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
  <div className="flex items-center justify-between mb-6 group">
    <div className="flex items-center gap-4">
      <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white border border-gray-100 shadow-sm text-brown-800 group-hover:scale-110 transition-transform">
        {Icon && <Icon size={20} strokeWidth={1.5} />}
      </div>
      <div>
        <h2 className="text-base font-bold text-gray-900 leading-none mb-1.5">{title}</h2>
        {sub && <p className="text-xs text-gray-400 font-medium">{sub}</p>}
      </div>
    </div>
  </div>
);

const KPICard = ({ label, value, sub, icon: Icon, color = "brown", loading, trend }) => {
  const configs = {
    brown:  { bg: "bg-brown-50",  text: "text-brown-800",  icon: "text-brown-600", border: "border-brown-100" },
    blue:   { bg: "bg-blue-50",   text: "text-blue-700",   icon: "text-blue-500",  border: "border-blue-100" },
    green:  { bg: "bg-green-50",  text: "text-green-700",  icon: "text-green-500", border: "border-green-100" },
    red:    { bg: "bg-red-50",    text: "text-red-700",    icon: "text-red-500",   border: "border-red-100" },
    purple: { bg: "bg-purple-50", text: "text-purple-700", icon: "text-purple-500", border: "border-purple-100" },
    amber:  { bg: "bg-amber-50",  text: "text-amber-700",  icon: "text-amber-500", border: "border-amber-100" },
  };
  const c = configs[color] ?? configs.brown;

  return (
    <div className={`relative overflow-hidden bg-white border ${c.border} rounded-2xl p-5 shadow-sm hover:shadow-md transition-all`}>
      <div className="flex justify-between items-start">
        <div className="space-y-3">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{label}</p>
          {loading ? (
            <Skeleton className="h-8 w-24 rounded-lg" />
          ) : (
            <div className="flex items-baseline gap-2">
              <h3 className={`text-2xl font-black ${c.text} tracking-tight tabular-nums`}>{value}</h3>
              {trend && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${trend > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                  {trend > 0 ? '+' : ''}{trend}%
                </span>
              )}
            </div>
          )}
          {sub && !loading && <p className="text-[10px] text-gray-400 font-medium truncate">{sub}</p>}
        </div>
        <div className={`${c.bg} ${c.icon} p-2.5 rounded-xl`}>
          <Icon size={20} strokeWidth={1.5} />
        </div>
      </div>
      <div className={`absolute bottom-0 left-0 h-1 w-full ${c.bg} opacity-50`} />
    </div>
  );
};

const CardLoader = ({ h = 200 }) => (
  <div className="flex flex-col items-center justify-center gap-3" style={{ height: h }}>
    <div className="relative">
      <div className="w-10 h-10 rounded-full border-2 border-gray-100" />
      <div className="absolute top-0 left-0 w-10 h-10 rounded-full border-2 border-t-brown-800 animate-spin" />
    </div>
    <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Yuklanmoqda</span>
  </div>
);

const EmptyState = ({ text = "Ma'lumot mavjud emas" }) => (
  <div className="flex flex-col items-center justify-center gap-3 py-12">
    <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-200">
      <BarChart2 size={24} strokeWidth={1.5} />
    </div>
    <p className="text-xs text-gray-400 font-medium uppercase tracking-tight">{text}</p>
  </div>
);

const ChartLegend = ({ items }) => (
  <div className="flex flex-wrap gap-4 mb-6">
    {items.map((item, i) => (
      <div key={i} className="flex items-center gap-2">
        <div className="w-3 h-1 rounded-full" style={{ background: item.color }} />
        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-tighter">{item.label}</span>
      </div>
    ))}
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const ModernStatisticsPage = () => {
  const [dateRange, setDateRange] = useState(PRESETS[0].getDates());
  const [activePreset, setActivePreset] = useState(0);

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

  const applyPreset = (idx, preset) => {
    setActivePreset(idx);
    setDateRange(preset.getDates());
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-12 pb-24">
      
      {/* ── Dashboard Header ─────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2 text-brown-800 mb-2">
            <TrendingUp size={16} strokeWidth={2.5} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Analitika markazi</span>
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Tizim Statistikasi</h1>
          <p className="text-sm text-gray-400 font-medium mt-1">O'quv markazi faoliyatining asosiy ko'rsatkichlari</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-100">
            {PRESETS.map((p, i) => (
              <button
                key={p.label}
                onClick={() => applyPreset(i, p)}
                className={`px-4 py-2 text-[11px] font-bold rounded-lg transition-all ${
                  activePreset === i 
                    ? "bg-white text-gray-900 shadow-sm ring-1 ring-gray-100" 
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-2 bg-white border border-gray-100 p-1 rounded-xl shadow-sm">
            <div className="flex items-center gap-2 px-3">
              <Calendar size={14} className="text-gray-300" />
              <input 
                type="date" 
                value={dateRange.startDate} 
                onChange={(e) => { setActivePreset(-1); setDateRange(prev => ({ ...prev, startDate: e.target.value })); }}
                className="text-[11px] font-bold text-gray-600 focus:outline-none bg-transparent" 
              />
              <span className="text-gray-200">—</span>
              <input 
                type="date" 
                value={dateRange.endDate} 
                onChange={(e) => { setActivePreset(-1); setDateRange(prev => ({ ...prev, endDate: e.target.value })); }}
                className="text-[11px] font-bold text-gray-600 focus:outline-none bg-transparent" 
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Section 1: Top Overview ──────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard loading={ol} label="Jami Murojaatlar" value={overview?.totalLeads ?? 0} icon={UserPlus} color="blue" />
        <KPICard loading={ol} label="O'quvchilar Soni" value={overview?.totalActiveStudents ?? 0} icon={GraduationCap} color="brown" />
        <KPICard loading={ol} label="Oylik Daromad" value={formatMoneyFull(overview?.revenueThisMonth)} icon={Wallet} color="green" sub="Bu oydagi tushum" />
        <KPICard loading={ol} label="O'rtacha Davomat" value={`${overview?.attendanceRateThisMonth ?? 0}%`} icon={Activity} color="purple" sub="Hozirgi oy bo'yicha" />
      </div>

      {/* ── Section 2: Leads & Conversions ────────────────────────────── */}
      <div className="space-y-6">
        <SectionHeader icon={UserPlus} title="Lidlar Analitikasi" sub="Murojaatlar dinamikasi va konversiya ko'rsatkichlari" />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 min-h-[400px] !p-6 rounded-3xl shadow-sm border-gray-100">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-sm font-bold text-gray-800 uppercase tracking-tight">Murojaatlar Trendi</h3>
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
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

          <Card className="!p-6 rounded-3xl shadow-sm border-gray-100 flex flex-col justify-between">
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-tight mb-6">Holatlar Taqsimoti</h3>
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
                <div key={i} className="flex flex-col p-2 rounded-xl bg-gray-50 border border-gray-100">
                  <span className="text-[9px] font-bold text-gray-400 uppercase leading-none mb-1.5">{item.name}</span>
                  <span className="text-sm font-black text-gray-700">{item.value}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* ── Section 3: Revenue Analytics ─────────────────────────────── */}
      <div className="space-y-6">
        <SectionHeader icon={TrendingUp} title="Moliyaviy Ko'rsatkichlar" sub="Oylik tushumlar va to'lovlar dinamikasi" />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 !p-6 rounded-3xl shadow-sm border-gray-100">
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-tight mb-8">Daromad Grafigi</h3>
            <div className="h-[300px] w-full">
              {rl ? <CardLoader h={300} /> : !revenueTrend.length ? <EmptyState /> : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueTrend} margin={{ top: 0, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid vertical={false} {...GRID_STYLE} />
                    <XAxis dataKey="label" axisLine={false} tickLine={false} tick={TICK_STYLE} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={TICK_STYLE} tickFormatter={formatMoney} />
                    <Tooltip {...TT_STYLE} formatter={(v) => formatMoneyFull(v)} />
                    <Bar dataKey="amount" fill={CHART_COLORS.green} radius={[6, 6, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>

          <div className="space-y-6">
            <Card className="!p-6 rounded-3xl shadow-sm border-gray-100 bg-brown-800 text-white">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-white/10 rounded-xl text-white/80">
                  <Info size={18} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Kutilmoqda</span>
              </div>
              <p className="text-xs font-bold text-white/60 mb-1">Taxminiy oylik tushum</p>
              <h4 className="text-2xl font-black tabular-nums">{formatMoneyFull(revenue?.expectedMonthlyRevenue)}</h4>
              <div className="mt-6 pt-6 border-t border-white/10 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-white/40 uppercase">Jami yig'ilgan</p>
                  <p className="text-sm font-black tabular-nums">{formatMoneyFull(revenue?.totalCollected)}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-white/40 uppercase">To'lovlar soni</p>
                  <p className="text-sm font-black tabular-nums">{revenue?.totalPaymentsCount ?? 0}</p>
                </div>
              </div>
            </Card>

            <Card className="!p-6 rounded-3xl shadow-sm border-gray-100">
              <h3 className="text-sm font-bold text-gray-800 uppercase tracking-tight mb-4">Qarzlar miqdori</h3>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center shrink-0">
                  <AlertCircle size={24} strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-2xl font-black text-red-600 tabular-nums leading-none mb-1">
                    {formatMoneyFull(revenue?.totalOutstandingDebt)}
                  </p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Umumiy qarzdorlik</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* ── Section 4: Students & Attendance ─────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-6">
        
        {/* Student Demographics */}
        <div className="space-y-6">
          <SectionHeader icon={Users} title="O'quvchilar tarkibi" sub="Jins va guruhlar bo'yicha tahlil" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Card className="!p-6 rounded-3xl shadow-sm border-gray-100 min-h-[300px]">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Jins taqsimoti</h3>
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
              <div className="flex justify-center gap-6 mt-2">
                {genderData.map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: GENDER_PIE_COLORS[i] }} />
                    <span className="text-[10px] font-bold text-gray-600 uppercase">{item.name}: {item.value}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="!p-6 rounded-3xl shadow-sm border-gray-100 max-h-[300px] overflow-hidden">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Guruhlar hajmi</h3>
              <div className="space-y-3 overflow-y-auto max-h-[200px] pr-2 custom-scrollbar">
                {students?.studentsPerGroup?.slice(0, 8).map((g, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-600 truncate max-w-[120px]">{g.groupName}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-1.5 bg-gray-50 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-brown-400 rounded-full" 
                          style={{ width: `${Math.min((g.studentCount / 20) * 100, 100)}%` }} 
                        />
                      </div>
                      <span className="text-[10px] font-black text-gray-800 tabular-nums">{g.studentCount}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        {/* Attendance Insights */}
        <div className="space-y-6">
          <SectionHeader icon={Activity} title="Davomat Ko'rsatkichlari" sub="Darslarda qatnashish trendi" />
          <Card className="!p-6 rounded-3xl shadow-sm border-gray-100 min-h-[300px]">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Oylik Davomat %</h3>
              <div className="text-xl font-black text-purple-600">{attendance?.overall?.attendanceRate ?? 0}%</div>
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

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <div className="pt-12 flex items-center justify-center border-t border-gray-100">
        <div className="flex items-center gap-2 text-gray-300">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em]">Haqiqiy vaqt rejimi</span>
        </div>
      </div>

    </div>
  );
};

export default ModernStatisticsPage;
