// TanStack Query
import { useQuery } from "@tanstack/react-query";

// React
import { useCallback, useRef, useState } from "react";

// Router
import { useSearchParams } from "react-router-dom";

// API
import { recordsAPI } from "@/features/records/api/records.api";

// Hooks
import useModal from "@/shared/hooks/useModal";

// Utils
import { formatUzDate } from "@/shared/utils/formatDate";

// Components
import Pagination        from "@/shared/components/ui/Pagination";
import Select            from "@/shared/components/ui/select/Select";
import Button            from "@/shared/components/ui/button/Button";
import RecordDetailModal from "@/features/records/components/RecordDetailModal";

// Icons
import { ClipboardList, Eye, Search, X } from "lucide-react";

// Data
import {
  eventTypeLabel,
  entityTypeLabel,
  eventTypeFilterOptions,
  entityTypeFilterOptions,
} from "@/features/records/data/records.data";

const inputCls =
  "h-10 px-3 border border-border bg-white text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors";

const RecordsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const debounceRef = useRef(null);
  const { openModal } = useModal("recordDetail");

  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  const eventTypeF  = searchParams.get("eventType")  || "";
  const entityTypeF = searchParams.get("entityType") || "";
  const fromF       = searchParams.get("from")       || "";
  const toF         = searchParams.get("to")         || "";
  const searchF     = searchParams.get("search")     || "";

  const [searchInput, setSearchInput] = useState(searchF);

  const setParam = useCallback(
    (key, value) => {
      setSearchParams((prev) => {
        const params = new URLSearchParams(prev);
        if (value) params.set(key, value);
        else params.delete(key);
        params.set("page", "1");
        return params;
      });
    },
    [setSearchParams],
  );

  const handleSearchChange = (value) => {
    setSearchInput(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setParam("search", value.trim()), 450);
  };

  const clearFilters = () => {
    setSearchInput("");
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setSearchParams({ page: "1" });
  };

  const goToPage = useCallback(
    (page) => {
      if (page < 1) return;
      setSearchParams((prev) => {
        const params = new URLSearchParams(prev);
        params.set("page", page.toString());
        return params;
      });
    },
    [setSearchParams],
  );

  const activeFilters = [
    eventTypeF  && { key: "eventType",  label: "Hodisa",  display: eventTypeFilterOptions.find((o) => o.value === eventTypeF)?.label  ?? eventTypeF  },
    entityTypeF && { key: "entityType", label: "Obyekt",  display: entityTypeFilterOptions.find((o) => o.value === entityTypeF)?.label ?? entityTypeF },
    fromF       && { key: "from",       label: "Dan",     display: fromF  },
    toF         && { key: "to",         label: "Gacha",   display: toF   },
    searchF     && { key: "search",     label: "Qidiruv", display: searchF },
  ].filter(Boolean);

  const hasFilters = activeFilters.length > 0;

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

  const records     = data?.records    ?? [];
  const totalPages  = data?.totalPages ?? 1;
  const hasNextPage = data?.hasNextPage ?? false;
  const hasPrevPage = data?.hasPrevPage ?? false;

  return (
    <div>
      <RecordDetailModal />

      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Faoliyat tarixi</h1>
      </div>

      {/* Filter bar */}
      <div className="mb-4 space-y-3">
        <div className="flex flex-col lg:flex-row gap-2">

          {/* Search */}
          <div className="relative w-full lg:w-64 shrink-0">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none"
              strokeWidth={1.5}
            />
            <input
              type="text"
              value={searchInput}
              placeholder="Qidiruv..."
              onChange={(e) => handleSearchChange(e.target.value)}
              className={`${inputCls} w-full pl-9`}
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2 lg:ml-auto">
            <Select
              value={eventTypeF}
              options={eventTypeFilterOptions}
              onChange={(v) => setParam("eventType", v)}
              placeholder="Hodisa turi"
              triggerClassName="w-48"
            />
            <Select
              value={entityTypeF}
              options={entityTypeFilterOptions}
              onChange={(v) => setParam("entityType", v)}
              placeholder="Obyekt turi"
              triggerClassName="w-44"
            />

            {/* Date range */}
            <div className="flex items-center gap-0 border border-border bg-white">
              <input
                type="date"
                value={fromF}
                onChange={(e) => setParam("from", e.target.value)}
                title="Boshlanish sanasi"
                className={`${inputCls} border-0 border-r border-border w-[138px]`}
              />
              <input
                type="date"
                value={toF}
                onChange={(e) => setParam("to", e.target.value)}
                title="Tugash sanasi"
                className={`${inputCls} border-0 w-[138px]`}
              />
            </div>

            {hasFilters && (
              <Button
                type="button"
                variant="ghost"
                onClick={clearFilters}
                className="h-10 px-3 text-sm text-muted-foreground border border-border hover:text-foreground gap-1.5"
              >
                <X className="size-3.5" strokeWidth={2} />
                Tozalash
              </Button>
            )}
          </div>
        </div>

        {/* Active filter chips */}
        {hasFilters && (
          <div className="flex flex-wrap gap-2">
            {activeFilters.map((f) => (
              <span
                key={f.key}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-secondary border border-border text-xs text-foreground"
              >
                <span className="text-muted-foreground">{f.label}:</span>
                {f.display}
                <button
                  type="button"
                  onClick={() => {
                    if (f.key === "search") setSearchInput("");
                    setParam(f.key, "");
                  }}
                  className="ml-0.5 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={`${f.label} filtrini olib tashlash`}
                >
                  <X className="size-3" strokeWidth={2.5} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Hodisa</th>
              <th>Obyekt</th>
              <th>Tavsif</th>
              <th>Bajaruvchi</th>
              <th>Sana</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={6} className="py-12 text-center text-sm text-muted-foreground">
                  Yuklanmoqda...
                </td>
              </tr>
            )}

            {isError && !isLoading && (
              <tr>
                <td colSpan={6} className="py-12 text-center text-sm text-danger">
                  Ma'lumotlarni yuklashda xatolik yuz berdi
                </td>
              </tr>
            )}

            {!isLoading && !isError && records.length === 0 && (
              <tr>
                <td colSpan={6} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <ClipboardList className="size-8 opacity-30" strokeWidth={1.5} />
                    <p className="text-sm">Yozuvlar topilmadi</p>
                  </div>
                </td>
              </tr>
            )}

            {!isLoading && !isError && records.map((r) => (
              <tr key={r._id}>
                <td>
                  <p className="text-sm text-foreground">
                    {eventTypeLabel[r.eventType] ?? r.eventType}
                  </p>
                  <p className="text-xs font-mono text-muted-foreground mt-0.5">{r.code}</p>
                </td>
                <td>
                  <span className="text-xs text-muted-foreground">
                    {entityTypeLabel[r.entityType] ?? r.entityType}
                  </span>
                </td>
                <td>
                  <p className="text-sm text-foreground max-w-[300px] truncate" title={r.description}>
                    {r.description}
                  </p>
                </td>
                <td>
                  {r.actor?.name ? (
                    <div>
                      <p className="text-sm text-foreground">{r.actor.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{r.actor.role}</p>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </td>
                <td className="text-sm text-muted-foreground whitespace-nowrap">
                  {formatUzDate(r.createdAt)}
                </td>
                <td>
                  <button
                    type="button"
                    onClick={() => openModal("recordDetail", r)}
                    className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                    title="Batafsil ko'rish"
                  >
                    <Eye className="size-4" strokeWidth={1.5} />
                  </button>
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