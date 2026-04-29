import { useState, useMemo } from "react";
import {
  AreaChart, Area,
  BarChart, Bar,
  PieChart, Pie, Cell,
  FunnelChart, Funnel, LabelList,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from "recharts";

import { useAppQuery } from "@/shared/lib/query/query-hooks";
import { statisticsAPI } from "@/features/statistics/api/statistics.api";
import { formatStatMonth } from "@/features/statistics/data/statistics.data";
import { Skeleton } from "@/shared/components/shadcn/skeleton";
import {
  Users, TrendingUp, XCircle, CheckCircle2,
  AlertTriangle, BarChart2, Calendar, UserCheck,
  ArrowRight, Minus,
} from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────

const toISO = (d) => d.toISOString().slice(0, 10);

const PRESETS = [
  { label: "1 oy",  getDates: () => { const e = new Date(); const s = new Date(); s.setMonth(s.getMonth()-1); return { startDate: toISO(s), endDate: toISO(e) }; } },
  { label: "3 oy",  getDates: () => { const e = new Date(); const s = new Date(); s.setMonth(s.getMonth()-3); return { startDate: toISO(s), endDate: toISO(e) }; } },
  { label: "6 oy",  getDates: () => { const e = new Date(); const s = new Date(); s.setMonth(s.getMonth()-6); return { startDate: toISO(s), endDate: toISO(e) }; } },
  { label: "1 yil", getDates: () => { const e = new Date(); const s = new Date(); s.setFullYear(s.getFullYear()-1); return { startDate: toISO(s), endDate: toISO(e) }; } },
];

const STATUS_META = {
  new:       { label: "Yangi",           color: "#94a3b8" },
  contacted: { label: "Bog'lashildi",    color: "#f59e0b" },
  interested:{ label: "Qiziqdi",         color: "#8b5cf6" },
  scheduled: { label: "Rejalashtirildi", color: "#3b82f6" },
  converted: { label: "Qabul qilindi",   color: "#10b981" },
  rejected:  { label: "Rad etildi",      color: "#ef4444" },
};

const FUNNEL_STEPS = ["new", "contacted", "interested", "scheduled", "converted"];

const REJECTION_COLORS = ["#ef4444","#f97316","#f59e0b","#8b5cf6","#64748b"];
const SOURCE_COLORS    = ["#6366f1","#3b82f6","#10b981","#f59e0b","#ec4899","#14b8a6"];

const TT = {
  contentStyle: {
    borderRadius: "10px",
    border: "1px solid rgba(226,232,240,0.8)",
    boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
    backdropFilter: "blur(8px)",
    background: "rgba(255,255,255,0.94)",
    fontSize: "12px",
    padding: "8px 12px",
  },
  labelStyle: { color: "#64748B", fontSize: "11px", marginBottom: "3px", fontWeight: 600 },
};

const grid = { stroke: "#F1F5F9", strokeDasharray: "4 4" };
const tick = { fontSize: 10.5, fill: "#94A3B8" };

// ─── Micro Components ─────────────────────────────────────────────────────────

const Loader = ({ h = 200 }) => (
  <div className="flex flex-col items-center justify-center gap-3" style={{ height: h }}>
    <div className="relative w-9 h-9">
      <div className="absolute inset-0 rounded-full border-2 border-slate-100" />
      <div className="absolute inset-0 rounded-full border-2 border-t-indigo-500 animate-spin" />
    </div>
    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Yuklanmoqda</span>
  </div>
);

const Empty = ({ h = 160 }) => (
  <div className="flex flex-col items-center justify-center gap-2" style={{ height: h }}>
    <BarChart2 size={24} className="text-slate-200" strokeWidth={1.5} />
    <p className="text-xs text-slate-400">Ma'lumot yo'q</p>
  </div>
);

const GlassCard = ({ children, className = "", accent }) => (
  <div className={`relative overflow-hidden rounded-2xl border border-slate-100 bg-white/90 backdrop-blur-sm shadow-sm p-5 ${className}`}>
    {accent && <div className={`absolute inset-x-0 top-0 h-[3px] ${accent}`} />}
    {children}
  </div>
);

const CardTitle = ({ icon: Icon, iconBg, title, sub }) => (
  <div className="flex items-center gap-2.5 mb-4">
    <div className={`flex items-center justify-center w-8 h-8 rounded-xl ${iconBg}`}>
      <Icon size={15} strokeWidth={2} />
    </div>
    <div>
      <p className="text-sm font-semibold text-slate-800 leading-none">{title}</p>
      {sub && <p className="text-[10.5px] text-slate-400 mt-0.5">{sub}</p>}
    </div>
  </div>
);

const KpiCard = ({ icon: Icon, label, value, sub, accent, loading }) => (
  <GlassCard accent={accent}>
    <div className="flex items-start justify-between">
      <div>
        <p className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider mb-2">{label}</p>
        {loading
          ? <Skeleton className="h-8 w-20 rounded-lg" />
          : <p className="text-2xl font-black text-slate-800 tabular-nums leading-none">{value}</p>
        }
        {sub && !loading && <p className="text-[10.5px] text-slate-400 mt-1">{sub}</p>}
      </div>
      <div className="p-2 rounded-xl bg-slate-50">
        <Icon size={18} className="text-slate-500" strokeWidth={1.5} />
      </div>
    </div>
  </GlassCard>
);

// ─── Date Preset Bar ──────────────────────────────────────────────────────────

const DatePresetBar = ({ active, onSelect, dateRange, onChange }) => (
  <div className="flex flex-wrap items-center gap-2">
    <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100">
      {PRESETS.map((p, i) => (
        <button
          key={p.label}
          onClick={() => onSelect(i, p)}
          className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all ${
            active === i
              ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-100"
              : "text-slate-400 hover:text-slate-700"
          }`}
        >
          {p.label}
        </button>
      ))}
    </div>
    <div className="flex items-center gap-1.5 bg-white border border-slate-100 rounded-xl px-3 py-1.5 shadow-sm">
      <Calendar size={13} className="text-slate-300" />
      <input type="date" value={dateRange.startDate}
        onChange={(e) => { onSelect(-1); onChange({ ...dateRange, startDate: e.target.value }); }}
        className="text-[11px] font-bold text-slate-600 focus:outline-none bg-transparent"
      />
      <Minus size={10} className="text-slate-300" />
      <input type="date" value={dateRange.endDate}
        onChange={(e) => { onSelect(-1); onChange({ ...dateRange, endDate: e.target.value }); }}
        className="text-[11px] font-bold text-slate-600 focus:outline-none bg-transparent"
      />
    </div>
  </div>
);

// ─── Funnel Visualization ─────────────────────────────────────────────────────

const ConversionFunnel = ({ byStatus, total, loading }) => {
  const steps = FUNNEL_STEPS.map((key) => ({
    key,
    label: STATUS_META[key].label,
    color: STATUS_META[key].color,
    count: byStatus.find((s) => s.status === key)?.count ?? 0,
  }));

  return (
    <GlassCard accent="bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-500">
      <CardTitle icon={TrendingUp} iconBg="bg-indigo-50 text-indigo-600" title="Konversiya voronkasi" sub="Har bosqichda nechta lead qoldi" />
      {loading ? <Loader h={220} /> : (
        <div className="space-y-2.5">
          {steps.map((step, i) => {
            const pct  = total > 0 ? Math.round((step.count / total) * 100) : 0;
            const drop = i > 0 ? steps[i-1].count - step.count : 0;
            const dropPct = i > 0 && steps[i-1].count > 0
              ? Math.round((drop / steps[i-1].count) * 100)
              : 0;
            return (
              <div key={step.key}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-slate-400 w-4 tabular-nums">{i+1}</span>
                    <span className="text-xs font-semibold text-slate-700">{step.label}</span>
                    {i > 0 && drop > 0 && (
                      <span className="text-[10px] text-rose-400 font-bold bg-rose-50 px-1.5 py-0.5 rounded-full">
                        −{drop} ({dropPct}% tushdi)
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-slate-800 tabular-nums">{step.count}</span>
                    <span className="text-[10px] text-slate-400 w-8 text-right tabular-nums">{pct}%</span>
                  </div>
                </div>
                <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 rounded-full transition-all duration-700"
                    style={{ width: `${pct}%`, background: step.color }}
                  />
                </div>
              </div>
            );
          })}
          <div className="flex items-center gap-2 pt-3 mt-1 border-t border-slate-100">
            <ArrowRight size={14} className="text-emerald-500 shrink-0" strokeWidth={2.5} />
            <span className="text-xs text-slate-500">
              Jami <strong className="text-emerald-600">{byStatus.find(s=>s.status==="converted")?.count ?? 0}</strong> lead o'quvchiga aylandi
              {" "}({total > 0 ? Math.round(((byStatus.find(s=>s.status==="converted")?.count??0)/total)*100) : 0}% konversiya)
            </span>
          </div>
        </div>
      )}
    </GlassCard>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const LeadAnalyticsPage = () => {
  const [activePreset, setActivePreset] = useState(1);
  const [dateRange, setDateRange]       = useState(PRESETS[1].getDates());

  const params = useMemo(() => ({
    ...(dateRange.startDate && { startDate: dateRange.startDate }),
    ...(dateRange.endDate   && { endDate:   dateRange.endDate }),
  }), [dateRange]);

  const { data: leads, isLoading: ll } = useAppQuery({
    queryKey: ["statistics", "leads", params],
    queryFn:  () => statisticsAPI.getLeads(params),
    select:   (r) => r.data,
    staleTime: 60_000,
  });

  const { data: managers, isLoading: ml } = useAppQuery({
    queryKey: ["statistics", "lead-managers", params],
    queryFn:  () => statisticsAPI.getLeadManagers(params),
    select:   (r) => r.data,
    staleTime: 60_000,
  });

  const applyPreset = (idx, preset) => {
    setActivePreset(idx);
    if (idx >= 0) setDateRange(preset.getDates());
  };

  // Derived
  const byStatus   = leads?.byStatus ?? [];
  const totalLeads = leads?.totalLeads ?? 0;
  const convRate   = leads?.conversionRate ?? 0;
  const converted  = byStatus.find((s) => s.status === "converted")?.count ?? 0;
  const rejected   = byStatus.find((s) => s.status === "rejected")?.count ?? 0;
  const active     = totalLeads - converted - rejected;

  const monthlyTrend = (leads?.monthlyTrend ?? []).map((d) => ({
    label:     formatStatMonth(d),
    total:     d.total,
    converted: d.converted,
    lost:      d.total - d.converted,
  }));

  const rejectionData = (leads?.byRejectionReason ?? []).map((d, i) => ({
    name:  d.reason,
    count: d.count,
    color: REJECTION_COLORS[i % REJECTION_COLORS.length],
  }));

  const sourceData = (leads?.bySource ?? []).map((d, i) => ({
    name:  d.source,
    count: d.count,
    color: SOURCE_COLORS[i % SOURCE_COLORS.length],
  }));

  const statusOther = byStatus
    .filter((s) => !["converted","rejected"].includes(s.status))
    .map((s, i) => ({
      name:  STATUS_META[s.status]?.label ?? s.status,
      value: s.count,
      color: STATUS_META[s.status]?.color ?? "#94a3b8",
    }));

  const managerList = managers?.managers ?? [];

  return (
    <div className="space-y-6 pb-16">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 text-indigo-500 mb-1.5">
            <TrendingUp size={14} strokeWidth={2.5} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Lead tahlili</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Nima uchun leadlar talabaga aylanmayapti?</h1>
          <p className="text-sm text-slate-400 mt-1">Konversiya voronkasi, rad etish sabablari va menejer samaradorligi</p>
        </div>
        <DatePresetBar
          active={activePreset}
          onSelect={applyPreset}
          dateRange={dateRange}
          onChange={setDateRange}
        />
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard loading={ll} icon={Users}        label="Jami leadlar"   value={totalLeads} accent="bg-gradient-to-r from-indigo-400 to-blue-400" />
        <KpiCard loading={ll} icon={CheckCircle2} label="Qabul qilindi"  value={converted}  sub={`${convRate}% konversiya`} accent="bg-gradient-to-r from-emerald-400 to-teal-400" />
        <KpiCard loading={ll} icon={XCircle}      label="Rad etildi"     value={rejected}   sub={totalLeads > 0 ? `${Math.round(rejected/totalLeads*100)}% yo'qotish` : ""} accent="bg-gradient-to-r from-rose-400 to-red-400" />
        <KpiCard loading={ll} icon={UserCheck}    label="Jarayonda"      value={active}     sub="Hali qaror qilinmagan" accent="bg-gradient-to-r from-amber-400 to-orange-400" />
      </div>

      {/* Funnel + Rejection Reasons */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className="lg:col-span-3">
          <ConversionFunnel byStatus={byStatus} total={totalLeads} loading={ll} />
        </div>

        <div className="lg:col-span-2">
          <GlassCard accent="bg-gradient-to-r from-rose-400 to-orange-400" className="h-full">
            <CardTitle icon={AlertTriangle} iconBg="bg-rose-50 text-rose-500" title="Rad etish sabablari" sub="Nima uchun rad etildi?" />
            {ll ? <Loader h={200} /> : !rejectionData.length ? <Empty h={200} /> : (
              <div className="space-y-3">
                {rejectionData.map((item) => {
                  const pct = rejected > 0 ? Math.round((item.count / rejected) * 100) : 0;
                  return (
                    <div key={item.name}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-semibold text-slate-700 truncate max-w-[160px]">{item.name}</span>
                        <span className="font-black tabular-nums text-slate-800">{item.count} <span className="text-slate-400 font-normal">({pct}%)</span></span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${pct}%`, background: item.color }} />
                      </div>
                    </div>
                  );
                })}
                {!rejectionData.length && rejected > 0 && (
                  <p className="text-xs text-slate-400 text-center py-4">Rad etish sababi ko'rsatilmagan</p>
                )}
              </div>
            )}
          </GlassCard>
        </div>
      </div>

      {/* Monthly Trend */}
      <GlassCard accent="bg-gradient-to-r from-blue-400 to-cyan-500">
        <CardTitle icon={Calendar} iconBg="bg-blue-50 text-blue-600" title="Oylik konversiya trendi" sub="Jami va qabul qilingan leadlar dinamikasi" />
        <div className="flex items-center gap-5 mb-4">
          {[
            { color: "#3b82f6", label: "Jami leadlar" },
            { color: "#10b981", label: "Qabul qilindi" },
            { color: "#f43f5e", label: "Yo'qotildi" },
          ].map((l) => (
            <span key={l.label} className="flex items-center gap-1.5 text-[10.5px] font-medium text-slate-500">
              <span className="inline-block w-3 h-[2.5px] rounded-full" style={{ background: l.color }} />
              {l.label}
            </span>
          ))}
        </div>
        {ll ? <Loader h={240} /> : !monthlyTrend.length ? <Empty h={240} /> : (
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={monthlyTrend} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <defs>
                {[
                  { id: "trendTotal", color: "#3b82f6" },
                  { id: "trendConv",  color: "#10b981" },
                  { id: "trendLost",  color: "#f43f5e" },
                ].map(({ id, color }) => (
                  <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor={color} stopOpacity={0.20} />
                    <stop offset="100%" stopColor={color} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid vertical={false} {...grid} />
              <XAxis dataKey="label" axisLine={false} tickLine={false} dy={8} tick={tick} />
              <YAxis axisLine={false} tickLine={false} tick={tick} allowDecimals={false} />
              <Tooltip {...TT} cursor={{ stroke: "#E2E8F0", strokeWidth: 1 }}
                formatter={(v, n) =>
                  n === "total" ? [v, "Jami"] :
                  n === "converted" ? [v, "Qabul qilindi"] :
                  n === "lost" ? [v, "Yo'qotildi"] : [v, n]
                }
              />
              <Area type="monotone" dataKey="total"     name="total"     stroke="#3b82f6" strokeWidth={2.5} fill="url(#trendTotal)" dot={false} activeDot={{ r: 5, fill: "#3b82f6", stroke: "#fff", strokeWidth: 2 }} />
              <Area type="monotone" dataKey="converted" name="converted" stroke="#10b981" strokeWidth={2.5} fill="url(#trendConv)"  dot={false} activeDot={{ r: 5, fill: "#10b981", stroke: "#fff", strokeWidth: 2 }} />
              <Area type="monotone" dataKey="lost"      name="lost"      stroke="#f43f5e" strokeWidth={2}   fill="url(#trendLost)"  dot={false} activeDot={{ r: 4, fill: "#f43f5e", stroke: "#fff", strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </GlassCard>

      {/* Source + Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        <GlassCard accent="bg-gradient-to-r from-violet-400 to-purple-500">
          <CardTitle icon={BarChart2} iconBg="bg-violet-50 text-violet-600" title="Manbalar bo'yicha" sub="Qayerdan kelgan leadlar ko'proq konversiya beradi?" />
          {ll ? <Loader h={200} /> : !sourceData.length ? <Empty h={200} /> : (
            <div className="space-y-3">
              {sourceData.map((item) => {
                const pct = totalLeads > 0 ? Math.round((item.count / totalLeads) * 100) : 0;
                return (
                  <div key={item.name}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-semibold text-slate-700">{item.name}</span>
                      <span className="font-black tabular-nums text-slate-800">{item.count} <span className="text-slate-400 font-normal">({pct}%)</span></span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, background: item.color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </GlassCard>

        <GlassCard accent="bg-gradient-to-r from-slate-400 to-slate-500">
          <CardTitle icon={Users} iconBg="bg-slate-50 text-slate-600" title="Holat taqsimoti" sub="Leadlar hozir qaysi bosqichda?" />
          {ll ? <Loader h={200} /> : !statusOther.length ? <Empty h={200} /> : (
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center justify-center">
                <ResponsiveContainer width={150} height={150}>
                  <PieChart>
                    <Pie data={[...statusOther,
                        { name: "Qabul", value: converted, color: "#10b981" },
                        { name: "Rad",   value: rejected,  color: "#f43f5e" },
                      ]}
                      dataKey="value" cx="50%" cy="50%"
                      innerRadius={42} outerRadius={62}
                      paddingAngle={3} strokeWidth={2} stroke="#fff"
                    >
                      {[...statusOther,
                        { color: "#10b981" }, { color: "#f43f5e" }
                      ].map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip {...TT} formatter={(v) => [v, "Lead"]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-col justify-center gap-2">
                {[
                  ...statusOther,
                  { name: "Qabul qilindi", value: converted, color: "#10b981" },
                  { name: "Rad etildi",    value: rejected,  color: "#f43f5e" },
                ].map((item) => {
                  const pct = totalLeads > 0 ? Math.round((item.value / totalLeads) * 100) : 0;
                  return (
                    <div key={item.name} className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ background: item.color }} />
                      <span className="text-[10.5px] text-slate-600 flex-1 truncate">{item.name}</span>
                      <span className="text-[10.5px] font-black text-slate-800 tabular-nums">{item.value}</span>
                      <span className="text-[9.5px] text-slate-400 w-7 text-right">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </GlassCard>
      </div>

      {/* Manager Performance */}
      <GlassCard accent="bg-gradient-to-r from-amber-400 to-yellow-400">
        <CardTitle icon={UserCheck} iconBg="bg-amber-50 text-amber-600" title="Menejer samaradorligi" sub="Kim ko'proq lead oldi va qanday konversiya qildi?" />
        {ml ? <Loader h={160} /> : !managerList.length ? <Empty h={160} /> : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  {["Menejer", "Jami", "Qabul", "Rad", "Jarayonda", "Konversiya"].map((h) => (
                    <th key={h} className="text-left pb-3 pr-4 text-[10px] font-black text-slate-400 uppercase tracking-wider last:text-right">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {managerList.map((m) => {
                  const inProgress = m.total - m.converted - m.rejected;
                  const rate = m.conversionRate ?? 0;
                  const rateColor = rate >= 30 ? "#10b981" : rate >= 15 ? "#f59e0b" : "#f43f5e";
                  return (
                    <tr key={m.managerId} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-black shrink-0">
                            {m.name?.split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-slate-800 leading-none">{m.name || "—"}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5 capitalize">{m.role}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-xs font-bold text-slate-700 tabular-nums">{m.total}</td>
                      <td className="py-3 pr-4 text-xs font-bold text-emerald-600 tabular-nums">{m.converted}</td>
                      <td className="py-3 pr-4 text-xs font-bold text-rose-500 tabular-nums">{m.rejected}</td>
                      <td className="py-3 pr-4 text-xs font-bold text-amber-600 tabular-nums">{inProgress}</td>
                      <td className="py-3 text-right">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-black"
                          style={{ color: rateColor, background: `${rateColor}18` }}>
                          {rate}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>

      {/* Insight Box */}
      <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-violet-50 p-5">
        <div className="flex gap-3">
          <div className="p-2 bg-indigo-100 rounded-xl shrink-0">
            <AlertTriangle size={16} className="text-indigo-600" strokeWidth={2} />
          </div>
          <div>
            <p className="text-xs font-black text-indigo-800 mb-2 uppercase tracking-wide">Tahlil xulosasi</p>
            <div className="space-y-1.5 text-xs text-indigo-700 leading-relaxed">
              {totalLeads > 0 && convRate < 20 && (
                <p>• Konversiya ({convRate}%) past. Rad etish sabablari tahlil qiling — narx yoki munosib kurs yo'qligini tekshiring.</p>
              )}
              {rejectionData[0] && (
                <p>• Asosiy rad sababi: <strong>"{rejectionData[0].name}"</strong> ({Math.round(rejectionData[0].count / (rejected||1) * 100)}% hollarda).</p>
              )}
              {sourceData[0] && (
                <p>• Eng ko'p lead: <strong>{sourceData[0].name}</strong> ({sourceData[0].count} ta). Shu manbaga e'tibor kuchaytiring.</p>
              )}
              {managerList[0] && (
                <p>• Samaraliroq menejer: <strong>{managerList.sort((a,b)=>b.conversionRate-a.conversionRate)[0]?.name}</strong> ({managerList.sort((a,b)=>b.conversionRate-a.conversionRate)[0]?.conversionRate}% konversiya).</p>
              )}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default LeadAnalyticsPage;
