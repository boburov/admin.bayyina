// Recharts
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

// Data
import { FUNNEL_STEPS } from "../data/leads.data";

// Components
import Card from "@/shared/components/ui/Card";

const COLORS = ["#3b82f6", "#f59e0b", "#8b5cf6", "#6366f1", "#10b981"];

const LeadsFunnel = ({ leads = [] }) => {
  // Count leads per status
  const counts = {};
  for (const lead of leads) {
    counts[lead.status] = (counts[lead.status] || 0) + 1;
  }

  // Compute source distribution
  const sources = {};
  for (const lead of leads) {
    if (lead.source) sources[lead.source] = (sources[lead.source] || 0) + 1;
  }

  const funnelData = FUNNEL_STEPS.map((s) => ({
    name:  s.label,
    count: counts[s.key] || 0,
  }));

  const sourceData = Object.entries(sources)
    .sort(([, a], [, b]) => b - a)
    .map(([name, count]) => ({ name, count }));

  const total     = leads.length;
  const converted = counts.converted || 0;
  const rejected  = counts.rejected  || 0;
  const convRate  = total > 0 ? ((converted / total) * 100).toFixed(1) : "0.0";
  const dropRate  = total > 0 ? ((rejected  / total) * 100).toFixed(1) : "0.0";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      {/* KPI row */}
      <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Jami leadlar",    value: total,      color: "text-gray-900" },
          { label: "Qabul qilindi",   value: converted,  color: "text-green-600" },
          { label: "Rad etildi",      value: rejected,   color: "text-red-500" },
          { label: "Konversiya",      value: convRate + "%", color: "text-blue-600" },
        ].map((k) => (
          <Card key={k.label} className="!py-3">
            <p className={`text-xl font-bold ${k.color}`}>{k.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{k.label}</p>
          </Card>
        ))}
      </div>

      {/* Funnel chart */}
      <Card title="Voronka (Funnel)">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={funnelData} layout="vertical" margin={{ left: 8, right: 16 }}>
            <XAxis type="number" tick={{ fontSize: 11 }} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={120} />
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 6, border: "1px solid #e5e7eb" }}
              formatter={(v) => [v, "Lead"]}
            />
            <Bar dataKey="count" radius={[0, 4, 4, 0]}>
              {funnelData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Source distribution */}
      <Card title="Manbalar bo'yicha">
        {sourceData.length === 0 ? (
          <p className="text-sm text-gray-400 py-8 text-center">Ma'lumot yo'q</p>
        ) : (
          <div className="space-y-2.5 py-1">
            {sourceData.map((s, i) => {
              const pct = total > 0 ? Math.round((s.count / total) * 100) : 0;
              return (
                <div key={s.name}>
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span className="font-medium">{s.name}</span>
                    <span>{s.count} ({pct}%)</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div
                      className="h-1.5 rounded-full"
                      style={{ width: `${pct}%`, background: COLORS[i % COLORS.length] }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
};

export default LeadsFunnel;
