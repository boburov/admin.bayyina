import { useState } from "react";
import { Trophy, Star, RefreshCw, Download } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { ratingsAPI } from "@/features/ratings/api/ratings.api";
import { periodOptions } from "@/features/ratings/data/ratings.data";
import { formatUzDate } from "@/shared/utils/formatDate";
import Button from "@/shared/components/ui/button/Button";
import { Skeleton } from "@/shared/components/shadcn/skeleton";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const toISO = (d) => d.toISOString().slice(0, 10);

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return toISO(d);
}

function RankBadge({ rank }) {
  if (rank === 1) return <span className="font-bold text-amber-500">🥇 1</span>;
  if (rank === 2) return <span className="font-bold text-gray-400">🥈 2</span>;
  if (rank === 3) return <span className="font-bold text-amber-700">🥉 3</span>;
  return <span className="font-mono text-gray-500 text-sm">{rank}</span>;
}

function StarsDisplay({ avg }) {
  if (avg == null) return <span className="text-gray-300 text-xs">—</span>;
  return (
    <span className="text-amber-400 font-medium text-sm">
      {"★".repeat(Math.round(avg))}
      <span className="text-gray-400 text-xs ml-1">{avg.toFixed(1)}</span>
    </span>
  );
}

function ScoreBar({ score, max }) {
  const pct = max > 0 ? Math.round((score / max) * 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden min-w-[80px]">
        <div
          className="h-full bg-amber-400 rounded-full"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-mono text-gray-600 w-10 text-right">{score}</span>
    </div>
  );
}

// ─── Config modal ─────────────────────────────────────────────────────────────

function ConfigPanel({ config, onSave }) {
  const [form, setForm] = useState({
    attendedDayPoints: config?.attendedDayPoints ?? 10,
    starMultiplier:    config?.starMultiplier    ?? 2,
    lookbackDays:      config?.lookbackDays      ?? 30,
  });

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
      <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-3">
        Ball formulasi sozlamalari
      </p>
      <div className="flex flex-wrap gap-4 mb-3">
        <label className="flex flex-col gap-1 text-xs text-gray-600">
          Kun bali
          <input
            type="number"
            min={0}
            value={form.attendedDayPoints}
            onChange={(e) => setForm((p) => ({ ...p, attendedDayPoints: Number(e.target.value) }))}
            className="w-20 h-8 px-2 border border-gray-200 rounded text-sm focus:outline-none"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-gray-600">
          Yulduz ko'paytmasi
          <input
            type="number"
            min={0}
            value={form.starMultiplier}
            onChange={(e) => setForm((p) => ({ ...p, starMultiplier: Number(e.target.value) }))}
            className="w-20 h-8 px-2 border border-gray-200 rounded text-sm focus:outline-none"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-gray-600">
          Standart kunlar
          <input
            type="number"
            min={1}
            value={form.lookbackDays}
            onChange={(e) => setForm((p) => ({ ...p, lookbackDays: Number(e.target.value) }))}
            className="w-20 h-8 px-2 border border-gray-200 rounded text-sm focus:outline-none"
          />
        </label>
      </div>
      <p className="text-xs text-gray-500 mb-3">
        Ball = (qatnashgan kun × {form.attendedDayPoints}) + (yulduzlar × {form.starMultiplier})
      </p>
      <Button size="sm" onClick={() => onSave(form)}>Saqlash</Button>
    </div>
  );
}

// ─── CSV export ───────────────────────────────────────────────────────────────

