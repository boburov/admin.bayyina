import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Phone, Calendar, MessageSquare, X, GraduationCap,
  BookOpen, CreditCard, Wallet, AlertCircle,
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/shared/components/shadcn/dialog";
import { STATUS_MAP, FORM_STATUS_OPTIONS } from "../data/leads-crm.data";
import Button from "@/shared/components/ui/button/Button";
import SelectField from "@/shared/components/ui/select/SelectField";
import { formatDateUZ }    from "@/shared/utils/date.utils";
import { usersAPI }        from "@/features/users/api/users.api";
import { enrollmentsAPI }  from "@/features/enrollments/api/enrollments.api";
import { paymentsAPI }     from "@/features/payments/api/payments.api";
import { rejectionReasonsAPI } from "@/features/settings/api/rejectionReasons.api";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmt = (n) => Number(n || 0).toLocaleString("uz-UZ");

const MONTH_NAMES = [
  "Yanvar","Fevral","Mart","Aprel","May","Iyun",
  "Iyul","Avgust","Sentyabr","Oktyabr","Noyabr","Dekabr",
];

const formatMonth = (date) => {
  if (!date) return "—";
  const d = new Date(date);
  return `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
};

const InfoRow = ({ icon, label, value }) => (
  <div>
    <p className="flex items-center gap-1 text-xs text-gray-400 mb-0.5">{icon} {label}</p>
    <p className="text-sm font-medium text-gray-900">{value}</p>
  </div>
);

// ─── Student section (for converted leads) ────────────────────────────────────

const StudentSection = ({ lead }) => {
  const phone = String(lead.phone ?? "");

  const { data: userData, isLoading: userLoading } = useQuery({
    queryKey: ["student-by-phone", phone],
    queryFn: () =>
      usersAPI.searchStudents({ q: phone, limit: 1 }).then((r) => r.data),
    enabled: !!phone,
    staleTime: 2 * 60_000,
  });

  const student = userData?.users?.[0];

  const { data: enrollData, isLoading: enrollLoading } = useQuery({
    queryKey: ["enrollments", student?._id],
    queryFn: () =>
      enrollmentsAPI.getAll({ student: student._id }).then((r) => r.data),
    enabled: !!student?._id,
    staleTime: 60_000,
  });

  const { data: payData, isLoading: payLoading } = useQuery({
    queryKey: ["payments-lead", student?._id],
    queryFn: () =>
      paymentsAPI.getAll({ student: student._id, limit: 20 }).then((r) => r.data),
    enabled: !!student?._id,
    staleTime: 60_000,
  });

  const enrollments = enrollData?.enrollments ?? [];
  const payments    = payData?.payments ?? [];

  if (userLoading) {
    return (
      <div className="flex justify-center py-6">
        <div className="w-5 h-5 border-2 border-gray-200 border-t-gray-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded text-sm text-amber-700">
        <AlertCircle size={14} />
        Tizimda o'quvchi topilmadi (telefon bo'yicha)
      </div>
    );
  }

  return (
    <div className="space-y-4">

      {/* Student name */}
      <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-100 rounded">
        <div className="w-8 h-8 bg-green-100 border border-green-200 flex items-center justify-center text-sm font-semibold text-green-800">
          {student.firstName?.[0]?.toUpperCase() ?? "?"}
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">
            {student.firstName} {student.lastName}
          </p>
          <p className="text-xs text-green-600">O'quvchi sifatida qabul qilingan</p>
        </div>
      </div>

      {/* Enrollments */}
      <div>
        <p className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-2">
          <BookOpen size={12} /> Guruhlar
        </p>
        {enrollLoading ? (
          <div className="h-8 bg-gray-100 rounded animate-pulse" />
        ) : enrollments.length === 0 ? (
          <p className="text-xs text-gray-400">Guruhga biriktirilmagan</p>
        ) : (
          <div className="space-y-2">
            {enrollments.map((en) => (
              <div key={en._id} className="p-3 border border-gray-200 rounded bg-white">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-sm font-medium text-gray-900">{en.group?.name ?? "—"}</p>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                    en.status === "active"    ? "bg-green-50 text-green-700" :
                    en.status === "completed" ? "bg-blue-50 text-blue-700"  :
                    "bg-red-50 text-red-700"
                  }`}>
                    {en.status === "active" ? "Faol" : en.status === "completed" ? "Yakunlangan" : "Tark etgan"}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <p className="text-gray-400">Chegirma</p>
                    <p className="font-medium">{en.discount ? `${en.discount}%` : "Yo'q"}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 flex items-center gap-0.5"><AlertCircle size={10}/> Qarz</p>
                    <p className={`font-medium ${en.debt > 0 ? "text-red-600" : "text-gray-700"}`}>
                      {fmt(en.debt)} so'm
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 flex items-center gap-0.5"><Wallet size={10}/> Balans</p>
                    <p className={`font-medium ${en.balance > 0 ? "text-green-600" : "text-gray-700"}`}>
                      {fmt(en.balance)} so'm
                    </p>
                  </div>
                </div>
                {en.nextPaymentDate && (
                  <p className="mt-1.5 text-[10px] text-gray-400">
                    Keyingi to'lov: {formatDateUZ(en.nextPaymentDate)}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Payment history */}
      <div>
        <p className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-2">
          <CreditCard size={12} /> To'lovlar tarixi
        </p>
        {payLoading ? (
          <div className="h-8 bg-gray-100 rounded animate-pulse" />
        ) : payments.length === 0 ? (
          <p className="text-xs text-gray-400">To'lovlar yo'q</p>
        ) : (
          <div className="divide-y divide-gray-100 border border-gray-200 rounded overflow-hidden">
            {payments.map((p) => (
              <div key={p._id} className="flex items-center justify-between px-3 py-2 bg-white">
                <div>
                  <p className="text-xs font-medium text-gray-800">{formatMonth(p.month)}</p>
                  {p.note && <p className="text-[10px] text-gray-400">{p.note}</p>}
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{fmt(p.amount)} so'm</p>
                  <p className={`text-[10px] ${
                    p.status === "paid"    ? "text-green-600" :
                    p.status === "overdue" ? "text-red-500"   : "text-amber-500"
                  }`}>
                    {p.status === "paid" ? "To'langan" : p.status === "overdue" ? "Muddati o'tgan" : "Kutilmoqda"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Status change section ────────────────────────────────────────────────────

const StatusChangeSection = ({ lead, onSetStatus }) => {
  const [pendingStatus, setPendingStatus] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const { data: rrData } = useQuery({
    queryKey: ["rejection-reasons"],
    queryFn: () => rejectionReasonsAPI.getAll().then((r) => r.data),
    staleTime: 10 * 60_000,
    enabled: pendingStatus === "rejected",
  });

  const reasons = rrData?.rejectionReasons ?? rrData?.reasons ?? [];

  const handleStatusClick = (status) => {
    if (status === "rejected") {
      setPendingStatus("rejected");
    } else {
      onSetStatus(lead._id, status);
      setPendingStatus(null);
    }
  };

  const confirmReject = () => {
    onSetStatus(lead._id, "rejected", rejectionReason || undefined);
    setPendingStatus(null);
    setRejectionReason("");
  };

  const changeOptions = FORM_STATUS_OPTIONS.filter((s) => s.value !== lead.status);

  if (pendingStatus === "rejected") {
    return (
      <div className="p-3 bg-red-50 border border-red-200 rounded space-y-2">
        <p className="text-xs font-medium text-red-700">Bekor qilish sababi:</p>
        <SelectField
          name="rejectionReason"
          options={reasons.map((r) => ({ value: r._id, label: r.title }))}
          value={rejectionReason}
          onChange={(val) => setRejectionReason(val)}
          placeholder="Sabab tanlang (ixtiyoriy)"
        />
        <div className="flex gap-2">
          <Button type="button" variant="danger" size="sm" onClick={confirmReject}>
            Tasdiqlash
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => setPendingStatus(null)}>
            Bekor
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <p className="text-xs font-medium text-gray-500 mb-2">Holat o'zgartirish:</p>
      <div className="flex flex-wrap gap-2">
        {changeOptions.map((s) => (
          <Button
            key={s.value}
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleStatusClick(s.value)}
          >
            {s.label}
          </Button>
        ))}
      </div>
    </div>
  );
};

// ─── Main modal ───────────────────────────────────────────────────────────────

const LeadDetailModal = ({ lead, open, onClose, onSetStatus, onConvert }) => {
  if (!lead) return null;

  const badge       = STATUS_MAP[lead.status];
  const isConverted = lead.status === "converted";
  const isRejected  = lead.status === "rejected";
  const interest    = lead.courseType?.name ?? lead.interest?.name;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="w-[90vw] max-w-lg p-0 gap-0 max-h-[90vh] flex flex-col" showClose={false}>

        {/* Header */}
        <DialogHeader className="px-5 pt-4 pb-3.5 border-b border-gray-100 shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <DialogTitle className="text-base font-semibold text-gray-900 truncate">
                {lead.firstName} {lead.lastName}
              </DialogTitle>
              <div className="mt-1">
                <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded ${badge?.badge ?? ""}`}>
                  {badge?.label ?? lead.status}
                </span>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="shrink-0"
            >
              <X size={15} />
            </Button>
          </div>
        </DialogHeader>

        {/* Body — scrollable */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">

          {/* Basic info */}
          <div className="grid grid-cols-2 gap-3">
            <InfoRow
              icon={<Phone size={13} />}
              label="Telefon"
              value={lead.phone ? `+${lead.phone}` : "—"}
            />
            <InfoRow
              icon={<Calendar size={13} />}
              label="Qo'shilgan"
              value={lead.createdAt ? formatDateUZ(lead.createdAt) : "—"}
            />
            {interest && (
              <InfoRow
                icon={<BookOpen size={13} />}
                label="Qiziqish"
                value={interest}
              />
            )}
            {lead.source?.name && (
              <InfoRow
                icon={<span className="text-xs">📡</span>}
                label="Manba"
                value={lead.source.name}
              />
            )}
          </div>

          {lead.notes && (
            <div className="p-3 bg-amber-50 border border-amber-100 rounded">
              <p className="flex items-center gap-1 text-xs text-amber-600 mb-1.5">
                <MessageSquare size={11} /> Izoh
              </p>
              <p className="text-sm text-amber-800 leading-relaxed">{lead.notes}</p>
            </div>
          )}

          {/* Converted → show student detail */}
          {isConverted && <StudentSection lead={lead} />}

          {/* Non-converted actions */}
          {!isConverted && (
            <div className="space-y-3 pt-1">
              <Button
                type="button"
                variant="default"
                className="w-full bg-green-600 hover:bg-green-700"
                onClick={() => { onClose(); onConvert(lead); }}
              >
                <GraduationCap size={16} />
                O'quvchi sifatida qabul qilish
              </Button>
              <StatusChangeSection lead={lead} onSetStatus={onSetStatus} />
            </div>
          )}
        </div>

        <div className="px-5 py-3.5 border-t border-gray-100 flex justify-end shrink-0">
          <Button type="button" variant="secondary" size="sm" onClick={onClose}>
            Yopish
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LeadDetailModal;
