// Toast
import { toast } from "sonner";

// React
import { useState } from "react";

// Query
import { useQuery, useQueryClient } from "@tanstack/react-query";

// API
import { enrollmentsAPI }      from "@/features/enrollments/api/enrollments.api";
import { classesAPI }          from "@/features/classes/api/classes.api";
import { rejectionReasonsAPI } from "@/features/settings/api/rejectionReasons.api";

// Components
import Button          from "@/shared/components/ui/button/Button";
import SelectField     from "@/shared/components/ui/select/SelectField";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

// Utils
import { cn } from "@/shared/utils/cn";

// Icons
import {
  BookOpen,
  GraduationCap,
  LogOut,
  ArrowRightLeft,
  AlertTriangle,
  ChevronRight,
} from "lucide-react";

// ─── Static data ──────────────────────────────────────────────────────────────

const STATUS_OPTIONS = [
  {
    value:      "active",
    label:      "O'qiyapti",
    desc:       "O'quvchi faol holda o'qishni davom ettirmoqda",
    icon:       BookOpen,
    activeCls:  "bg-white border-blue-300 shadow-sm",
    labelCls:   "text-blue-700",
    activeIcon: "text-blue-500",
    badgeBg:    "bg-blue-50",
    badgeText:  "text-blue-700",
  },
  {
    value:      "completed",
    label:      "Kursni bitirdi",
    desc:       "O'quvchi kursni muvaffaqiyatli yakunladi",
    icon:       GraduationCap,
    activeCls:  "bg-white border-green-300 shadow-sm",
    labelCls:   "text-green-700",
    activeIcon: "text-green-600",
    badgeBg:    "bg-green-50",
    badgeText:  "text-green-700",
  },
  {
    value:      "dropped",
    label:      "Tashlab ketdi",
    desc:       "O'quvchi kursni tugatmasdan chiqib ketdi. Sababini ko'rsating.",
    icon:       LogOut,
    activeCls:  "bg-white border-red-300 shadow-sm",
    labelCls:   "text-red-600",
    activeIcon: "text-red-500",
    badgeBg:    "bg-red-50",
    badgeText:  "text-red-600",
  },
];

// ─── Modal wrapper ────────────────────────────────────────────────────────────

const EnrollmentManageModal = () => (
  <ResponsiveModal name="enrollmentManage" title="O'quvchini boshqarish">
    <Content />
  </ResponsiveModal>
);

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  const opt = STATUS_OPTIONS.find((o) => o.value === status);
  if (!opt) return null;
  return (
    <span className={cn(
      "inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border",
      opt.badgeBg, opt.badgeText,
      status === "active"    ? "border-blue-200"  :
      status === "completed" ? "border-green-200" : "border-red-200"
    )}>
      <opt.icon className="size-3" strokeWidth={2} />
      {opt.label}
    </span>
  );
}

// ─── Content ──────────────────────────────────────────────────────────────────

