// TanStack Query
import { useQuery } from "@tanstack/react-query";

// React
import { useState } from "react";

// API
import { recordsAPI } from "@/features/records/api/records.api";

// Components
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";
import Button          from "@/shared/components/ui/button/Button";

// Hooks
import useModal from "@/shared/hooks/useModal";

// Data
import {
  eventTypeConfig,
  colorStyles,
  eventTypeLabel,
  actorRoleLabel,
  entityTypeLabel,
} from "@/features/records/data/records.data";

// Utils
import { formatUzDate } from "@/shared/utils/formatDate";

// Icons
import {
  History, AlertCircle, ChevronLeft, ChevronRight,
  UserPlus, UserCog, UserX,
  RefreshCw, ArrowRightLeft, Trash2, MousePointerClick,
  BookOpen, Edit, GraduationCap, LogOut,
  School, Wallet, CheckCircle2,
  CalendarCheck, CalendarCog, CalendarX,
  Banknote, BadgeCheck,
} from "lucide-react";

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

// ─── Modal wrapper ─────────────────────────────────────────────────────────────

const StudentHistoryModal = () => (
  <ResponsiveModal name="studentHistory" title="O'quvchi tarixi" className="max-w-2xl">
    <Content />
  </ResponsiveModal>
);

// ─── Content ──────────────────────────────────────────────────────────────────

const Content = ({ _id, firstName, lastName, close }) => {
  const [page, setPage] = useState(1);
  const { openModal } = useModal("recordDetail");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["student-history", _id, page],
    queryFn:  () => recordsAPI.getStudentHistory(_id, { page, limit: 20 }).then((r) => r.data),
    enabled:  !!_id,
    keepPreviousData: true,
  });

  const records    = data?.records    ?? [];
  const totalPages = data?.totalPages ?? 1;
  const total      = data?.total      ?? 0;

  return (
    <div className="space-y-4">
      {/* Student name */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-700">
          {firstName} {lastName}
        </p>
        <span className="text-xs text-gray-400">{total} ta yozuv</span>
      </div>

      {/* Timeline */}
      <div className="min-h-[200px]">
        {isLoading && <SkeletonList />}

        {isError && !isLoading && (
          <div className="flex flex-col items-center gap-2 py-12 text-gray-400">
            <AlertCircle className="size-7 opacity-40" strokeWidth={1.5} />
            <p className="text-sm">Yuklashda xatolik</p>
          </div>
        )}

        {!isLoading && !isError && records.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-12 text-gray-400">
            <History className="size-8 opacity-30" strokeWidth={1.5} />
            <p className="text-sm">Yozuvlar yo'q</p>
          </div>
        )}

        {!isLoading && !isError && records.length > 0 && (
          <div className="border border-border bg-white divide-y divide-gray-50 rounded-md overflow-hidden">
            {records.map((record) => (
              <RecordRow
                key={record._id}
                record={record}
                onDetail={() => openModal("recordDetail", record)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-1">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="gap-1"
          >
            <ChevronLeft size={14} />
            Oldingi
          </Button>
          <span className="text-xs text-gray-500">{page} / {totalPages}</span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="gap-1"
          >
            Keyingi
            <ChevronRight size={14} />
          </Button>
        </div>
      )}

      <div className="flex justify-end pt-1">
        <Button variant="secondary" className="w-full xs:w-28" onClick={() => close()}>
          Yopish
        </Button>
      </div>
    </div>
  );
};

// ─── Record row ───────────────────────────────────────────────────────────────

const RecordRow = ({ record, onDetail }) => {
  const cfg   = eventTypeConfig[record.eventType] ?? { color: "blue" };
  const color = colorStyles[cfg.color]            ?? colorStyles.blue;

  return (
    <div
      className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer group"
      onClick={onDetail}
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
        <p className="text-xs text-gray-400">{formatUzDate(record.createdAt)}</p>
        <p className="text-xs text-gray-300 mt-0.5">{fmtTime(record.createdAt)}</p>
        <p className="text-[10px] font-mono text-gray-300 mt-0.5 group-hover:text-gray-400 transition-colors">
          {record.code}
        </p>
      </div>
    </div>
  );
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const SkeletonList = () => (
  <div className="border border-border bg-white divide-y divide-gray-50 rounded-md overflow-hidden animate-pulse">
    {Array.from({ length: 6 }).map((_, i) => (
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
        <div className="w-14 space-y-1.5">
          <div className="h-2.5 bg-gray-100 rounded" />
          <div className="h-2 bg-gray-100 rounded" />
        </div>
      </div>
    ))}
  </div>
);

export default StudentHistoryModal;
