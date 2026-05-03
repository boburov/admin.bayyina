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

const inp = "w-full h-9 px-3 text-sm border border-gray-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-brown-800 placeholder:text-gray-400";
const sel = "w-full h-9 px-2 text-sm border border-gray-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-brown-800 text-gray-700";
const lbl = "block text-xs font-medium text-gray-600 mb-1";
const errCls = "border-red-400 focus:ring-red-400";

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
            <div>
              <label className={lbl}>
                Ism <span className="text-red-500">*</span>
              </label>
              <input
                className={`${inp} ${errors.firstName ? errCls : ""}`}
                placeholder="To'liq ism"
                value={form.firstName}
                onChange={(e) => set("firstName", e.target.value)}
              />
              {errors.firstName && (
                <p className="mt-1 text-xs text-red-500">{errors.firstName}</p>
              )}
            </div>

            {/* Telefon */}
            <div>
              <label className={lbl}>
                Telefon <span className="text-red-500">*</span>
              </label>
              <input
                className={`${inp} ${errors.phone ? errCls : ""}`}
                placeholder="+998 90 123 45 67"
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
              />
              {errors.phone && (
                <p className="mt-1 text-xs text-red-500">{errors.phone}</p>
              )}
            </div>

            {/* Manba */}
            <SourceSelect
              label="Manba"
              size="sm"
              value={form.source}
              onChange={(v) => set("source", v)}
            />

            {/* Holat */}
            <div>
              <label className={lbl}>Holat</label>
              <select
                className={sel}
                value={form.status}
                onChange={(e) => set("status", e.target.value)}
              >
                {FORM_STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>

            {/* Komment */}
            <div>
              <label className={lbl}>
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
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="text-sm px-4 py-2 border border-gray-200 text-gray-600 rounded hover:bg-gray-50 disabled:opacity-50"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="text-sm px-4 py-2 bg-brown-800 text-white rounded hover:bg-brown-700 font-medium disabled:opacity-60"
            >
              {isPending ? "Saqlanmoqda..." : isEdit ? "Yangilash" : "Yaratish"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LeadFormModal;
