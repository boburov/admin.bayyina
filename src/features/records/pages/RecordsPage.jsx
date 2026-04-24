// TanStack Query
import { useQuery } from "@tanstack/react-query";

// React
import { useCallback } from "react";

// Router
import { useSearchParams } from "react-router-dom";

// API
import { recordsAPI } from "@/features/records/api/records.api";

// Utils
import { formatUzDate } from "@/shared/utils/formatDate";

// Components
import Pagination from "@/shared/components/ui/Pagination";
import Select     from "@/shared/components/ui/select/Select";

// Icons
import { ClipboardList } from "lucide-react";

// Data
import {
  eventTypeLabel,
  entityTypeLabel,
  eventTypeFilterOptions,
  entityTypeFilterOptions,
} from "@/features/records/data/records.data";

const RecordsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const currentPage    = parseInt(searchParams.get("page")       || "1", 10);
  const eventTypeF     = searchParams.get("eventType")  || "";
  const entityTypeF    = searchParams.get("entityType") || "";
  const fromF          = searchParams.get("from")       || "";
  const toF            = searchParams.get("to")         || "";
  const searchF        = searchParams.get("search")     || "";

  const setParam = useCallback(
    (key, value) => {
      const params = new URLSearchParams(searchParams);
      if (value) {
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

  const queryParams = {
    page:  currentPage,
    limit: 20,
    ...(eventTypeF  && { eventType:  eventTypeF  }),
    ...(entityTypeF && { entityType: entityTypeF }),
    ...(fromF       && { from:       fromF       }),
    ...(toF         && { to:         toF         }),
    ...(searchF     && { search:     searchF     }),
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ["records", queryParams],
    queryFn:  () => recordsAPI.getAll(queryParams).then((r) => r.data),
    keepPreviousData: true,
  });

  const records    = data?.records    ?? [];
  const totalPages = data?.totalPages ?? 1;
  const hasNextPage = data?.hasNextPage ?? false;
  const hasPrevPage = data?.hasPrevPage ?? false;

  return (
    <div>
      {/* Header */}
      <div className="mb-5 pb-4 border-b border-border">
        <h1 className="page-title">Faoliyat tarixi</h1>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-3 mb-5">
        <input
          type="text"
          value={searchF}
          placeholder="Qidiruv..."
          onChange={(e) => setParam("search", e.target.value)}
          className="h-9 px-3 rounded-sm border border-gray-300 bg-white text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-primary transition-colors w-full sm:w-48"
        />

        <div className="flex flex-wrap items-center gap-2 ml-auto">
          <Select
            value={eventTypeF || ""}
            options={eventTypeFilterOptions}
            onChange={(v) => setParam("eventType", v)}
            placeholder="Hodisa turi"
          />
          <Select
            value={entityTypeF || ""}
            options={entityTypeFilterOptions}
            onChange={(v) => setParam("entityType", v)}
            placeholder="Entity turi"
          />
          <input
            type="date"
            value={fromF}
            onChange={(e) => setParam("from", e.target.value)}
            className="h-9 px-3 rounded-sm border border-gray-300 bg-white text-sm text-gray-700 outline-none focus:border-primary transition-colors"
            title="Boshlanish sanasi"
          />
          <input
            type="date"
            value={toF}
            onChange={(e) => setParam("to", e.target.value)}
            className="h-9 px-3 rounded-sm border border-gray-300 bg-white text-sm text-gray-700 outline-none focus:border-primary transition-colors"
            title="Tugash sanasi"
          />
        </div>
      </div>

      {/* Table */}
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Kod</th>
              <th>Hodisa</th>
              <th>Entity</th>
              <th>Tavsif</th>
              <th>Bajaruvchi</th>
              <th>Sana</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={6} className="py-12 text-center text-sm text-gray-400">
                  Yuklanmoqda...
                </td>
              </tr>
            )}

            {isError && !isLoading && (
              <tr>
                <td colSpan={6} className="py-12 text-center text-sm text-red-500">
                  Ma'lumotlarni yuklashda xatolik yuz berdi
                </td>
              </tr>
            )}

            {!isLoading && !isError && records.length === 0 && (
              <tr>
                <td colSpan={6} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-2 text-gray-400">
                    <ClipboardList className="size-8 opacity-30" strokeWidth={1.5} />
                    <p className="text-sm">Yozuvlar topilmadi</p>
                  </div>
                </td>
              </tr>
            )}

            {!isLoading && !isError && records.map((r) => (
              <tr key={r._id}>
                <td>
                  <span className="text-xs font-mono text-gray-500">{r.code}</span>
                </td>
                <td>
                  <span className="text-xs text-gray-700">
                    {eventTypeLabel[r.eventType] ?? r.eventType}
                  </span>
                </td>
                <td className="text-center">
                  <span className="text-xs text-gray-500">
                    {entityTypeLabel[r.entityType] ?? r.entityType}
                  </span>
                </td>
                <td>
                  <p className="text-sm text-gray-700 max-w-[320px] truncate" title={r.description}>
                    {r.description}
                  </p>
                </td>
                <td>
                  {r.actor?.name ? (
                    <div>
                      <p className="text-sm text-gray-700">{r.actor.name}</p>
                      <p className="text-xs text-gray-400 capitalize">{r.actor.role}</p>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400">—</span>
                  )}
                </td>
                <td className="text-center text-sm text-gray-500">
                  {formatUzDate(r.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!isLoading && !isError && records.length > 0 && (
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

      {!isLoading && !isError && records.length > 0 && (
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

export default RecordsPage;
