import { useState, useMemo, useRef, useEffect } from "react";
import { toast } from "sonner";
import { Plus, Search, GraduationCap, Users, Pencil, ChevronLeft, ChevronRight } from "lucide-react";

import { useLeadsStorage }  from "../hooks/useLeadsStorage";
import { STATUS_LIST, STATUS_MAP, INTEREST_COLOR } from "../data/leads-crm.data";
import LeadFormModal         from "../components/LeadFormModal";
import LeadDetailModal       from "../components/LeadDetailModal";
import { formatDateUZ }      from "@/shared/utils/date.utils";
import Card                  from "@/shared/components/ui/Card";

const PAGE_SIZE = 15;

// ─── Interest bar ─────────────────────────────────────────────────────────────

const InterestBar = ({ value }) => (
  <div className="flex items-center gap-2 min-w-[90px]">
    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full ${INTEREST_COLOR(value)}`}
        style={{ width: `${value}%` }}
      />
    </div>
    <span className="text-xs font-mono text-gray-600 shrink-0 w-8 text-right">{value}%</span>
  </div>
);

// ─── Status badge ─────────────────────────────────────────────────────────────

const StatusBadge = ({ status }) => {
  const s = STATUS_MAP[status];
  if (!s) return <span className="text-xs text-gray-400">{status}</span>;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded ${s.badge}`}>
      {s.label}
    </span>
  );
};

// ─── Mobile card ──────────────────────────────────────────────────────────────

