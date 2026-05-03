import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Search, GraduationCap, Users, Pencil, ChevronLeft, ChevronRight } from "lucide-react";

import { leadsAPI }              from "@/features/leads/api/leads.api";
import { STATUS_MAP, STATUS_LIST, FORM_STATUS_OPTIONS } from "../data/leads-crm.data";
import LeadDetailModal            from "../components/LeadDetailModal";
import ConvertLeadModal           from "../components/ConvertLeadModal";
import { formatDateUZ }           from "@/shared/utils/date.utils";
import Card                       from "@/shared/components/ui/Card";

const PAGE_SIZE = 20;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const StatusBadge = ({ status }) => {
  const s = STATUS_MAP[status];
  if (!s) return <span className="text-xs text-gray-400">{status}</span>;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded ${s.badge}`}>
      {s.label}
    </span>
  );
};

const Pager = ({ page, total, totalPages, onChange }) => {
  if (totalPages <= 1) return null;
  const pages = Math.max(1, totalPages);
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-white">
      <p className="text-xs text-gray-400">
        {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} / {total}
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onChange(page - 1)}
          disabled={page <= 1}
          className="h-7 w-7 flex items-center justify-center border border-gray-200 rounded text-gray-500 disabled:opacity-30 hover:bg-gray-50 transition-colors"
        >
          <ChevronLeft size={13} />
        </button>
        {Array.from({ length: pages }, (_, i) => i + 1)
          .filter((p) => p === 1 || p === pages || Math.abs(p - page) <= 1)
          .reduce((acc, p, i, arr) => {
            if (i > 0 && arr[i - 1] !== p - 1) acc.push("…");
            acc.push(p);
            return acc;
          }, [])
          .map((p, i) =>
            p === "…" ? (
              <span key={`e-${i}`} className="px-1 text-xs text-gray-400">…</span>
            ) : (
              <button
                key={p}
                onClick={() => onChange(p)}
                className={`h-7 min-w-[28px] px-1.5 text-xs font-medium rounded transition-colors ${
                  p === page ? "bg-gray-900 text-white" : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {p}
              </button>
            )
          )}
        <button
          onClick={() => onChange(page + 1)}
          disabled={page >= pages}
          className="h-7 w-7 flex items-center justify-center border border-gray-200 rounded text-gray-500 disabled:opacity-30 hover:bg-gray-50 transition-colors"
        >
          <ChevronRight size={13} />
        </button>
      </div>
    </div>
  );
};

// ─── Main page ────────────────────────────────────────────────────────────────

