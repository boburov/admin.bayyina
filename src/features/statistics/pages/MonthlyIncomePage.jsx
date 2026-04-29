import { useState, useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from "recharts";
import { useAppQuery } from "@/shared/lib/query/query-hooks";
import { statisticsAPI } from "@/features/statistics/api/statistics.api";
import {
  formatMoneyFull,
  formatMoney,
  TOOLTIP_STYLE,
} from "@/features/statistics/data/statistics.data";
import Card from "@/shared/components/ui/Card";
import { Skeleton } from "@/shared/components/shadcn/skeleton";
import {
  TrendingUp, Wallet, CalendarDays, CreditCard,
  ChevronLeft, ChevronRight, BarChart2,
} from "lucide-react";

const UZ_MONTHS = [
  "Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun",
  "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr",
];

const GRID = { stroke: "#F3F4F6", strokeDasharray: "3 3" };
const TICK = { fontSize: 11, fill: "#9CA3AF", fontWeight: 500 };

const BAR_COLORS = [
  "#6366f1","#3b82f6","#22c55e","#f59e0b","#ef4444","#8b5cf6",
  "#14b8a6","#ec4899","#f97316","#64748b","#0ea5e9","#a855f7",
];

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center gap-3 py-16">
    <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-200">
      <BarChart2 size={28} strokeWidth={1.5} />
    </div>
    <p className="text-xs text-gray-400 font-medium uppercase tracking-tight">
      Ma&apos;lumot mavjud emas
    </p>
  </div>
);

const KPICard = ({ label, value, sub, icon: Icon, color, loading }) => {
  const cfg = {
    green:  { bg: "bg-green-50",  text: "text-green-700",  icon: "text-green-500",  border: "border-green-100" },
    blue:   { bg: "bg-blue-50",   text: "text-blue-700",   icon: "text-blue-500",   border: "border-blue-100" },
    amber:  { bg: "bg-amber-50",  text: "text-amber-700",  icon: "text-amber-500",  border: "border-amber-100" },
    purple: { bg: "bg-purple-50", text: "text-purple-700", icon: "text-purple-500", border: "border-purple-100" },
  }[color] ?? {};

  return (
    <div className={`relative overflow-hidden bg-white border ${cfg.border} rounded-2xl p-5 shadow-sm hover:shadow-md transition-all`}>
      <div className="flex justify-between items-start">
        <div className="space-y-3">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{label}</p>
          {loading ? (
            <Skeleton className="h-8 w-28 rounded-lg" />
          ) : (
            <h3 className={`text-2xl font-black ${cfg.text} tracking-tight tabular-nums`}>{value}</h3>
          )}
          {sub && !loading && <p className="text-[10px] text-gray-400 font-medium">{sub}</p>}
        </div>
        <div className={`${cfg.bg} ${cfg.icon} p-2.5 rounded-xl`}>
          <Icon size={20} strokeWidth={1.5} />
        </div>
      </div>
    </div>
  );
};

