// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Toast
import { toast } from "sonner";

// React
import { useCallback } from "react";

// Router
import { useSearchParams } from "react-router-dom";

// API
import { notificationsAPI } from "@/features/notifications/api/notifications.api";

// Utils
import { formatUzDate } from "@/shared/utils/formatDate";

// Hooks
import useModal from "@/shared/hooks/useModal";

// Components
import Button from "@/shared/components/ui/button/Button";
import Pagination from "@/shared/components/ui/Pagination";
import Select from "@/shared/components/ui/select/Select";

// Icons
import { Bell, Eye, MessageSquare, Plus } from "lucide-react";

// Data
import {
  typeLabel,
  statusLabel,
  typeFilterOptions,
  statusFilterOptions,
} from "@/features/notifications/data/notifications.data";

// ─── Page ─────────────────────────────────────────────────────────────────────

const NotificationsPage = () => {
  const { openModal } = useModal();

  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage  = parseInt(searchParams.get("page")   || "1",   10);
  const typeFilter   = searchParams.get("type")   || "";
  const statusFilter = searchParams.get("status") || "";

  // ── Param helpers ──────────────────────────────────────────────────────────

  const setParam = useCallback(
    (key, value) => {
      const params = new URLSearchParams(searchParams);
      if (value && value !== "all") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.set("page", "1");
      setSearchParams(params);
    },
    [searchParams, setSearchParams],
  );

  const goToPage = useCallback(
    (page) => {
      if (page < 1) return;
      const params = new URLSearchParams(searchParams);
      params.set("page", page.toString());
      setSearchParams(params);
    },
    [searchParams, setSearchParams],
  );

  // ── Data fetching ──────────────────────────────────────────────────────────

  const queryParams = { page: currentPage, limit: 20 };
  if (typeFilter)   queryParams.type   = typeFilter;
  if (statusFilter) queryParams.status = statusFilter;

  const { data, isLoading, isError } = useQuery({
    queryKey: ["notifications", queryParams],
    queryFn:  () =>
      notificationsAPI.getAll(queryParams).then((res) => res.data),
    onError: () => toast.error("Xabarnomalarni yuklashda xatolik"),
    keepPreviousData: true,
  });

  const notifications = data?.notifications ?? [];
  const totalPages    = data?.totalPages    ?? 1;
  const hasNextPage   = data?.hasNextPage   ?? false;
  const hasPrevPage   = data?.hasPrevPage   ?? false;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div>
      {/* Page header */}
      <div className="mb-5 pb-4 border-b border-border">
        <h1 className="page-title">Xabarnomalar</h1>
      </div>

      {/* Actions bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-5">
        <Button onClick={() => openModal("sendNotification")} className="px-3.5">
          <Plus size={14} strokeWidth={1.5} />
          Yangi xabarnoma
        </Button>

        <div className="flex items-center gap-2 ml-auto">
          <Select
            value={typeFilter || "all"}
            options={typeFilterOptions}
            onChange={(v) => setParam("type", v)}
            placeholder="Turi"
          />
          <Select
            value={statusFilter || "all"}
            options={statusFilterOptions}
            onChange={(v) => setParam("status", v)}
            placeholder="Status"
          />
        </div>
      </div>

      {/* Table */}
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Sarlavha</th>
              <th>Turi</th>
              <th>Guruh</th>
              <th>Fikrlar</th>
              <th>Status</th>
              <th>Sana</th>
              <th>Amal</th>
            </tr>
          </thead>
          <tbody>
            {/* Loading */}
            {isLoading && (
              <tr>
                <td colSpan={7} className="py-12 text-center text-sm text-gray-400">
                  Yuklanmoqda...
                </td>
              </tr>
            )}

            {/* Error */}
            {isError && !isLoading && (
              <tr>
                <td colSpan={7} className="py-12 text-center text-sm text-red-500">
                  Ma'lumotlarni yuklashda xatolik yuz berdi
                </td>
              </tr>
            )}

            {/* Empty */}
            {!isLoading && !isError && notifications.length === 0 && (
              <tr>
                <td colSpan={7} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-2 text-gray-400">
                    <Bell className="size-8 opacity-30" strokeWidth={1.5} />
                    <p className="text-sm">Xabarnomalar topilmadi</p>
                  </div>
                </td>
              </tr>
            )}

            {/* Rows */}
            {!isLoading &&
              !isError &&
              notifications.map((n) => {
                const st      = statusLabel[n.status]  ?? statusLabel.pending;
                const tLabel  = typeLabel[n.type]      ?? n.type;
                const groupName =
                  n.group?.name ?? (typeof n.group === "string" ? "—" : "—");
                const senderName =
                  n.sender?.firstName
                    ? `${n.sender.firstName} ${n.sender.lastName ?? ""}`.trim()
                    : "—";

                return (
                  <tr key={n._id}>
                    {/* Title + message preview */}
                    <td>
                      <p className="text-sm font-medium text-gray-900 max-w-[220px] truncate">
                        {n.title}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5 max-w-[220px] truncate">
                        {n.message}
                      </p>
                    </td>

                    {/* Type */}
                    <td className="text-center">
                      <span className="text-xs text-gray-500">{tLabel}</span>
                    </td>

                    {/* Group */}
                    <td className="text-center text-sm text-gray-500">
                      {groupName}
                    </td>

                    {/* Feedback count */}
                    <td className="text-center">
                      <div className="flex items-center justify-center gap-1 text-xs text-gray-500">
                        <MessageSquare className="w-3.5 h-3.5 text-gray-400" />
                        {n.feedback?.length ?? 0}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="text-center">
                      <span className={`text-xs px-2 py-0.5 font-medium ${st.cls}`}>
                        {st.text}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="text-center text-sm text-gray-500">
                      {formatUzDate(n.createdAt)}
                    </td>

                    {/* Actions */}
                    <td className="text-center">
                      <button
                        onClick={() => openModal("notificationDetail", n)}
                        className="text-gray-400 hover:text-brown-800 transition-colors"
                        title="Ko'rish"
                      >
                        <Eye className="size-4" strokeWidth={1.5} />
                      </button>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      {/* Pagination — desktop */}
      {!isLoading && !isError && notifications.length > 0 && (
        <Pagination
          maxPageButtons={5}
          showPageNumbers={true}
          onPageChange={goToPage}
          currentPage={currentPage}
          hasNextPage={hasNextPage}
          hasPrevPage={hasPrevPage}
          totalPages={totalPages}
          className="pt-5 max-md:hidden"
        />
      )}

      {/* Pagination — mobile */}
      {!isLoading && !isError && notifications.length > 0 && (
        <div className="overflow-x-auto pb-1.5">
          <Pagination
            maxPageButtons={5}
            showPageNumbers={true}
            onPageChange={goToPage}
            currentPage={currentPage}
            hasNextPage={hasNextPage}
            hasPrevPage={hasPrevPage}
            totalPages={totalPages}
            className="pt-5 min-w-max md:hidden"
          />
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