const LeadsCrmPage = () => {
  const qc = useQueryClient();

  const [tab,          setTab]          = useState("leads");
  const [search,       setSearch]       = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [page,         setPage]         = useState(1);

  const [selectedLead,  setSelectedLead]  = useState(null);
  const [convertTarget, setConvertTarget] = useState(null);

  const debounceRef = useRef(null);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(debounceRef.current);
  }, [search]);

  useEffect(() => { setPage(1); }, [tab, filterStatus, debouncedSearch]);

  // ── Queries ──

  const leadsQuery = useQuery({
    queryKey: ["qabullar-leads", { page, search: debouncedSearch, status: filterStatus }],
    queryFn: () =>
      leadsAPI.getAll({
        page,
        limit: PAGE_SIZE,
        ...(filterStatus                  && { status: filterStatus }),
        ...(debouncedSearch               && { search: debouncedSearch }),
      }).then((r) => r.data),
    enabled: tab === "leads",
    keepPreviousData: true,
  });

  const studentsQuery = useQuery({
    queryKey: ["qabullar-students", { page, search: debouncedSearch }],
    queryFn: () =>
      leadsAPI.getAll({
        page,
        limit: PAGE_SIZE,
        status: "converted",
        ...(debouncedSearch && { search: debouncedSearch }),
      }).then((r) => r.data),
    enabled: tab === "students",
    keepPreviousData: true,
  });

  const activeQuery = tab === "leads" ? leadsQuery : studentsQuery;
  const leads       = activeQuery.data?.leads ?? [];
  const total       = activeQuery.data?.total ?? 0;
  const totalPages  = activeQuery.data?.totalPages ?? 1;
  const isLoading   = activeQuery.isLoading;
  const isFetching  = activeQuery.isFetching;

  // ── Status mutation ──

  const statusMut = useMutation({
    mutationFn: ({ id, status, rejectionReason }) =>
      leadsAPI.update(id, { status, ...(rejectionReason && { rejectionReason }) }),
    onSuccess: (_, { status }) => {
      qc.invalidateQueries({ queryKey: ["qabullar-leads"] });
      qc.invalidateQueries({ queryKey: ["qabullar-students"] });
      toast.success(`Holat: ${STATUS_MAP[status]?.label ?? status}`);
      setSelectedLead(null);
    },
    onError: (e) => toast.error(e.response?.data?.message || "Xatolik"),
  });

  // ── Handlers ──

  const handleSetStatus = (id, status, rejectionReason) => {
    statusMut.mutate({ id, status, rejectionReason });
  };

  const handleConvert = (lead) => {
    setSelectedLead(null);
    setConvertTarget(lead);
  };

  const handleConvertSuccess = () => {
    qc.invalidateQueries({ queryKey: ["qabullar-leads"] });
    qc.invalidateQueries({ queryKey: ["qabullar-students"] });
    setConvertTarget(null);
  };

  const leadsTotal    = tab === "leads"    ? total : (leadsQuery.data?.total ?? 0);
  const studentsTotal = tab === "students" ? total : (studentsQuery.data?.total ?? 0);

  // ── Render ──

  return (
    <div>
      {/* Header */}
      <div className="mb-5 pb-4 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">Qabullar</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          Leadlar va qabul qilingan o'quvchilar
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border border-gray-200 rounded w-fit mb-4">
        <TabBtn
          active={tab === "leads"}
          onClick={() => { setTab("leads"); setFilterStatus(""); }}
          icon={<Users size={14} />}
          label="Leadlar"
          count={leadsTotal}
        />
        <TabBtn
          active={tab === "students"}
          onClick={() => { setTab("students"); setFilterStatus(""); }}
          icon={<GraduationCap size={14} />}
          label="O'quvchilar"
          count={studentsTotal}
        />
      </div>

      {/* Filters */}
      <Card className="mb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="w-full h-9 pl-8 pr-3 text-sm border border-gray-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-brown-800 placeholder:text-gray-400"
              placeholder="Ism yoki telefon..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {tab === "leads" && (
            <select
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
              className="h-9 px-2 text-sm border border-gray-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-brown-800 text-gray-700 shrink-0"
            >
              <option value="">Barcha holatlar</option>
              {FORM_STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          )}
        </div>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden !p-0">
        <div className={`transition-opacity duration-150 ${isFetching && !isLoading ? "opacity-60" : "opacity-100"}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left text-xs font-medium text-gray-500 px-4 py-3 w-10">#</th>
                  <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Ism</th>
                  <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Telefon</th>
                  <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Qiziqish</th>
                  <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Holat</th>
                  <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Sana</th>
                  <th className="text-right text-xs font-medium text-gray-500 px-4 py-3">Amallar</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-14 text-sm text-gray-400">
                      Yuklanmoqda...
                    </td>
                  </tr>
                ) : leads.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-14 text-sm text-gray-400">
                      {tab === "students" ? "Hali qabul qilingan o'quvchi yo'q" : "Leadlar topilmadi"}
                    </td>
                  </tr>
                ) : (
                  leads.map((lead, idx) => {
                    const isConverted = lead.status === "converted";
                    const isRejected  = lead.status === "rejected";
                    const interest    = lead.courseType?.name ?? lead.interest?.name ?? "—";
                    return (
                      <tr
                        key={lead._id}
                        className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => setSelectedLead(lead)}
                      >
                        <td className="px-4 py-3 text-gray-400 text-xs font-mono">
                          {(page - 1) * PAGE_SIZE + idx + 1}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 bg-brown-50 border border-brown-200 flex items-center justify-center text-xs font-semibold text-brown-800 shrink-0">
                              {lead.firstName?.[0]?.toUpperCase() ?? "?"}
                            </div>
                            <p className="font-medium text-gray-900">{lead.firstName} {lead.lastName}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-500 font-mono text-xs">
                          {lead.phone ? `+${lead.phone}` : "—"}
                        </td>
                        <td className="px-4 py-3 text-gray-600 text-xs max-w-[140px]">
                          <span className="truncate block">{interest}</span>
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={lead.status} />
                        </td>
                        <td className="px-4 py-3 text-gray-400 text-xs">
                          {lead.createdAt ? formatDateUZ(lead.createdAt) : "—"}
                        </td>
                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            {!isConverted && !isRejected && (
                              <button
                                onClick={() => handleConvert(lead)}
                                title="O'quvchiga aylantirish"
                                className="flex items-center gap-1 h-7 px-2.5 text-xs font-semibold border border-green-200 text-green-700 bg-green-50 hover:bg-green-100 rounded transition-colors"
                              >
                                <GraduationCap size={12} />
                                <span className="hidden lg:inline">Qabul</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <Pager page={page} total={total} totalPages={totalPages} onChange={setPage} />
      </Card>

      {/* Modals */}
      <LeadDetailModal
        lead={selectedLead}
        open={!!selectedLead}
        onClose={() => setSelectedLead(null)}
        onSetStatus={handleSetStatus}
        onConvert={handleConvert}
      />

      <ConvertLeadModal
        open={!!convertTarget}
        lead={convertTarget}
        onClose={() => setConvertTarget(null)}
        onSuccess={handleConvertSuccess}
      />
    </div>
  );
};

const TabBtn = ({ active, onClick, icon, label, count }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-colors ${
      active ? "bg-gray-900 text-white" : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
    }`}
  >
    {icon}
    <span>{label}</span>
    {count > 0 && (
      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
        active ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"
      }`}>
        {count}
      </span>
    )}
  </button>
);

export default LeadsCrmPage;
