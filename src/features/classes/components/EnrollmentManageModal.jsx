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
  CheckCircle2,
  ArrowRightLeft,
  User,
  AlertTriangle,
} from "lucide-react";

// ─── Static data ──────────────────────────────────────────────────────────────

const STATUS_OPTIONS = [
  {
    value: "active",
    label: "O'qiyapti",
    desc: "O'quvchi faol holda o'qishni davom ettirmoqda",
    icon: BookOpen,
    selectedBorder: "border-blue-500",
    selectedBg: "bg-blue-50",
    iconClass: "text-blue-500",
    checkClass: "text-blue-500",
  },
  {
    value: "completed",
    label: "Kursni bitirdi",
    desc: "O'quvchi kursni muvaffaqiyatli yakunladi",
    icon: GraduationCap,
    selectedBorder: "border-green-500",
    selectedBg: "bg-green-50",
    iconClass: "text-green-600",
    checkClass: "text-green-500",
  },
  {
    value: "dropped",
    label: "Kursni tashlab ketdi",
    desc: "O'quvchi kursni tugatmasdan chiqib ketdi",
    icon: LogOut,
    selectedBorder: "border-red-400",
    selectedBg: "bg-red-50",
    iconClass: "text-red-500",
    checkClass: "text-red-400",
  },
];

const STATUS_LABELS = {
  active: "Faol",
  completed: "Kursni bitirdi",
  dropped: "Tashlab ketdi",
};

// ─── Modal wrapper ────────────────────────────────────────────────────────────

const EnrollmentManageModal = () => (
  <ResponsiveModal name="enrollmentManage" title="O'quvchini boshqarish">
    <Content />
  </ResponsiveModal>
);

// ─── Content ──────────────────────────────────────────────────────────────────

