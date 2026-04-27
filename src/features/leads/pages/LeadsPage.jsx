// TanStack Query
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Toast
import { toast } from "sonner";

// React
import { useState, useCallback } from "react";

// API
import { leadsAPI } from "../api/leads.api";

// Components
import LeadStatusBadge  from "../components/LeadStatusBadge";
import LeadsFilters     from "../components/LeadsFilters";
import LeadDetailModal  from "../components/LeadDetailModal";
import CreateLeadModal  from "../components/CreateLeadModal";
import CancelLeadModal  from "../components/CancelLeadModal";
import LeadsFunnel      from "../components/LeadsFunnel";
import Card             from "@/shared/components/ui/Card";
import Pagination       from "@/shared/components/ui/Pagination";

// Utils
import { formatDateUZ } from "@/shared/utils/date.utils";

// Icons
import { ExternalLink, BarChart2, List, Plus, Ban } from "lucide-react";

// Hooks
import useObjectState from "@/shared/hooks/useObjectState";

// Data
import { QUICK_STATUS_OPTIONS } from "../data/leads.data";

const PAGE_SIZE = 15;

const LeadsPage = () => {
  const queryClient = useQueryClient();

  const [page, setPage]               = useState(1);
  const [selectedLead, setSelectedLead] = useState(null);
  const [cancelLead, setCancelLead]   = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [view, setView]               = useState("table");
  const [updatingId, setUpdatingId]   = useState(null);

  const { status, source, search, setField, resetState } = useObjectState({
    status: "", source: "", search: "",
  });

  const params = {
    page,
    limit: PAGE_SIZE,
    ...(status && { status }),
    ...(source && { source }),
    ...(search && { search }),
  };

  const { data, isLoading } = useQuery({
    queryKey: ["leads", params],
    queryFn:  () => leadsAPI.getAll(params).then((r) => r.data),
    staleTime: 30_000,
  });

  const { data: allData } = useQuery({
    queryKey: ["leads", "all"],
    queryFn:  () => leadsAPI.getAll({ limit: 1000 }).then((r) => r.data),
    enabled:  view === "funnel",
    staleTime: 60_000,
  });

  const leads      = data?.leads || [];
  const total      = data?.total || 0;
  const totalPages = data?.pages || 1;

  const statusMut = useMutation({
    mutationFn: ({ id, status }) => leadsAPI.update(id, { status }),
    onMutate:   ({ id }) => setUpdatingId(id),
    onSuccess:  () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["statistics", "leads"] });
      toast.success("Holat yangilandi");
    },
    onError:    (e) => toast.error(e.response?.data?.message || "Xatolik"),
    onSettled:  () => setUpdatingId(null),
  });

  const handleFilterChange = (key, value) => {
    setField(key, value);
    setPage(1);
  };

  const handleReset = () => {
    resetState();
    setPage(1);
  };

  const handleStatusChange = (e, lead) => {
    e.stopPropagation();
    const newStatus = e.target.value;
    if (!newStatus || newStatus === lead.status) return;
    statusMut.mutate({ id: lead._id, status: newStatus });
  };

  const handleCancelClick = (e, lead) => {
    e.stopPropagation();
    setCancelLead(lead);
  };

  return (
    <div>
      {/* Page header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Leadlar</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {total > 0 ? `${total} ta murojaat` : "Murojaatlar yo'q"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-brown-800 text-white text-sm font-semibold rounded-md hover:bg-brown-700 transition-colors"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Yangi lead</span>
          </button>

          <div className="flex gap-1 border border-gray-200 rounded-md p-0.5">
            {[
              { key: "table",  icon: <List      size={14} />, label: "Jadval"  },
              { key: "funnel", icon: <BarChart2  size={14} />, label: "Tahlil" },
            ].map((v) => (
              <button
                key={v.key}
                onClick={() => setView(v.key)}
                className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                  view === v.key
                    ? "bg-gray-900 text-white"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                {v.icon} {v.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Analytics view */}
      {view === "funnel" && (
        <LeadsFunnel leads={allData?.leads || []} />
      )}

      {/* Table view */}
      {view === "table" && (
        <>
          <Card className="mb-4">
            <LeadsFilters
              filters={{ status, source, search }}
              onChange={handleFilterChange}
              onReset={handleReset}
            />
          </Card>

          <Card className="overflow-hidden !p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">#</th>
                    <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Ism</th>
                    <th className="text-left text-xs font-medium text-gray-500 px-4 py-3 hidden sm:table-cell">Telefon</th>
                    <th className="text-left text-xs font-medium text-gray-500 px-4 py-3 hidden md:table-cell">Qiziqish</th>
                    <th className="text-left text-xs font-medium text-gray-500 px-4 py-3 hidden md:table-cell">Manba</th>
                    <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Holat</th>
                    <th className="text-left text-xs font-medium text-gray-500 px-4 py-3 hidden lg:table-cell">Sana</th>
                    <th className="text-right text-xs font-medium text-gray-500 px-4 py-3">Amallar</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    Array.from({ length: 8 }).map((_, i) => (
                      <tr key={i} className="border-b border-gray-50">
                        {Array.from({ length: 8 }).map((_, j) => (
                          <td key={j} className="px-4 py-3">
                            <div className="h-3 bg-gray-100 rounded animate-pulse" />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : leads.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-16 text-gray-400 text-sm">
                        Leadlar topilmadi
                      </td>
                    </tr>
                  ) : (
                    leads.map((lead, idx) => {
                      const isUpdating = updatingId === lead._id;
                      const isCancelled = lead.status === "rejected";
                      return (
                        <tr
                          key={lead._id}
                          className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors group"
                          onClick={() => setSelectedLead(lead)}
                        >
                          <td className="px-4 py-3 text-gray-400 text-xs font-mono">
                            {(page - 1) * PAGE_SIZE + idx + 1}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs font-semibold text-gray-600 shrink-0">
                                {lead.firstName?.[0]?.toUpperCase()}
                              </div>
                              <span className="font-medium text-gray-900">{lead.firstName}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-500 font-mono text-xs hidden sm:table-cell">
                            {lead.phone || "—"}
                          </td>
                          <td className="px-4 py-3 text-gray-600 text-xs hidden md:table-cell max-w-[140px] truncate">
                            {lead.interest?.name ?? lead.interest ?? "—"}
                          </td>
                          <td className="px-4 py-3 text-gray-500 text-xs hidden md:table-cell">
                            {lead.source?.name ?? lead.source ?? "—"}
                          </td>
                          <td className="px-4 py-3">
                            <LeadStatusBadge status={lead.status} />
                          </td>
                          <td className="px-4 py-3 text-gray-400 text-xs hidden lg:table-cell">
                            {lead.createdAt ? formatDateUZ(lead.createdAt) : "—"}
                          </td>
                          <td className="px-4 py-3">
                            <div
                              className="flex items-center justify-end gap-2"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {/* Status dropdown */}
                              {!isCancelled && (
                                <select
                                  value={lead.status}
                                  onChange={(e) => handleStatusChange(e, lead)}
                                  disabled={isUpdating}
                                  title="Holat o'zgartirish"
                                  className="h-7 px-1.5 text-xs border border-gray-200 rounded bg-white text-gray-600 focus:outline-none focus:ring-1 focus:ring-gray-300 disabled:opacity-50 cursor-pointer hover:border-gray-300 transition-colors"
                                >
                                  {QUICK_STATUS_OPTIONS.map((o) => (
                                    <option key={o.value} value={o.value}>
                                      {o.label}
                                    </option>
                                  ))}
                                </select>
                              )}

                              {/* Cancel button */}
                              {!isCancelled && (
                                <button
                                  onClick={(e) => handleCancelClick(e, lead)}
                                  disabled={isUpdating}
                                  title="Bekor qilish"
                                  className="h-7 w-7 flex items-center justify-center border border-gray-200 rounded text-gray-400 hover:border-red-300 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                                >
                                  {isUpdating ? (
                                    <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin" />
                                  ) : (
                                    <Ban size={12} />
                                  )}
                                </button>
                              )}

                              {/* View detail */}
                              <button
                                onClick={(e) => { e.stopPropagation(); setSelectedLead(lead); }}
                                title="Ko'rish"
                                className="h-7 w-7 flex items-center justify-center text-gray-300 hover:text-gray-600 transition-colors"
                              >
                                <ExternalLink size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="px-4 py-3 border-t border-gray-100">
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                  hasNextPage={page < totalPages}
                  hasPrevPage={page > 1}
                />
              </div>
            )}
          </Card>
        </>
      )}

      {/* Detail modal */}
      <LeadDetailModal
        lead={selectedLead}
        open={!!selectedLead}
        onClose={() => setSelectedLead(null)}
      />

      {/* Create modal */}
      <CreateLeadModal
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />

      {/* Cancel modal */}
      <CancelLeadModal
        lead={cancelLead}
        open={!!cancelLead}
        onClose={() => setCancelLead(null)}
      />
    </div>
  );
};

export default LeadsPage;
