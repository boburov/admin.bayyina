import { useQuery } from "@tanstack/react-query";

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  LineChart, Line, CartesianGrid, Legend,
  PieChart, Pie,
} from "recharts";

import { statisticsAPI } from "@/features/statistics/api/statistics.api";
import {
  formatStatMonth,
  CHART_COLORS,
  LEAD_STATUS_LABELS,
} from "@/features/statistics/data/statistics.data";

import { FUNNEL_STEPS, STATUS_BADGE } from "../data/leads.data";
import Card from "@/shared/components/ui/Card";
import { TrendingUp, Users, XCircle, CheckCircle2, Activity } from "lucide-react";

const FUNNEL_COLORS   = ["#6366f1", "#f59e0b", "#8b5cf6", "#14b8a6", "#22c55e"];
const STATUS_COLORS   = ["#94a3b8", "#f59e0b", "#8b5cf6", "#6366f1", "#22c55e", "#ef4444"];

const Loader = () => (
  <div className="flex items-center justify-center h-full min-h-[140px]">
    <div className="w-6 h-6 rounded-full border-2 border-gray-200 border-t-brown-800 animate-spin" />
  </div>
);

const Empty = ({ text = "Ma'lumot yo'q" }) => (
  <div className="flex flex-col items-center justify-center min-h-[140px] text-center gap-2">
    <Activity size={24} className="text-gray-200" strokeWidth={1.5} />
    <p className="text-xs text-gray-400">{text}</p>
  </div>
);

const KpiCard = ({ icon: Icon, label, value, sub, color }) => {
  const colors = {
    blue:   { bg: "bg-blue-50",   text: "text-blue-700",   icon: "text-blue-500"   },
    green:  { bg: "bg-green-50",  text: "text-green-700",  icon: "text-green-500"  },
    red:    { bg: "bg-red-50",    text: "text-red-700",    icon: "text-red-500"    },
    purple: { bg: "bg-purple-50", text: "text-purple-700", icon: "text-purple-500" },
  }[color] ?? { bg: "bg-gray-50", text: "text-gray-700", icon: "text-gray-500" };

  return (
    <Card className="flex items-center gap-3 !py-4">
      <div className={`${colors.bg} ${colors.icon} p-2.5 rounded-sm shrink-0`}>
        <Icon size={18} strokeWidth={1.5} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500 truncate">{label}</p>
        <p className={`text-xl font-bold leading-tight mt-0.5 ${colors.text}`}>{value}</p>
        {sub && <p className="text-xs text-gray-400 truncate">{sub}</p>}
      </div>
    </Card>
  );
};

const TOOLTIP_STYLE = {
  contentStyle: {
    fontSize: 12,
    borderRadius: 6,
    border: "1px solid #E5E7EB",
    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
  },
  labelStyle: { fontWeight: 600, color: "#374151" },
};

