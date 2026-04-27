// TanStack Query
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Toast
import { toast } from "sonner";

// React
import { useState, useEffect } from "react";

// API
import { leadsAPI } from "../api/leads.api";
import { rejectionReasonsAPI } from "@/features/settings/api/rejectionReasons.api";

// Components
import LeadStatusBadge from "./LeadStatusBadge";

// Data
import { STATUS_OPTIONS, SOURCE_OPTIONS } from "../data/leads.data";

// Utils
import { formatDateUZ } from "@/shared/utils/date.utils";

// Icons
import { Phone, X, User, Calendar, Briefcase, MapPin, MessageSquare } from "lucide-react";

// Shadcn
import {
  Dialog,
  DialogTitle,
  DialogHeader,
  DialogContent,
} from "@/shared/components/shadcn/dialog";

const LeadDetailModal = ({ lead, open, onClose }) => {
  const queryClient = useQueryClient();
  const [isRejecting, setIsRejecting] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  // Fetch rejection reasons
  const { data: reasonsData } = useQuery({
    queryKey: ["settings", "rejection-reasons"],
    queryFn:  () => rejectionReasonsAPI.getAll({ limit: 100 }).then((r) => r.data),
    enabled:  open && (isRejecting || lead?.status === "rejected"),
  });
  const reasons = reasonsData?.rejectionReasons ?? [];

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => leadsAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      toast.success("Lead yangilandi");
      setIsRejecting(false);
    },
    onError: (err) => toast.error(err.response?.data?.message || "Xatolik"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => leadsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      toast.success("Lead o'chirildi");
      onClose();
    },
    onError: (err) => toast.error(err.response?.data?.message || "Xatolik"),
  });

  if (!lead) return null;

  const changeStatus = (status) => {
    if (status === "rejected") {
      setIsRejecting(true);
      return;
    }
    updateMutation.mutate({ id: lead._id, data: { status, rejectionReason: null } });
  };

  const handleReject = (reasonId) => {
    updateMutation.mutate({
      id:   lead._id,
      data: { status: "rejected", rejectionReason: reasonId },
    });
  };

  const QUICK_ACTIONS = [
    { label: "⏳ Kutilmoqda",    status: "new",        color: "bg-slate-50  hover:bg-slate-100  text-slate-700  border-slate-200"  },
    { label: "📞 Bog'lashildi",  status: "contacted",  color: "bg-yellow-50 hover:bg-yellow-100 text-yellow-700 border-yellow-200" },
    { label: "💡 Qiziqdi",       status: "interested", color: "bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200" },
    { label: "📅 Rejalashtir",   status: "scheduled",  color: "bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200" },
    { label: "🎓 Qabul qilish",  status: "converted",  color: "bg-green-50  hover:bg-green-100  text-green-700  border-green-200"  },
    { label: "🚫 Bekor qilish",  status: "rejected",   color: "bg-red-50    hover:bg-red-100    text-red-700    border-red-200"    },
  ];

  const handleClose = () => {
    setIsRejecting(false);
    setIsConfirmingDelete(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-5 pb-4 border-b border-gray-100">
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-base font-semibold text-gray-900">
                {lead.firstName}
              </DialogTitle>
              <div className="flex items-center gap-2 mt-1">
                <LeadStatusBadge status={lead.status} />
                {lead.source && (
                  <span className="text-xs text-gray-400">{lead.source?.name ?? lead.source}</span>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 py-4 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Info rows */}
          <div className="grid grid-cols-2 gap-3">
            <InfoRow icon={<Phone size={13} />} label="Telefon" value={lead.phone || "—"} />
            <InfoRow icon={<User size={13} />} label="Jins"
              value={lead.gender === "male" ? "Erkak" : lead.gender === "female" ? "Ayol" : "—"} />
            <InfoRow icon={<User size={13} />} label="Yosh" value={lead.age || "—"} />
            <InfoRow icon={<Briefcase size={13} />} label="Kasb" value={lead.profession || "—"} />
            <InfoRow icon={<MapPin size={13} />} label="Manba" value={lead.source?.name ?? lead.source ?? "—"} />
            <InfoRow icon={<Calendar size={13} />} label="Yaratilgan"
              value={lead.createdAt ? formatDateUZ(lead.createdAt) : "—"} />
          </div>

          {lead.interest && (
            <div className="p-3 bg-gray-50 rounded-md">
              <p className="text-xs text-gray-400 mb-1">Qiziqish</p>
              <p className="text-sm font-medium text-gray-800">{lead.interest?.name ?? lead.interest}</p>
            </div>
          )}

          {/* Rejection reason display */}
          {lead.status === "rejected" && lead.rejectionReason && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-md">
              <p className="text-xs text-red-600 mb-1">Bekor qilish sababi</p>
              <p className="text-sm font-semibold text-red-800">
                {typeof lead.rejectionReason === 'object' ? lead.rejectionReason.title : lead.rejectionReason}
              </p>
            </div>
          )}

          {lead.notes && (
            <div className="p-3 bg-amber-50 border border-amber-100 rounded-md">
              <p className="flex items-center gap-1 text-xs text-amber-600 mb-1">
                <MessageSquare size={11} /> Izoh
              </p>
              <p className="text-sm text-amber-800">{lead.notes}</p>
            </div>
          )}

          {/* Quick status actions */}
          <div className="pt-2">
            {!isRejecting ? (
              <>
                <p className="text-xs font-medium text-gray-500 mb-2">Holat o'zgartirish:</p>
                <div className="flex flex-wrap gap-2">
                  {QUICK_ACTIONS.filter(a => a.status !== lead.status).map((a) => (
                    <button
                      key={a.status}
                      onClick={() => changeStatus(a.status)}
                      disabled={updateMutation.isPending}
                      className={`text-xs px-3 py-1.5 rounded border font-medium transition-colors ${a.color}`}
                    >
                      {a.label}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-bold text-gray-700 uppercase tracking-wider">Bekor qilish sababini tanlang:</p>
                  <button
                    onClick={() => setIsRejecting(false)}
                    className="text-[10px] text-gray-400 hover:text-gray-600 underline"
                  >
                    Bekor qilish
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-1.5">
                  {reasons.length === 0 ? (
                    <p className="text-xs text-gray-400 italic">Sabablar topilmadi. Sozlamalardan qo'shing.</p>
                  ) : (
                    reasons.map((r) => (
                      <button
                        key={r._id}
                        onClick={() => handleReject(r._id)}
                        disabled={updateMutation.isPending}
                        className="text-left text-xs px-3 py-2 bg-white border border-gray-200 rounded hover:border-red-300 hover:bg-red-50 text-gray-700 transition-all"
                      >
                        {r.title}
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-between items-center">
          {isConfirmingDelete ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-600">Rostdan o'chirasizmi?</span>
              <button
                onClick={() => deleteMutation.mutate(lead._id)}
                disabled={deleteMutation.isPending}
                className="text-xs px-2.5 py-1 bg-red-600 text-white rounded hover:bg-red-700 font-medium disabled:opacity-60"
              >
                {deleteMutation.isPending ? "..." : "Ha, o'chirish"}
              </button>
              <button
                onClick={() => setIsConfirmingDelete(false)}
                className="text-xs px-2.5 py-1 border border-gray-200 text-gray-600 rounded hover:bg-gray-50"
              >
                Bekor
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsConfirmingDelete(true)}
              className="text-xs text-red-500 hover:text-red-700 font-medium"
            >
              O'chirish
            </button>
          )}
          <button
            onClick={handleClose}
            className="text-xs px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-700 font-medium"
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
    <p className="flex items-center gap-1 text-xs text-gray-400 mb-0.5">
      {icon} {label}
    </p>
    <p className="text-sm font-medium text-gray-900">{value}</p>
  </div>
);

export default LeadDetailModal;
