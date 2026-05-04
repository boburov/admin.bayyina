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
import Button from "@/shared/components/ui/button/Button";
import SelectField from "@/shared/components/ui/select/SelectField";

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
            <SelectField
              name="rejectionReason"
              label="Sabab"
              description="(ixtiyoriy)"
              options={reasons.map((r) => ({ value: r._id, label: r.title }))}
              value={reasonId}
              onChange={(val) => setReasonId(val)}
              placeholder="Sabab tanlang..."
            />
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={cancelMut.isPending}
          >
            Orqaga
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={() => cancelMut.mutate()}
            disabled={cancelMut.isPending}
          >
            {cancelMut.isPending ? "Saqlanmoqda..." : "Bekor qilish"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CancelLeadModal;