const Content = ({
  close,
  isLoading,
  setIsLoading,
  enrollmentId,
  studentName       = "",
  currentGroupId,
  currentStatus     = "active",
  currentDropReasonId,
  studentId,
  discount,
  discountReason,
  paymentDay,
  debt,
  balance,
}) => {
  const qc = useQueryClient();

  const [status,        setStatus]        = useState(currentStatus);
  const [dropReasonId,  setDropReasonId]  = useState(currentDropReasonId ?? "");
  const [targetGroupId, setTargetGroupId] = useState("");

  // Rejection reasons — fetched only when "dropped" tab is active
  const { data: reasonsData, isLoading: reasonsLoading } = useQuery({
    queryKey: ["settings", "rejection-reasons"],
    queryFn:  () => rejectionReasonsAPI.getAll({ limit: 100 }).then((r) => r.data),
    enabled:  status === "dropped",
  });
  const reasons = reasonsData?.rejectionReasons ?? [];

  // Groups for transfer — fetched only when status stays "active"
  const { data: groupsData, isLoading: groupsLoading } = useQuery({
    queryKey: ["all-groups-for-transfer"],
    queryFn:  () => classesAPI.getAll({ limit: 200, isActive: true }).then((res) => res.data),
    enabled:  status === "active",
  });
  const allGroups = (groupsData?.groups ?? [])
    .filter((g) => g._id !== currentGroupId && g.isActive !== false)
    .map((g) => ({ value: g._id, label: g.name }));

  // ── Derived flags ─────────────────────────────────────────────────────────
  const statusChanged      = status !== currentStatus;
  const hasTransfer        = !!targetGroupId && status === "active";
  const droppedNeedsReason = status === "dropped" && !dropReasonId;
  const hasAction          = statusChanged || hasTransfer;
  const isValid            = hasAction && !droppedNeedsReason;

  const selectedOpt = STATUS_OPTIONS.find((o) => o.value === status);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const pickStatus = (val) => {
    setStatus(val);
    if (val !== "dropped") setDropReasonId("");
    if (val !== "active")  setTargetGroupId("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid) return;

    setIsLoading(true);
    try {
      if (hasTransfer) {
        await enrollmentsAPI.delete(enrollmentId);
        await enrollmentsAPI.create({
          student: studentId,
          group:   targetGroupId,
          ...(discount      != null && { discount }),
          ...(discountReason        && { discountReason }),
          ...(paymentDay    != null && { paymentDay }),
          ...(debt          != null && { debt }),
          ...(balance       != null && { balance }),
        });
        toast.success("O'quvchi muvaffaqiyatli o'tkazildi");
      } else {
        await enrollmentsAPI.update(enrollmentId, {
          status,
          dropReason: status === "dropped" ? dropReasonId : null,
        });
        toast.success(
          status === "completed" ? "Kurs tugatildi deb belgilandi"  :
          status === "dropped"   ? "O'quvchi kursdan chiqarildi"    :
                                   "Holat muvaffaqiyatli yangilandi"
        );
      }
      qc.invalidateQueries({ queryKey: ["group-detail"] });
      qc.invalidateQueries({ queryKey: ["users"] });
      close();
    } catch (err) {
      toast.error(err.response?.data?.message || "Xatolik yuz berdi");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* ── Student info card ── */}
      <div className="flex items-center gap-3 rounded-lg bg-gray-50 border border-gray-200 px-4 py-3">
        <div className="size-9 rounded-full bg-brown-100 flex items-center justify-center shrink-0">
          <span className="text-sm font-semibold text-brown-700">
            {studentName?.[0]?.toUpperCase() ?? "?"}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">{studentName}</p>
          <p className="text-xs text-gray-500 mt-0.5">Joriy holat:</p>
        </div>
        <StatusBadge status={currentStatus} />
      </div>

      {/* ── Status segmented control ── */}
      <div className="space-y-2.5">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
          Yangi holat
        </p>

        {/* 3-column pill tabs */}
        <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-gray-100 border border-gray-200">
          {STATUS_OPTIONS.map((opt) => {
            const Icon       = opt.icon;
            const isSelected = status === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => pickStatus(opt.value)}
                className={cn(
                  "flex flex-col items-center gap-1.5 py-3 px-1 rounded-lg border text-xs font-medium transition-all duration-150",
                  isSelected
                    ? cn(opt.activeCls, opt.labelCls)
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-white/70"
                )}
              >
                <Icon
                  className={cn("size-4", isSelected ? opt.activeIcon : "text-gray-400")}
                  strokeWidth={1.5}
                />
                <span className="text-center leading-tight">{opt.label}</span>
              </button>
            );
          })}
        </div>

        {/* Description of selected status */}
        {selectedOpt && (
          <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-gray-50 border border-gray-200">
            <ChevronRight className="size-3.5 text-gray-400 shrink-0 mt-0.5" />
            <p className="text-xs text-gray-600 leading-relaxed">{selectedOpt.desc}</p>
          </div>
        )}
      </div>

      {/* ── Rejection reasons — shown only when "dropped" ── */}
      {status === "dropped" && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
            Sabab tanlang{" "}
            <span className="text-red-500 normal-case tracking-normal font-normal">*</span>
          </p>

          {reasonsLoading ? (
            <div className="grid grid-cols-2 gap-1.5">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-9 rounded-lg bg-gray-100 border border-gray-200 animate-pulse"
                />
              ))}
            </div>
          ) : reasons.length === 0 ? (
            <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-amber-50 border border-amber-200">
              <AlertTriangle className="size-3.5 text-amber-600 shrink-0 mt-0.5" strokeWidth={1.5} />
              <p className="text-xs text-amber-800">
                Sabablar topilmadi. Sozlamalar → Rad etish sabablari bo'limidan qo'shing.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-1.5">
              {reasons.map((r) => (
                <button
                  key={r._id}
                  type="button"
                  onClick={() => setDropReasonId(r._id)}
                  className={cn(
                    "px-3 py-2.5 rounded-lg border text-xs font-medium text-left leading-snug transition-all duration-150",
                    dropReasonId === r._id
                      ? "bg-red-50 border-red-300 text-red-700 ring-1 ring-red-200"
                      : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                  )}
                >
                  {r.title}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Transfer section — shown only when status stays "active" ── */}
      {status === "active" && (
        <div className="space-y-3 pt-1">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
            <ArrowRightLeft className="size-3.5 text-gray-400" strokeWidth={1.5} />
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
              Boshqa guruhga o'tkazish
            </p>
            <span className="ml-auto text-[10px] text-gray-400 font-normal normal-case tracking-normal">
              ixtiyoriy
            </span>
          </div>

          <SelectField
            label=""
            value={targetGroupId}
            options={allGroups}
            onChange={setTargetGroupId}
            placeholder={groupsLoading ? "Guruhlar yuklanmoqda..." : "Guruh tanlang"}
            disabled={groupsLoading}
            searchable
          />

          {targetGroupId && (
            <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-amber-50 border border-amber-200">
              <AlertTriangle className="size-3.5 text-amber-600 shrink-0 mt-0.5" strokeWidth={1.5} />
              <p className="text-xs text-amber-800 leading-relaxed">
                O'quvchi yangi guruhga o'tkaziladi. Joriy yozilish o'chiriladi va moliyaviy ma'lumotlar ko'chiriladi.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── Actions ── */}
      <div className="flex flex-col-reverse gap-2.5 xs:flex-row xs:justify-end pt-2 border-t border-gray-200">
        <Button
          type="button"
          variant="secondary"
          className="w-full xs:w-auto"
          onClick={() => close()}
          disabled={isLoading}
        >
          Bekor qilish
        </Button>
        <Button
          className="w-full xs:w-auto xs:px-6"
          disabled={isLoading || !isValid}
        >
          {isLoading
            ? "Saqlanmoqda..."
            : hasTransfer
            ? "O'tkazish"
            : "Saqlash"}
        </Button>
      </div>
    </form>
  );
};

export default EnrollmentManageModal;
