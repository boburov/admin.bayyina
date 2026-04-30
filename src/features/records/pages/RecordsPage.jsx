// TanStack Query
import { useQuery } from "@tanstack/react-query";

// React
import { useCallback, useMemo, useRef, useState } from "react";

// Router
import { useSearchParams } from "react-router-dom";

// API
import { recordsAPI } from "@/features/records/api/records.api";

// Components
import Pagination        from "@/shared/components/ui/Pagination";
import DynamicSelect     from "@/shared/components/ui/DynamicSelect";
import RecordDetailModal from "@/features/records/components/RecordDetailModal";

// Hooks
import useModal from "@/shared/hooks/useModal";

// Icons
import {
  Search, X, History, AlertCircle,
  UserPlus, UserCog, UserX,
  RefreshCw, ArrowRightLeft, Trash2, MousePointerClick,
  BookOpen, Edit, GraduationCap, LogOut,
  School, Wallet, CheckCircle2,
  CalendarCheck, CalendarCog, CalendarX,
  Banknote, BadgeCheck,
} from "lucide-react";

// Data
import {
  eventTypeLabel,
  entityTypeLabel,
  actorRoleLabel,
  eventTypeConfig,
  colorStyles,
  getDateGroup,
  dateGroupLabel,
  DATE_GROUP_ORDER,
} from "@/features/records/data/records.data";

// ─── Icon map ─────────────────────────────────────────────────────────────────
const ICON_MAP = {
  UserPlus, UserCog, UserX,
  RefreshCw, ArrowRightLeft, Trash2, MousePointerClick,
  BookOpen, Edit, GraduationCap, LogOut,
  School, Wallet, CheckCircle2, AlertCircle,
  CalendarCheck, CalendarCog, CalendarX,
  Banknote, BadgeCheck,
};

const EventIcon = ({ eventType }) => {
  const cfg   = eventTypeConfig[eventType] ?? { color: "blue", icon: "History" };
  const color = colorStyles[cfg.color]     ?? colorStyles.blue;
  const Icon  = ICON_MAP[cfg.icon]         ?? History;
  return (
    <span className={`flex items-center justify-center w-8 h-8 rounded-full shrink-0 ${color.icon}`}>
      <Icon size={14} strokeWidth={1.75} />
    </span>
  );
};

