import { useState } from "react";
import { Phone, BookOpen, Calendar, MessageSquare, Pencil, X, GraduationCap } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/shared/components/shadcn/dialog";
import { STATUS_MAP, INTEREST_COLOR } from "../data/leads-crm.data";
import { formatDateUZ } from "@/shared/utils/date.utils";

const NON_STUDENT_ACTIONS = [
  { status: "yangi",          label: "⏳ Yangi"          },
  { status: "aloqa_qilingan", label: "📞 Aloqa qilingan" },
];

const InterestBar = ({ value }) => (
  <div className="flex items-center gap-2">
    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all ${INTEREST_COLOR(value)}`}
        style={{ width: `${value}%` }}
      />
    </div>
    <span className="text-sm font-semibold text-gray-700 shrink-0 w-10 text-right">{value}%</span>
  </div>
);

const LeadDetailModal = ({ lead, open, onClose, onEdit, onSetStatus }) => {
  const [converting, setConverting] = useState(false);

  if (!lead) return null;

  const badge = STATUS_MAP[lead.status];
  const isStudent = lead.status === "student";

  const handleConvert = () => {
    onSetStatus(lead.id, "student");
    setConverting(false);
  };

  const handleClose = () => {
    setConverting(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden" showClose={false}>

        {/* Header */}
        <DialogHeader className="px-5 pt-4 pb-3.5 border-b border-gray-100">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <DialogTitle className="text-base font-semibold text-gray-900 truncate">
                {lead.name}
              </DialogTitle>
              <div className="mt-1">
                <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded ${badge?.badge ?? ""}`}>
                  {badge?.label ?? lead.status}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => { handleClose(); onEdit(lead); }}
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700 border border-gray-200 rounded px-2 py-1 hover:bg-gray-50 transition-colors"
              >
                <Pencil size={11} />
                Tahrirlash
              </button>
              <button
                onClick={handleClose}
                aria-label="Yopish"
                className="flex items-center justify-center w-7 h-7 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
              >
                <X size={15} />
              </button>
            </div>
          </div>
        </DialogHeader>

        <div className="px-5 py-4 space-y-4">

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-3">
            <InfoRow icon={<Phone size={13} />}    label="Telefon"    value={lead.phone  || "—"} />
            <InfoRow icon={<BookOpen size={13} />}  label="Kurs"       value={lead.course || "—"} />
            <InfoRow icon={<Calendar size={13} />}  label="Qo'shilgan" value={lead.createdAt ? formatDateUZ(lead.createdAt) : "—"} />
            {isStudent && lead.convertedAt && (
              <InfoRow icon={<GraduationCap size={13} />} label="Studentga o'tgan" value={formatDateUZ(lead.convertedAt)} />
            )}
          </div>

          {/* Interest bar */}
          <div className="p-3 bg-gray-50 rounded">
            <p className="text-xs text-gray-400 mb-2">Qiziqish darajasi</p>
            <InterestBar value={lead.interestPercent ?? 0} />
          </div>

          {/* Notes */}
          {lead.notes && (
            <div className="p-3 bg-amber-50 border border-amber-100 rounded">
              <p className="flex items-center gap-1 text-xs text-amber-600 mb-1.5">
                <MessageSquare size={11} /> Izoh
              </p>
              <p className="text-sm text-amber-800 leading-relaxed">{lead.notes}</p>
            </div>
          )}

          {/* Actions */}
          {!isStudent && (
            <div className="pt-1">
              {!converting ? (
                <div className="space-y-3">
                  {/* Convert to student */}
                  <button
                    onClick={() => setConverting(true)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-green-600 text-white text-sm font-semibold rounded hover:bg-green-700 transition-colors"
                  >
                    <GraduationCap size={16} />
                    Studentga aylantirish
                  </button>

                  {/* Status change */}
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-2">Holat o'zgartirish:</p>
                    <div className="flex flex-wrap gap-2">
                      {NON_STUDENT_ACTIONS.filter((a) => a.status !== lead.status).map((a) => (
                        <button
                          key={a.status}
                          onClick={() => onSetStatus(lead.id, a.status)}
                          className="text-xs px-3 py-1.5 rounded border font-medium bg-white text-gray-700 border-gray-200 hover:border-gray-400 hover:bg-gray-50 transition-colors"
                        >
                          {a.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-green-50 border border-green-200 rounded">
                  <p className="text-sm font-semibold text-green-800 mb-3">
                    🎓 {lead.name} ni studentga aylantirmoqchimisiz?
                  </p>
                  <p className="text-xs text-green-700 mb-3">
                    Lead tarixda saqlanib qoladi, faqat statusi "Student" ga o'zgaradi.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={handleConvert}
                      className="text-sm px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-semibold"
                    >
                      Ha, aylantirish
                    </button>
                    <button
                      onClick={() => setConverting(false)}
                      className="text-sm px-4 py-2 border border-gray-200 text-gray-600 rounded hover:bg-gray-50"
                    >
                      Bekor
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {isStudent && (
            <div className="pt-1">
              <p className="text-xs font-medium text-gray-500 mb-2">Holat o'zgartirish:</p>
              <div className="flex flex-wrap gap-2">
                {NON_STUDENT_ACTIONS.map((a) => (
                  <button
                    key={a.status}
                    onClick={() => onSetStatus(lead.id, a.status)}
                    className="text-xs px-3 py-1.5 rounded border font-medium bg-white text-gray-700 border-gray-200 hover:border-gray-400 hover:bg-gray-50 transition-colors"
                  >
                    {a.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="px-5 py-3.5 border-t border-gray-100 flex justify-end">
          <button
            onClick={handleClose}
            className="text-xs px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-700 font-medium"
          >
            Yopish
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const InfoRow = ({ icon, label, value }) => (
  <div>
    <p className="flex items-center gap-1 text-xs text-gray-400 mb-0.5">{icon} {label}</p>
    <p className="text-sm font-medium text-gray-900">{value}</p>
  </div>
);

export default LeadDetailModal;
