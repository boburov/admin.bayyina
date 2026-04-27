// TanStack Query
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Toast
import { toast } from "sonner";

// React
import { useState, useCallback } from "react";

// API
import { leadsAPI } from "../api/leads.api";

// Components
import LeadStatusBadge from "../components/LeadStatusBadge";
import LeadsFilters    from "../components/LeadsFilters";
import LeadDetailModal from "../components/LeadDetailModal";
import CreateLeadModal from "../components/CreateLeadModal";
import LeadsFunnel     from "../components/LeadsFunnel";
import Card            from "@/shared/components/ui/Card";
import Pagination      from "@/shared/components/ui/Pagination";

// Utils
import { formatDateUZ } from "@/shared/utils/date.utils";
import { formatPhone }  from "@/shared/utils/formatPhone";

// Icons
import { Phone, User, ExternalLink, BarChart2, List, Plus } from "lucide-react";

// Hooks
import useObjectState from "@/shared/hooks/useObjectState";

const PAGE_SIZE = 15;

const LeadsPage = () => {
  const queryClient = useQueryClient();

  const [page, setPage]           = useState(1);
  const [selectedLead, setSelectedLead] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [view, setView]           = useState("table"); // "table" | "funnel"

  const {
    status, source, search,
    setField, resetState,
  } = useObjectState({ status: "", source: "", search: "" });

  // Build query params
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

  // Fetch ALL leads for funnel (no filters, high limit)
  const { data: allData } = useQuery({
    queryKey: ["leads", "all"],
    queryFn:  () => leadsAPI.getAll({ limit: 1000 }).then((r) => r.data),
    enabled:  view === "funnel",
    staleTime: 60_000,
  });

  const leads      = data?.leads || [];
  const total      = data?.total || 0;
  const totalPages = data?.pages || 1;

  const handleFilterChange = (key, value) => {
    setField(key, value);
    setPage(1);
  };

  const handleReset = () => {
    resetState();
    setPage(1);
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
          {/* Create button */}
          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-brown-800 text-white text-sm font-semibold rounded-md hover:bg-brown-700 transition-colors"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Yangi lead</span>
          </button>

          {/* View toggle */}
          <div className="flex gap-1 border border-gray-200 rounded-md p-0.5">
            {[
              { key: "table",  icon: <List   size={14} />, label: "Jadval"   },
              { key: "funnel", icon: <BarChart2 size={14} />, label: "Tahlil" },
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
          {/* Filters */}
          <Card className="mb-4">
            <LeadsFilters
              filters={{ status, source, search }}
              onChange={handleFilterChange}
              onReset={handleReset}
            />
          </Card>

          {/* Table */}
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
                    <th className="px-4 py-3"></th>
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
                    leads.map((lead, idx) => (
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
                          <ExternalLink size={13} className="text-gray-300" />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-4 py-3 border-t border-gray-100">
                <Pagination
                  page={page}
                  totalPages={totalPages}
                  onChange={setPage}
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
    </div>
  );
};

export default LeadsPage;