const Content = ({
  close,
  isLoading,
  setIsLoading,
  enrollmentId,
  studentName,
  currentGroupId,
  currentStatus = "active",
  currentDropReasonId,
  studentId,
  discount,
  discountReason,
  paymentDay,
  debt,
  balance,
}) => {
  const qc = useQueryClient();

  const [status, setStatus]               = useState(currentStatus);
  const [dropReasonId, setDropReasonId]   = useState(currentDropReasonId ?? "");
  const [targetGroupId, setTargetGroupId] = useState("");

  // Rejection reasons — only fetched when "dropped" selected
  const { data: reasonsData, isLoading: reasonsLoading } = useQuery({
    queryKey: ["settings", "rejection-reasons"],
    queryFn:  () => rejectionReasonsAPI.getAll({ limit: 100 }).then((r) => r.data),
    enabled:  status === "dropped",
  });
  const reasons = reasonsData?.rejectionReasons ?? [];

  // All groups for transfer — only fetched when status stays "active"
  const { data: groupsData, isLoading: groupsLoading } = useQuery({
    queryKey: ["all-groups-for-transfer"],
    queryFn:  () => classesAPI.getAll({ limit: 200 }).then((res) => res.data),
    enabled:  status === "active",
  });
  const allGroups = (groupsData?.groups ?? [])
    .filter((g) => g._id !== currentGroupId)
    .map((g) => ({ value: g._id, label: g.name }));

  // ── Derived flags ─────────────────────────────────────────────────────────
  const statusChanged      = status !== currentStatus;
  const hasTransfer        = !!targetGroupId && status === "active";
  const droppedNeedsReason = status === "dropped" && !dropReasonId;
  const hasAction          = statusChanged || hasTransfer;
  const isValid            = hasAction && !droppedNeedsReason;

  // ── Submit ────────────────────────────────────────────────────────────────
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
        const msg =
          status === "completed" ? "Kurs bitirdi deb belgilandi" :
          status === "dropped"   ? "O'quvchi kursdan chiqarildi" :
                                   "Holat yangilandi";
        toast.success(msg);
      }
      qc.invalidateQueries({ queryKey: ["group-detail"] });
      close();
    } catch (err) {
      toast.error(err.response?.data?.message || "Xatolik yuz berdi");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* ── Student info ── */}
      <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-background-secondary border border-border-secondary">
        <div className="flex items-center justify-center size-9 rounded-full bg-border text-secondary shrink-0">
          <User className="size-4" strokeWidth={1.5} />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-primary truncate">{studentName}</p>
          <p className="text-xs text-secondary">
            {STATUS_LABELS[currentStatus] ?? currentStatus}
          </p>
        </div>
      </div>

      {/* ── Status section ── */}
      <div className="space-y-2">
        <p className="text-[10px] font-semibold text-secondary uppercase tracking-widest">
          Holat o'zgartirish
        </p>

        <div className="space-y-2">
          {STATUS_OPTIONS.map((opt) => {
            const Icon       = opt.icon;
            const isSelected = status === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  setStatus(opt.value);
                  if (opt.value !== "dropped") setDropReasonId("");
                  if (opt.value !== "active")  setTargetGroupId("");
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-lg border text-left transition-all",
                  isSelected
                    ? cn(opt.selectedBorder, opt.selectedBg)
                    : "border-border-secondary hover:border-border bg-white"
                )}
              >
                <Icon
                  className={cn("size-4 shrink-0", isSelected ? opt.iconClass : "text-secondary")}
                  strokeWidth={1.5}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-primary">{opt.label}</p>
                  <p className="text-xs text-secondary truncate">{opt.desc}</p>
                </div>
                {isSelected && (
                  <CheckCircle2 className={cn("size-4 shrink-0", opt.checkClass)} />
                )}
              </button>
            );
          })}
        </div>

        {/* Rejection reason — only when "dropped" */}
        {status === "dropped" && (
          <div className="pt-1 space-y-2">
            <p className="text-xs font-medium text-secondary">
              Sababni tanlang <span className="text-red-500">*</span>
            </p>
            {reasonsLoading ? (
              <p className="text-sm text-secondary py-1">Yuklanmoqda...</p>
            ) : reasons.length === 0 ? (
              <p className="text-xs text-secondary italic">
                Sabablar topilmadi. Sozlamalar → Rad etish sabablari bo'limidan qo'shing.
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-1.5">
                {reasons.map((r) => (
                  <button
                    key={r._id}
                    type="button"
                    onClick={() => setDropReasonId(r._id)}
                    className={cn(
                      "text-left text-sm px-3 py-2 border rounded-lg transition-all",
                      dropReasonId === r._id
                        ? "border-red-400 bg-red-50 text-red-800 font-medium"
                        : "border-border-secondary hover:border-red-300 hover:bg-red-50/50 text-primary"
                    )}
                  >
                    {r.title}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Transfer section — only when status stays "active" ── */}
      {status === "active" && (
        <div className="space-y-3 pt-3 border-t border-border-secondary">
          <div className="flex items-center gap-2">
            <ArrowRightLeft className="size-3.5 text-secondary" strokeWidth={1.5} />
            <p className="text-[10px] font-semibold text-secondary uppercase tracking-widest">
              Boshqa guruhga o'tkazish
            </p>
          </div>

          <SelectField
            label="Yangi guruh (ixtiyoriy)"
            value={targetGroupId}
            options={allGroups}
            onChange={setTargetGroupId}
            placeholder={groupsLoading ? "Yuklanmoqda..." : "Guruh tanlang"}
            disabled={groupsLoading}
            searchable
          />

          {targetGroupId && (
            <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-amber-50 border border-amber-200">
              <AlertTriangle className="size-3.5 text-amber-600 shrink-0 mt-0.5" strokeWidth={1.5} />
              <p className="text-xs text-amber-800">
                O'quvchi tanlangan guruhga o'tkaziladi. Joriy yozilish o'chiriladi.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── Action buttons ── */}
      <div className="flex flex-col-reverse gap-3 xs:flex-row xs:justify-end pt-1">
        <Button
          type="button"
          variant="secondary"
          className="w-full xs:w-32"
          onClick={() => close()}
          disabled={isLoading}
        >
          Bekor qilish
        </Button>
        <Button
          className="w-full xs:w-auto xs:px-5"
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
