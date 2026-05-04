import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/shared/components/shadcn/dialog";
import { leadsAPI } from "@/features/leads/api/leads.api";
import { FORM_STATUS_OPTIONS } from "../data/leads-crm.data";

import SourceSelect from "@/shared/components/form/SourceSelect";
import Button from "@/shared/components/ui/button/Button";
import InputField from "@/shared/components/ui/input/InputField";
import SelectField from "@/shared/components/ui/select/SelectField";

const EMPTY = { firstName: "", phone: "", source: "", status: "new", notes: "" };

const LeadFormModal = ({ open, lead, onClose, onSuccess }) => {
  const qc = useQueryClient();
  const [form,   setForm]   = useState(EMPTY);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setForm(
      lead
        ? {
            firstName: lead.firstName ?? "",
            phone:     lead.phone     ?? "",
            source:    lead.source    ?? "",
            status:    lead.status    ?? "new",
            notes:     lead.notes     ?? "",
          }
        : EMPTY
    );
    setErrors({});
  }, [lead, open]);

  const createMut = useMutation({
    mutationFn: (data) => leadsAPI.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["leads-crm"] });
      toast.success("Lead qo'shildi");
      onSuccess?.();
    },
    onError: (e) => toast.error(e.response?.data?.message || "Xatolik yuz berdi"),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }) => leadsAPI.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["leads-crm"] });
      toast.success("Lead yangilandi");
      onSuccess?.();
    },
    onError: (e) => toast.error(e.response?.data?.message || "Xatolik yuz berdi"),
  });

  const isPending = createMut.isPending || updateMut.isPending;

  const set = (k, v) => {
    setForm((p) => ({ ...p, [k]: v }));
    if (errors[k]) setErrors((p) => ({ ...p, [k]: "" }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.firstName.trim()) errs.firstName = "Ism kiritilishi shart";
    if (!form.phone.trim())     errs.phone     = "Telefon kiritilishi shart";
    if (Object.keys(errs).length) { setErrors(errs); return; }

    const payload = {
      firstName: form.firstName.trim(),
      phone:     form.phone.trim(),
      status:    form.status,
      ...(form.source && { source: form.source }),
      ...(form.notes  && { notes:  form.notes.trim() }),
    };

    if (lead) {
      updateMut.mutate({ id: lead._id, data: payload });
    } else {
      createMut.mutate(payload);
    }
  };

  const isEdit = !!lead;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="w-[90vw] max-w-[500px] p-0 gap-0">
        <DialogHeader className="px-6 pt-5 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 bg-brown-50 border border-brown-200">
              <UserPlus size={14} className="text-brown-800" strokeWidth={1.5} />
            </div>
            <DialogTitle className="text-base font-semibold text-gray-900">
              {isEdit ? "Leadni tahrirlash" : "O'quvchi qo'shish"}
            </DialogTitle>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="px-6 py-5 space-y-4">

            {/* Ism */}
            <InputField
              name="firstName"
              label="Ism"
              placeholder="To'liq ism"
              value={form.firstName}
              onChange={(e) => set("firstName", e.target.value)}
              required
              description={errors.firstName}
            />

            {/* Telefon */}
            <InputField
              name="phone"
              label="Telefon"
              type="tel"
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              required
              description={errors.phone}
            />

            {/* Manba */}
            <SourceSelect
              label="Manba"
              size="sm"
              value={form.source}
              onChange={(v) => set("source", v)}
            />

            {/* Holat */}
            <SelectField
              name="status"
              label="Holat"
              options={FORM_STATUS_OPTIONS.map((s) => ({ value: s.value, label: s.label }))}
              value={form.status}
              onChange={(val) => set("status", val)}
            />

            {/* Komment */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Komment{" "}
                <span className="text-[10px] font-normal text-gray-400">(ixtiyoriy)</span>
              </label>
              <textarea
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-brown-800 placeholder:text-gray-400 resize-none"
                rows={3}
                placeholder="Qo'shimcha izoh..."
                value={form.notes}
                onChange={(e) => set("notes", e.target.value)}
              />
            </div>
          </div>

          <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              Bekor qilish
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saqlanmoqda..." : isEdit ? "Yangilash" : "Yaratish"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LeadFormModal;