const LeadCard = ({ lead, index, onView, onEdit, onConvert }) => {
  const isStudent    = lead.status === "student";
  const notesPreview = lead.notes?.length > 80 ? lead.notes.slice(0, 80) + "…" : lead.notes;

  return (
    <div
      className="bg-white border border-gray-200 p-4 cursor-pointer hover:border-gray-300 transition-colors"
      onClick={() => onView(lead)}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 bg-brown-50 border border-brown-200 flex items-center justify-center text-sm font-semibold text-brown-800 shrink-0">
            {lead.name?.[0]?.toUpperCase() ?? "?"}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 text-sm truncate">{lead.name}</p>
            <p className="text-xs text-gray-400 font-mono">{lead.phone || "—"}</p>
          </div>
        </div>
        <StatusBadge status={lead.status} />
      </div>

      {/* Course + interest */}
      {lead.course && (
        <p className="text-xs text-gray-500 mb-2 truncate">📚 {lead.course}</p>
      )}
      <InterestBar value={lead.interestPercent ?? 0} />

      {/* Notes preview */}
      {lead.notes && (
        <p className="mt-2.5 text-xs text-gray-500 leading-relaxed">
          {notesPreview}
          {lead.notes.length > 80 && (
            <button
              onClick={(e) => { e.stopPropagation(); onView(lead); }}
              className="ml-1 text-brown-700 hover:underline font-medium"
            >
              batafsil
            </button>
          )}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
        <span className="text-[10px] text-gray-400">
          {lead.createdAt ? formatDateUZ(lead.createdAt) : "—"}
        </span>
        <div
          className="flex items-center gap-1.5"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => onEdit(lead)}
            className="h-7 w-7 flex items-center justify-center border border-gray-200 text-gray-400 hover:text-gray-700 hover:bg-gray-50 rounded transition-colors"
            title="Tahrirlash"
          >
            <Pencil size={12} />
          </button>
          {!isStudent && (
            <button
              onClick={() => onConvert(lead)}
              className="flex items-center gap-1 h-7 px-2.5 text-xs font-semibold border border-green-200 text-green-700 bg-green-50 hover:bg-green-100 rounded transition-colors"
              title="Studentga aylantirish"
            >
              <GraduationCap size={12} />
              Student
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Pagination ───────────────────────────────────────────────────────────────

const Pager = ({ page, total, onChange }) => {
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  if (pages <= 1) return null;
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
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
              <span key={`ellipsis-${i}`} className="px-1 text-xs text-gray-400">…</span>
            ) : (
              <button
                key={p}
                onClick={() => onChange(p)}
                className={`h-7 min-w-[28px] px-1.5 text-xs font-medium rounded transition-colors ${
                  p === page
                    ? "bg-gray-900 text-white"
                    : "border border-gray-200 text-gray-600 hover:bg-gray-50"
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
  const { leads, addLead, editLead, setStatus } = useLeadsStorage();

  const [tab,          setTab]          = useState("leads");
  const [search,       setSearch]       = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [page,         setPage]         = useState(1);

  const [selectedLead,  setSelectedLead]  = useState(null);
  const [editingLead,   setEditingLead]   = useState(null);
  const [isFormOpen,    setIsFormOpen]    = useState(false);
  const [convertTarget, setConvertTarget] = useState(null);

  const debounceRef   = useRef(null);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(debounceRef.current);
  }, [search]);

  useEffect(() => { setPage(1); }, [tab, filterStatus, debouncedSearch]);

  const allLeads   = useMemo(() => leads.filter((l) => l.status !== "student"), [leads]);
  const allStudents = useMemo(() => leads.filter((l) => l.status === "student"),  [leads]);

  const filtered = useMemo(() => {
    let list = tab === "students" ? allStudents : allLeads;
    if (filterStatus) list = list.filter((l) => l.status === filterStatus);
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      list = list.filter(
        (l) =>
          l.name?.toLowerCase().includes(q) ||
          l.phone?.includes(q) ||
          l.course?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [tab, allLeads, allStudents, filterStatus, debouncedSearch]);

  const paginated   = useMemo(() => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [filtered, page]);
  const totalLeads  = leads.length;

  // ── Handlers ──

  const handleAdd = () => {
    setEditingLead(null);
    setIsFormOpen(true);
  };

  const handleEdit = (lead) => {
    setSelectedLead(null);
    setEditingLead(lead);
    setIsFormOpen(true);
  };

  const handleSave = (data) => {
    if (editingLead) {
      editLead(editingLead.id, data);
      toast.success("Lead yangilandi");
    } else {
      addLead(data);
      toast.success("Lead qo'shildi");
    }
    setIsFormOpen(false);
    setEditingLead(null);
  };

  const handleSetStatus = (id, status) => {
    setStatus(id, status);
    const label = STATUS_MAP[status]?.label ?? status;
    toast.success(`Holat: ${label}`);
    setSelectedLead(null);
  };

  const handleConvert = (lead) => {
    setConvertTarget(lead);
  };

  const confirmConvert = () => {
    if (!convertTarget) return;
    setStatus(convertTarget.id, "student");
    toast.success(`${convertTarget.name} studentga aylandi!`);
    setConvertTarget(null);
  };

  // ── Render ──

  return (
    <div>
      {/* Page header */}
      <div className="flex items-start justify-between mb-5 gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Leads CRM</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Jami {totalLeads} ta lead · {allStudents.length} ta student
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-1.5 px-4 py-2 bg-brown-800 text-white text-sm font-semibold rounded hover:bg-brown-700 transition-colors shrink-0"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">Yangi lead</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border border-gray-200 rounded w-fit mb-4">
        <TabBtn
          active={tab === "leads"}
          onClick={() => setTab("leads")}
          icon={<Users size={14} />}
          label="Barcha leadlar"
          count={allLeads.length}
        />
        <TabBtn
          active={tab === "students"}
          onClick={() => setTab("students")}
          icon={<GraduationCap size={14} />}
          label="Studentlar"
          count={allStudents.length}
        />
      </div>

      {/* Filters */}
      <Card className="mb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="w-full h-9 pl-8 pr-3 text-sm border border-gray-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-brown-800 placeholder:text-gray-400"
              placeholder="Ism, telefon yoki kurs bo'yicha qidirish..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Status filter (only for leads tab) */}
          {tab === "leads" && (
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="h-9 px-2 text-sm border border-gray-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-brown-800 text-gray-700 shrink-0"
            >
              <option value="">Barcha holatlar</option>
              {STATUS_LIST.filter((s) => s.value !== "student").map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          )}
        </div>
      </Card>

      {/* Desktop table */}
      <div className="hidden sm:block">
        <Card className="overflow-hidden !p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3 w-10">#</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Ism</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3 hidden md:table-cell">Telefon</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3 hidden lg:table-cell">Kurs</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Qiziqish</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Holat</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3 hidden xl:table-cell">Sana</th>
                <th className="text-right text-xs font-medium text-gray-500 px-4 py-3">Amallar</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-14 text-gray-400 text-sm">
                    {filtered.length === 0 ? (tab === "students" ? "Hali student yo'q" : "Leadlar topilmadi") : "Bu sahifada ma'lumot yo'q"}
                  </td>
                </tr>
              ) : (
                paginated.map((lead, idx) => {
                  const isStudent    = lead.status === "student";
                  const notesPreview = lead.notes?.length > 40 ? lead.notes.slice(0, 40) + "…" : lead.notes;
                  return (
                    <tr
                      key={lead.id}
                      className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => setSelectedLead(lead)}
                    >
                      <td className="px-4 py-3 text-gray-400 text-xs font-mono">
                        {(page - 1) * PAGE_SIZE + idx + 1}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 bg-brown-50 border border-brown-200 flex items-center justify-center text-xs font-semibold text-brown-800 shrink-0">
                            {lead.name?.[0]?.toUpperCase() ?? "?"}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{lead.name}</p>
                            {notesPreview && (
                              <p className="text-[10px] text-gray-400 max-w-[140px] truncate">{notesPreview}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-500 font-mono text-xs hidden md:table-cell">
                        {lead.phone || "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-xs hidden lg:table-cell max-w-[140px]">
                        <span className="truncate block">{lead.course || "—"}</span>
                      </td>
                      <td className="px-4 py-3">
                        <InterestBar value={lead.interestPercent ?? 0} />
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={lead.status} />
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs hidden xl:table-cell">
                        {lead.createdAt ? formatDateUZ(lead.createdAt) : "—"}
                      </td>
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleEdit(lead)}
                            title="Tahrirlash"
                            className="h-7 w-7 flex items-center justify-center border border-gray-200 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <Pencil size={12} />
                          </button>
                          {!isStudent && (
                            <button
                              onClick={() => handleConvert(lead)}
                              title="Studentga aylantirish"
                              className="flex items-center gap-1 h-7 px-2.5 text-xs font-semibold border border-green-200 text-green-700 bg-green-50 hover:bg-green-100 rounded transition-colors"
                            >
                              <GraduationCap size={12} />
                              <span className="hidden lg:inline">Student</span>
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

          <Pager page={page} total={filtered.length} onChange={setPage} />
        </Card>
      </div>

      {/* Mobile cards */}
      <div className="sm:hidden space-y-3">
        {paginated.length === 0 ? (
          <div className="text-center py-14 text-gray-400 text-sm">
            {tab === "students" ? "Hali student yo'q" : "Leadlar topilmadi"}
          </div>
        ) : (
          paginated.map((lead, idx) => (
            <LeadCard
              key={lead.id}
              lead={lead}
              index={(page - 1) * PAGE_SIZE + idx + 1}
              onView={setSelectedLead}
              onEdit={handleEdit}
              onConvert={handleConvert}
            />
          ))
        )}

        {filtered.length > PAGE_SIZE && (
          <Card className="!p-0 overflow-hidden">
            <Pager page={page} total={filtered.length} onChange={setPage} />
          </Card>
        )}
      </div>

      {/* ── Modals ── */}

      <LeadFormModal
        open={isFormOpen}
        lead={editingLead}
        onClose={() => { setIsFormOpen(false); setEditingLead(null); }}
        onSave={handleSave}
      />

      <LeadDetailModal
        lead={selectedLead}
        open={!!selectedLead}
        onClose={() => setSelectedLead(null)}
        onEdit={handleEdit}
        onSetStatus={handleSetStatus}
      />

      {/* Convert confirmation (from table/card quick-convert) */}
      {convertTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded max-w-sm w-full p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-50 border border-green-200 flex items-center justify-center shrink-0">
                <GraduationCap size={20} className="text-green-700" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">{convertTarget.name}</p>
                <p className="text-sm text-gray-500">Studentga aylantirish</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-5 leading-relaxed">
              Lead tarixda saqlanib qoladi, faqat statusi <strong>"Student"</strong> ga o'zgaradi.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setConvertTarget(null)}
                className="text-sm px-4 py-2 border border-gray-200 text-gray-600 rounded hover:bg-gray-50"
              >
                Bekor
              </button>
              <button
                onClick={confirmConvert}
                className="text-sm px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-semibold"
              >
                Ha, aylantirish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const TabBtn = ({ active, onClick, icon, label, count }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-colors ${
      active
        ? "bg-gray-900 text-white"
        : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
    }`}
  >
    {icon}
    <span className="hidden sm:inline">{label}</span>
    <span
      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
        active ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"
      }`}
    >
      {count}
    </span>
  </button>
);

export default LeadsCrmPage;
