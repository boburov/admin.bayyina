import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";

import { leadsAPI } from "../api/leads.api";
import { rejectionReasonsAPI } from "@/features/settings/api/rejectionReasons.api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/shadcn/dialog";

const CancelLeadModal = ({ lead, open, onClose }) => {
  const qc = useQueryClient();
  const [reasonId, setReasonId] = useState("");

  const { data: reasonsData } = useQuery({
    queryKey: ["settings", "rejection-reasons"],
    queryFn:  () => rejectionReasonsAPI.getAll({ limit: 100 }).then((r) => r.data),
    enabled:  open,
  });
  const reasons = reasonsData?.rejectionReasons ?? [];

  const cancelMut = useMutation({
    mutationFn: () =>
      leadsAPI.update(lead._id, {
        status: "rejected",
        ...(reasonId && { rejectionReason: reasonId }),
      }),
    onSuccess: () => {
      toast.success(`${lead.firstName} bekor qilindi`);
      qc.invalidateQueries({ queryKey: ["leads"] });
      qc.invalidateQueries({ queryKey: ["statistics", "leads"] });
      handleClose();
    },
    onError: (e) => toast.error(e.response?.data?.message || "Xatolik"),
  });

  const handleClose = () => {
    setReasonId("");
    onClose();
  };

  if (!lead) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="sm:max-w-sm p-0 gap-0">
        <DialogHeader className="px-6 pt-5 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-sm bg-red-50 border border-red-200 flex items-center justify-center shrink-0">
              <AlertTriangle size={15} className="text-red-600" strokeWidth={1.5} />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold text-gray-900">
                Leadni bekor qilish
              </DialogTitle>
              <p className="text-xs text-gray-400 mt-0.5">{lead.firstName}</p>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 py-5 space-y-4">
          <p className="text-sm text-gray-600 leading-relaxed">
            Bu lead{" "}
            <span className="font-semibold text-gray-900">
              "Bekor qilindi"
            </span>{" "}
            holatiga o'tkaziladi. Davom etishni xohlaysizmi?
          </p>

          {reasons.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Sabab <span className="text-gray-400 font-normal">(ixtiyoriy)</span>
              </label>
              <select
                value={reasonId}
                onChange={(e) => setReasonId(e.target.value)}
                className="w-full h-9 px-3 text-sm border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-red-300 text-gray-700"
              >
                <option value="">Sabab tanlang...</option>
                {reasons.map((r) => (
                  <option key={r._id} value={r._id}>
                    {r.title}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2">
          <button
            type="button"
            onClick={handleClose}
            disabled={cancelMut.isPending}
            className="text-sm px-4 py-2 border border-gray-200 text-gray-600 rounded-md hover:bg-gray-50 disabled:opacity-60 transition-colors"
          >
            Orqaga
          </button>
          <button
            type="button"
            onClick={() => cancelMut.mutate()}
            disabled={cancelMut.isPending}
            className="text-sm px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-60 transition-colors font-medium"
          >
            {cancelMut.isPending ? "Saqlanmoqda..." : "Bekor qilish"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CancelLeadModal;