function exportCSV(stats, from, to) {
  const header = "O'rin,Ism,Guruh,Qatnashgan,Jami,Qatnashmagan,O'rtacha yulduz,Ball";
  const rows = stats.map((s) => [
    s.rankGlobal,
    `${s.student.firstName} ${s.student.lastName}`,
    s.group?.name ?? "",
    s.totalPresent,
    s.totalSessions,
    s.totalAbsent,
    s.avgStars?.toFixed(2) ?? "",
    s.score,
  ].join(","));
  const csv = [header, ...rows].join("\n");
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `reyting_${from}_${to}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const RatingsPage = () => {
  const queryClient = useQueryClient();
  const today   = toISO(new Date());
  const [from,  setFrom]     = useState(daysAgo(30));
  const [to,    setTo]       = useState(today);
  const [group, setGroup]    = useState("");
  const [applied, setApplied] = useState({ from: daysAgo(30), to: today, group: "" });
  const [showConfig, setShowConfig] = useState(false);

  const { data: statsRes, isLoading, isError, refetch } = useQuery({
    queryKey: ["der-stats", applied],
    queryFn:  () => ratingsAPI.getStats({
      from:  applied.from,
      to:    applied.to,
      group: applied.group || undefined,
    }),
    select: (res) => res.data,
  });

  const { data: configRes } = useQuery({
    queryKey: ["der-config"],
    queryFn:  () => ratingsAPI.getConfig(),
    select:   (res) => res.data,
    enabled:  showConfig,
  });

  const { mutate: saveConfig, isPending: savingConfig } = useMutation({
    mutationFn: (data) => ratingsAPI.updateConfig(data),
    onSuccess: () => {
      toast.success("Sozlamalar saqlandi");
      queryClient.invalidateQueries({ queryKey: ["der-config"] });
      queryClient.invalidateQueries({ queryKey: ["der-stats"] });
    },
    onError: () => toast.error("Xatolik yuz berdi"),
  });

  const stats    = statsRes?.stats ?? [];
  const maxScore = stats.length > 0 ? stats[0].score : 0;
  const cfgData  = configRes?.config;

  return (
    <div className="space-y-4">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy size={20} className="text-amber-500" />
          <h1 className="text-lg font-semibold text-gray-900">Faollik Reytingi</h1>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowConfig((v) => !v)}
          >
            Sozlamalar
          </Button>
          {stats.length > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => exportCSV(stats, applied.from, applied.to)}
              className="flex items-center gap-1.5"
            >
              <Download size={13} />
              CSV
            </Button>
          )}
        </div>
      </div>

      {/* Config panel */}
      {showConfig && (
        <ConfigPanel
          config={cfgData}
          onSave={(data) => saveConfig(data)}
          saving={savingConfig}
        />
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3 p-4 bg-white border border-gray-200 rounded-lg">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500">Dan</label>
          <input
            type="date"
            value={from}
            max={to}
            onChange={(e) => setFrom(e.target.value)}
            className="h-9 px-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-brown-800"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500">Gacha</label>
          <input
            type="date"
            value={to}
            min={from}
            max={today}
            onChange={(e) => setTo(e.target.value)}
            className="h-9 px-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-brown-800"
          />
        </div>
        {periodOptions.map((opt) => (
          <button
            key={opt.from}
            onClick={() => { setFrom(daysAgo(opt.from)); setTo(today); }}
            className="h-9 px-3 text-xs border border-gray-200 rounded-md text-gray-600 hover:bg-gray-50 transition-colors"
          >
            {opt.label}
          </button>
        ))}
        <Button size="sm" onClick={() => setApplied({ from, to, group })}>
          Ko'rish
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 w-16">O'rin</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">O'quvchi</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 hidden md:table-cell">Guruh</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Davomat</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 hidden sm:table-cell">
                <span className="flex items-center gap-1">
                  <Star size={11} className="text-amber-400" />O'rtacha
                </span>
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Ball</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i} className="border-b border-gray-100">
                  {[1,2,3,4,5,6].map((c) => (
                    <td key={c} className="px-4 py-3">
                      <Skeleton className="h-4 w-20" />
                    </td>
                  ))}
                </tr>
              ))
            ) : isError ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center gap-3 text-gray-500">
                    <p className="text-sm">Ma'lumotlar yuklanmadi</p>
                    <button
                      onClick={() => refetch()}
                      className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600"
                    >
                      <RefreshCw size={12} />
                      Qayta yuklash
                    </button>
                  </div>
                </td>
              </tr>
            ) : stats.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center gap-2 text-gray-400">
                    <Trophy size={24} strokeWidth={1.5} />
                    <p className="text-sm">Bu davr uchun ma'lumot yo'q</p>
                  </div>
                </td>
              </tr>
            ) : (
              stats.map((s) => {
                const name = `${s.student.firstName} ${s.student.lastName}`;
                const pct  = s.totalSessions > 0
                  ? Math.round((s.totalPresent / s.totalSessions) * 100)
                  : 0;
                return (
                  <tr
                    key={`${s.student._id}_${s.group?._id}`}
                    className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${s.rankGlobal <= 3 ? "bg-amber-50/30" : ""}`}
                  >
                    <td className="px-4 py-3"><RankBadge rank={s.rankGlobal} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-full bg-gray-100 text-gray-600 text-xs font-semibold flex items-center justify-center shrink-0">
                          {name.charAt(0)}
                        </span>
                        <span className="font-medium text-gray-900">{name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-gray-500">
                      {s.group?.name ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-medium text-gray-800">
                          {s.totalPresent}/{s.totalSessions}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <div className="w-16 h-1 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${pct >= 80 ? "bg-emerald-400" : pct >= 50 ? "bg-amber-400" : "bg-rose-400"}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-400">{pct}%</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <StarsDisplay avg={s.avgStars} />
                    </td>
                    <td className="px-4 py-3">
                      <ScoreBar score={s.score} max={maxScore} />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {!isLoading && !isError && stats.length > 0 && statsRes?.config && (
          <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50 text-xs text-gray-400">
            Ball = (kun × {statsRes.config.attendedDayPoints}) + (yulduz × {statsRes.config.starMultiplier})
            · {formatUzDate(applied.from)} – {formatUzDate(applied.to)}
          </div>
        )}
      </div>
    </div>
  );
};

export default RatingsPage;