const LeadsFunnel = ({ leads = [] }) => {
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ["statistics", "leads"],
    queryFn:  () => statisticsAPI.getLeads().then((r) => r.data.data ?? r.data),
    staleTime: 60_000,
  });

  // KPI values from server stats (authoritative) or fallback to local leads
  const serverTotal     = statsData?.totalLeads ?? leads.length;
  const serverConverted = statsData?.byStatus?.find((s) => s.status === "converted")?.count ?? 0;
  const serverCancelled = statsData?.byStatus?.find((s) => s.status === "rejected")?.count ?? 0;
  const serverRate      = statsData?.conversionRate ?? (
    serverTotal > 0 ? Math.round((serverConverted / serverTotal) * 100) : 0
  );

  // Monthly trend for line chart
  const trendData = (statsData?.monthlyTrend ?? []).map((d) => ({
    label:     formatStatMonth(d),
    total:     d.total,
    converted: d.converted,
    cancelled: d.cancelled ?? 0,
  }));

  // Status distribution for donut
  const statusDist = (statsData?.byStatus ?? []).map((s, i) => ({
    name:  LEAD_STATUS_LABELS[s.status] ?? s.status,
    value: s.count,
    fill:  STATUS_COLORS[i % STATUS_COLORS.length],
  }));

  // Funnel from local leads (paginated view) OR server byStatus
  const counts = {};
  for (const lead of leads) {
    counts[lead.status] = (counts[lead.status] || 0) + 1;
  }

  const funnelData = FUNNEL_STEPS.map((s) => ({
    name:  s.label,
    count: statsData
      ? (statsData.byStatus?.find((b) => b.status === s.key)?.count ?? 0)
      : (counts[s.key] || 0),
  }));

  // Source distribution
  const sourceCounts = {};
  for (const lead of leads) {
    if (lead.source) {
      const name = lead.source?.name ?? lead.source;
      sourceCounts[name] = (sourceCounts[name] || 0) + 1;
    }
  }
  const sourceData = Object.entries(sourceCounts)
    .sort(([, a], [, b]) => b - a)
    .map(([name, count]) => ({ name, count }));

  return (
    <div className="space-y-4 mb-6">
      {/* KPI row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KpiCard icon={Users}        label="Jami leadlar"   value={serverTotal}           color="blue"   />
        <KpiCard icon={CheckCircle2} label="Qabul qilindi"  value={serverConverted}        color="green"  />
        <KpiCard icon={XCircle}      label="Bekor qilindi"  value={serverCancelled}        color="red"    />
        <KpiCard
          icon={TrendingUp}
          label="Konversiya"
          value={`${serverRate}%`}
          sub={`${serverConverted} / ${serverTotal} lead`}
          color="purple"
        />
      </div>

      {/* Line chart + Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Leads over time — line chart */}
        <Card title="Leadlar dinamikasi (6 oy)" className="lg:col-span-2 h-72">
          {statsLoading ? <Loader /> : !trendData.length ? (
            <Empty text="Oylik ma'lumot yo'q" />
          ) : (
            <>
              <div className="flex items-center gap-4 mb-2">
                <span className="flex items-center gap-1.5 text-xs text-gray-500">
                  <span className="inline-block w-3 h-0.5 rounded bg-blue-500" />
                  Jami
                </span>
                <span className="flex items-center gap-1.5 text-xs text-gray-500">
                  <span className="inline-block w-3 h-0.5 rounded bg-green-500" />
                  Qabul qilindi
                </span>
              </div>
              <ResponsiveContainer width="100%" height="88%">
                <LineChart
                  data={trendData}
                  margin={{ top: 8, right: 16, left: -8, bottom: 32 }}
                >
                  <CartesianGrid vertical={false} stroke="#F3F4F6" strokeDasharray="3 3" />
                  <XAxis
                    dataKey="label"
                    axisLine={false} tickLine={false} dy={10}
                    tick={{ fontSize: 11, fill: "#9CA3AF" }}
                  />
                  <YAxis
                    axisLine={false} tickLine={false}
                    tick={{ fontSize: 11, fill: "#9CA3AF" }}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={TOOLTIP_STYLE.contentStyle}
                    labelStyle={TOOLTIP_STYLE.labelStyle}
                    cursor={{ stroke: "#E5E7EB", strokeWidth: 1 }}
                    formatter={(val, name) => {
                      if (name === "total")     return [val, "Jami leadlar"];
                      if (name === "converted") return [val, "Qabul qilindi"];
                      return [val, name];
                    }}
                  />
                  <Line
                    type="monotone" dataKey="total" name="total"
                    stroke={CHART_COLORS.blue} strokeWidth={2.5}
                    dot={false} activeDot={{ r: 5, strokeWidth: 2, stroke: "#fff" }}
                  />
                  <Line
                    type="monotone" dataKey="converted" name="converted"
                    stroke={CHART_COLORS.green} strokeWidth={2.5}
                    dot={false} activeDot={{ r: 5, strokeWidth: 2, stroke: "#fff" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </>
          )}
        </Card>

        {/* Donut — status distribution */}
        <Card title="Holat taqsimoti">
          {statsLoading ? <Loader /> : !statusDist.length ? (
            <Empty />
          ) : (
            <div className="flex flex-col gap-3">
              <div className="h-36 mx-auto w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusDist}
                      dataKey="value"
                      nameKey="name"
                      cx="50%" cy="50%"
                      innerRadius="45%" outerRadius="75%"
                      paddingAngle={2}
                      strokeWidth={2}
                      stroke="#fff"
                    >
                      {statusDist.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={TOOLTIP_STYLE.contentStyle}
                      labelStyle={TOOLTIP_STYLE.labelStyle}
                      formatter={(v) => [v, "Lead"]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-1.5">
                {statusDist.map((s) => {
                  const pct = serverTotal > 0 ? Math.round((s.value / serverTotal) * 100) : 0;
                  return (
                    <div key={s.name} className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: s.fill }} />
                      <span className="text-xs text-gray-600 flex-1 truncate">{s.name}</span>
                      <span className="text-xs font-semibold text-gray-800 tabular-nums">{s.value}</span>
                      <span className="text-xs text-gray-400 w-8 text-right tabular-nums">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Funnel bar + Source distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card title="Voronka (jarayon bosqichlari)">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={funnelData} layout="vertical" margin={{ left: 8, right: 16 }}>
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={128} />
              <Tooltip
                contentStyle={TOOLTIP_STYLE.contentStyle}
                labelStyle={TOOLTIP_STYLE.labelStyle}
                formatter={(v) => [v, "Lead"]}
              />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {funnelData.map((_, i) => (
                  <Cell key={i} fill={FUNNEL_COLORS[i % FUNNEL_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Manbalar bo'yicha">
          {sourceData.length === 0 ? (
            <Empty text="Manba ma'lumoti yo'q" />
          ) : (
            <div className="space-y-2.5 py-1">
              {sourceData.map((s, i) => {
                const pct = leads.length > 0 ? Math.round((s.count / leads.length) * 100) : 0;
                return (
                  <div key={s.name}>
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span className="font-medium">{s.name}</span>
                      <span>{s.count} ({pct}%)</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div
                        className="h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, background: FUNNEL_COLORS[i % FUNNEL_COLORS.length] }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default LeadsFunnel;