const EventTag = ({ eventType }) => {
  const cfg   = eventTypeConfig[eventType] ?? { color: "blue" };
  const color = colorStyles[cfg.color]     ?? colorStyles.blue;
  return (
    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${color.tag}`}>
      {eventTypeLabel[eventType] ?? eventType}
    </span>
  );
};

const fmtTime = (iso) => {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" });
};

const todayStr = () => new Date().toISOString().slice(0, 10);

// ─── Page ─────────────────────────────────────────────────────────────────────
const RecordsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const debounceRef = useRef(null);
  const { openModal } = useModal("recordDetail");

  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  const entityTypeF = searchParams.get("entityType") || "";
  const searchF     = searchParams.get("search")     || "";

  const [searchInput, setSearchInput] = useState(searchF);

  const setParam = useCallback((key, value) => {
    setSearchParams((prev) => {
      const p = new URLSearchParams(prev);
      if (value) p.set(key, value); else p.delete(key);
      p.set("page", "1");
      return p;
    });
  }, [setSearchParams]);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchInput(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setParam("search", val.trim()), 400);
  };

  const clearFilters = () => {
    setSearchInput("");
    clearTimeout(debounceRef.current);
    setSearchParams({ page: "1" });
  };

  const goToPage = useCallback((page) => {
    if (page < 1) return;
    setSearchParams((prev) => {
      const p = new URLSearchParams(prev);
      p.set("page", page.toString());
      return p;
    });
  }, [setSearchParams]);

  const hasFilters = !!(entityTypeF || searchF);

  const queryParams = {
    page:  currentPage,
    limit: 25,
    ...(entityTypeF && { entityType: entityTypeF }),
    ...(searchF     && { search:     searchF     }),
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ["records", queryParams],
    queryFn:  () => recordsAPI.getAll(queryParams).then((r) => r.data),
    keepPreviousData: true,
  });

  // Today summary — only on page 1 with no filters
  const today = todayStr();
  const { data: todayData } = useQuery({
    queryKey: ["records", "today-summary", today],
    queryFn:  () => recordsAPI.getAll({ from: today, to: today, limit: 100 }).then((r) => r.data),
    staleTime: 60_000,
    enabled:  currentPage === 1 && !hasFilters,
  });

  const records     = data?.records    ?? [];
  const totalPages  = data?.totalPages ?? 1;
  const hasNextPage = data?.hasNextPage ?? false;
  const hasPrevPage = data?.hasPrevPage ?? false;

  const grouped = useMemo(() => {
    const map = {};
    DATE_GROUP_ORDER.forEach((k) => { map[k] = []; });
    records.forEach((r) => { map[getDateGroup(r.createdAt)].push(r); });
    return DATE_GROUP_ORDER
      .filter((k) => map[k].length > 0)
      .map((k) => ({ key: k, label: dateGroupLabel[k], items: map[k] }));
  }, [records]);

  const todaySummary = useMemo(() => {
    const items = todayData?.records ?? [];
    const counts = { green: 0, blue: 0, amber: 0, red: 0 };
    items.forEach((r) => {
      const color = (eventTypeConfig[r.eventType] ?? {}).color ?? "blue";
      counts[color] = (counts[color] ?? 0) + 1;
    });
    return { total: items.length, ...counts };
  }, [todayData]);

  return (
    <div className="space-y-5">
      <RecordDetailModal />

      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Faoliyat tarixi</h1>
      </div>

      {/* Today summary */}
      {currentPage === 1 && !hasFilters && (
        <TodaySummaryCard summary={todaySummary} loading={!todayData} />
      )}

      {/* Filter bar — 2 filters only */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-gray-400 pointer-events-none" strokeWidth={1.5} />
          <input
            type="text"
            value={searchInput}
            placeholder="Qidiruv..."
            onChange={handleSearchChange}
            className="h-9 w-full pl-8 pr-3 border border-gray-200 rounded-md bg-white text-sm placeholder:text-gray-400 outline-none focus:ring-1 focus:ring-gray-300"
          />
        </div>

        {/* Entity type — driven by /select-options?type=entity_type */}
        <DynamicSelect
          type="entity_type"
          value={entityTypeF}
          onChange={(v) => setParam("entityType", v)}
          allLabel="Barcha bo'limlar"
          className="min-w-[160px]"
        />

        {hasFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 h-9 px-3 text-xs text-gray-500 hover:text-gray-800 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
          >
            <X size={12} strokeWidth={2} />
            Tozalash
          </button>
        )}
      </div>

      {/* Timeline */}
      <div className="space-y-6">
        {isLoading && <SkeletonFeed />}

        {isError && !isLoading && (
          <div className="flex flex-col items-center gap-2 py-16 text-gray-400">
            <AlertCircle className="size-8 opacity-40" strokeWidth={1.5} />
            <p className="text-sm">Ma'lumotlarni yuklashda xatolik yuz berdi</p>
          </div>
        )}

        {!isLoading && !isError && records.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-16 text-gray-400">
            <History className="size-10 opacity-30" strokeWidth={1.5} />
            <p className="text-sm">Yozuvlar topilmadi</p>
          </div>
        )}

        {!isLoading && !isError && grouped.map((group) => (
          <DateGroup
            key={group.key}
            label={group.label}
            items={group.items}
            onDetail={(r) => openModal("recordDetail", r)}
          />
        ))}
      </div>

      {/* Pagination */}
      {!isLoading && !isError && records.length > 0 && (
        <div className="overflow-x-auto">
          <Pagination
            maxPageButtons={5}
            showPageNumbers={true}
            onPageChange={goToPage}
            currentPage={currentPage}
            hasNextPage={hasNextPage}
            hasPrevPage={hasPrevPage}
            totalPages={totalPages}
            className="pt-2 min-w-max"
          />
        </div>
      )}
    </div>
  );
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const TodaySummaryCard = ({ summary, loading }) => {
  if (loading) {
    return (
      <div className="border border-border bg-white p-4 animate-pulse rounded-md">
        <div className="h-3 w-24 bg-gray-100 rounded mb-3" />
        <div className="flex gap-5">
          {[1, 2, 3].map((i) => <div key={i} className="h-8 w-14 bg-gray-100 rounded" />)}
        </div>
      </div>
    );
  }
  if (summary.total === 0) return null;

  const items = [
    { label: "Jami",            value: summary.total, cls: "text-gray-900"  },
    { label: "Muvaffaqiyatli",  value: summary.green, cls: "text-green-600" },
    { label: "Yangilanish",     value: summary.amber, cls: "text-amber-600" },
    { label: "O'chirish",       value: summary.red,   cls: "text-red-600"   },
  ].filter((i) => i.value > 0);

  return (
    <div className="border border-border bg-white p-4 rounded-md">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Bugungi faollik</p>
      <div className="flex flex-wrap gap-6">
        {items.map((item) => (
          <div key={item.label}>
            <p className={`text-xl font-bold ${item.cls}`}>{item.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const DateGroup = ({ label, items, onDetail }) => (
  <div>
    <div className="flex items-center gap-3 mb-3">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest shrink-0">{label}</p>
      <div className="flex-1 h-px bg-gray-100" />
      <span className="text-xs text-gray-400 shrink-0">{items.length} ta</span>
    </div>
    <div className="border border-border bg-white divide-y divide-gray-50 rounded-md overflow-hidden">
      {items.map((record) => (
        <RecordRow key={record._id} record={record} onDetail={onDetail} />
      ))}
    </div>
  </div>
);

const RecordRow = ({ record, onDetail }) => {
  const cfg   = eventTypeConfig[record.eventType] ?? { color: "blue" };
  const color = colorStyles[cfg.color]            ?? colorStyles.blue;

  return (
    <div
      className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer group"
      onClick={() => onDetail(record)}
    >
      <EventIcon eventType={record.eventType} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-0.5">
          <EventTag eventType={record.eventType} />
          <span className="text-xs text-gray-400">{entityTypeLabel[record.entityType] ?? record.entityType}</span>
        </div>
        <p className="text-sm text-gray-800 leading-snug">{record.description}</p>
        {record.actor?.name && (
          <p className="text-xs text-gray-400 mt-0.5">
            <span className={`font-medium ${color.text}`}>{record.actor.name}</span>
            {" · "}
            {actorRoleLabel[record.actor.role] ?? record.actor.role}
          </p>
        )}
      </div>
      <div className="text-right shrink-0">
        <p className="text-xs text-gray-400">{fmtTime(record.createdAt)}</p>
        <p className="text-[10px] font-mono text-gray-300 mt-0.5 group-hover:text-gray-400 transition-colors">
          {record.code}
        </p>
      </div>
    </div>
  );
};

const SkeletonFeed = () => (
  <div className="space-y-6 animate-pulse">
    {[6, 4].map((count, gi) => (
      <div key={gi}>
        <div className="flex items-center gap-3 mb-3">
          <div className="h-3 w-16 bg-gray-100 rounded" />
          <div className="flex-1 h-px bg-gray-100" />
        </div>
        <div className="border border-border bg-white divide-y divide-gray-50 rounded-md overflow-hidden">
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="flex items-start gap-3 px-4 py-3">
              <div className="w-8 h-8 rounded-full bg-gray-100 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="flex gap-2">
                  <div className="h-3 w-24 bg-gray-100 rounded" />
                  <div className="h-3 w-16 bg-gray-100 rounded" />
                </div>
                <div className="h-3 w-3/4 bg-gray-100 rounded" />
                <div className="h-2.5 w-1/3 bg-gray-100 rounded" />
              </div>
              <div className="w-10 space-y-1.5">
                <div className="h-2.5 bg-gray-100 rounded" />
                <div className="h-2 bg-gray-100 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
);

export default RecordsPage;