const MonthlyIncomePage = () => {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);

  const { data, isLoading } = useAppQuery({
    queryKey: ["statistics", "monthly-income", year],
    queryFn:  () => statisticsAPI.getMonthlyIncome({ year }),
    select:   (r) => r.data,
    staleTime: 60_000,
  });

  const months     = data?.months     ?? [];
  const summary    = data?.summary    ?? {};
  const bestMonth  = summary.bestMonth;

  const chartData = useMemo(() =>
    months.map((m) => ({
      name:  UZ_MONTHS[m.month - 1].slice(0, 3),
      paid:  m.paid,
      label: UZ_MONTHS[m.month - 1],
    })),
  [months]);

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 pb-20">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2 text-brown-800 mb-2">
            <TrendingUp size={15} strokeWidth={2.5} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Moliyaviy hisobot</span>
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Oylik Daromad Statistikasi</h1>
          <p className="text-sm text-gray-400 font-medium mt-1">Yillik to&apos;lov tushumi oylar bo&apos;yicha tahlili</p>
        </div>

        {/* Year picker */}
        <div className="flex items-center gap-1 bg-white border border-gray-100 rounded-xl shadow-sm p-1">
          <button
            onClick={() => setYear((y) => y - 1)}
            className="p-2 rounded-lg hover:bg-gray-50 text-gray-400 hover:text-gray-700 transition-colors"
          >
            <ChevronLeft size={16} strokeWidth={2} />
          </button>
          <span className="px-4 text-sm font-black text-gray-800 min-w-[60px] text-center">
            {year}
          </span>
          <button
            onClick={() => setYear((y) => y + 1)}
            disabled={year >= currentYear}
            className="p-2 rounded-lg hover:bg-gray-50 text-gray-400 hover:text-gray-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight size={16} strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <KPICard
          loading={isLoading}
          label="Yillik jami tushum"
          value={formatMoneyFull(summary.totalPaid)}
          icon={Wallet}
          color="green"
          sub={`${year}-yil uchun`}
        />
        <KPICard
          loading={isLoading}
          label="Jami to'lovlar soni"
          value={summary.totalPayments ?? 0}
          icon={CreditCard}
          color="blue"
          sub="To'langan to'lovlar"
        />
        <KPICard
          loading={isLoading}
          label="O'rtacha oylik"
          value={formatMoneyFull(summary.avgPerMonth)}
          icon={TrendingUp}
          color="purple"
          sub="Oyiga o'rtacha"
        />
        <KPICard
          loading={isLoading}
          label="Eng yaxshi oy"
          value={bestMonth ? UZ_MONTHS[bestMonth - 1] : "—"}
          icon={CalendarDays}
          color="amber"
          sub={bestMonth ? formatMoneyFull(months[bestMonth - 1]?.paid) : ""}
        />
      </div>

      {/* Bar Chart */}
      <Card className="!p-6 rounded-3xl shadow-sm border-gray-100">
        <h3 className="text-sm font-bold text-gray-800 uppercase tracking-tight mb-6">
          {year}-yil oylik daromad grafigi
        </h3>
        {isLoading ? (
          <Skeleton className="w-full h-64 rounded-xl" />
        ) : !chartData.some((d) => d.paid > 0) ? (
          <EmptyState />
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData} margin={{ top: 4, right: 8, left: -8, bottom: 0 }}>
              <CartesianGrid vertical={false} {...GRID} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={TICK} dy={8} />
              <YAxis axisLine={false} tickLine={false} tick={TICK} tickFormatter={formatMoney} width={50} />
              <Tooltip
                {...TOOLTIP_STYLE}
                formatter={(v, _, { payload }) => [formatMoneyFull(v), payload.label]}
                cursor={{ fill: "rgba(241,245,249,0.7)" }}
              />
              <Bar dataKey="paid" radius={[6, 6, 0, 0]} maxBarSize={48}>
                {chartData.map((_, i) => (
                  <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>

      {/* Monthly Table */}
      <Card className="!p-0 rounded-3xl shadow-sm border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-sm font-bold text-gray-800 uppercase tracking-tight">
            Oylar bo&apos;yicha batafsil
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider">Oy</th>
                <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider text-right">To&apos;langan</th>
                <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider text-right">To&apos;lov soni</th>
                <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider text-right">Kutilmoqda</th>
                <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider text-right">Muddati o&apos;tgan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading
                ? Array.from({ length: 12 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-6 py-3.5"><Skeleton className="h-4 w-20 rounded" /></td>
                      <td className="px-6 py-3.5 text-right"><Skeleton className="h-4 w-24 rounded ml-auto" /></td>
                      <td className="px-6 py-3.5 text-right"><Skeleton className="h-4 w-10 rounded ml-auto" /></td>
                      <td className="px-6 py-3.5 text-right"><Skeleton className="h-4 w-24 rounded ml-auto" /></td>
                      <td className="px-6 py-3.5 text-right"><Skeleton className="h-4 w-24 rounded ml-auto" /></td>
                    </tr>
                  ))
                : months.map((m, i) => {
                    const isBest = m.month === bestMonth && m.paid > 0;
                    return (
                      <tr
                        key={m.month}
                        className={`hover:bg-gray-50/60 transition-colors ${isBest ? "bg-green-50/40" : ""}`}
                      >
                        <td className="px-6 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div
                              className="w-2.5 h-2.5 rounded-full shrink-0"
                              style={{ background: BAR_COLORS[i % BAR_COLORS.length] }}
                            />
                            <span className="font-semibold text-gray-700">{UZ_MONTHS[m.month - 1]}</span>
                            {isBest && (
                              <span className="text-[9px] font-black bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full uppercase">
                                Eng yaxshi
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-3.5 text-right font-bold text-green-700 tabular-nums">
                          {m.paid > 0 ? formatMoneyFull(m.paid) : <span className="text-gray-300">—</span>}
                        </td>
                        <td className="px-6 py-3.5 text-right tabular-nums">
                          {m.paidCount > 0 ? (
                            <span className="font-black text-gray-700">{m.paidCount}</span>
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>
                        <td className="px-6 py-3.5 text-right text-amber-600 tabular-nums">
                          {m.pending > 0 ? formatMoneyFull(m.pending) : <span className="text-gray-300">—</span>}
                        </td>
                        <td className="px-6 py-3.5 text-right text-red-500 tabular-nums">
                          {m.overdue > 0 ? formatMoneyFull(m.overdue) : <span className="text-gray-300">—</span>}
                        </td>
                      </tr>
                    );
                  })}
            </tbody>
            {!isLoading && months.length > 0 && (
              <tfoot>
                <tr className="bg-gray-50 border-t border-gray-200">
                  <td className="px-6 py-3.5 text-[11px] font-black text-gray-500 uppercase tracking-wider">
                    Jami
                  </td>
                  <td className="px-6 py-3.5 text-right font-black text-green-700 tabular-nums">
                    {formatMoneyFull(summary.totalPaid)}
                  </td>
                  <td className="px-6 py-3.5 text-right font-black text-gray-700 tabular-nums">
                    {summary.totalPayments ?? 0}
                  </td>
                  <td className="px-6 py-3.5 text-right font-black text-amber-600 tabular-nums">
                    {formatMoneyFull(months.reduce((s, m) => s + m.pending, 0))}
                  </td>
                  <td className="px-6 py-3.5 text-right font-black text-red-500 tabular-nums">
                    {formatMoneyFull(months.reduce((s, m) => s + m.overdue, 0))}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </Card>
    </div>
  );
};

export default MonthlyIncomePage;
