import { useState, useEffect } from "react";
import { UserPlus } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/shared/components/shadcn/dialog";

const inp = "w-full h-9 px-3 text-sm border border-gray-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-brown-800 placeholder:text-gray-400";
const lbl = "block text-xs font-medium text-gray-600 mb-1";

const EMPTY = { name: "", phone: "", course: "", interestPercent: 50, status: "yangi", notes: "" };

const LeadFormModal = ({ open, lead, onClose, onSave }) => {
  const [form, setForm] = useState(EMPTY);

  useEffect(() => {
    setForm(
      lead
        ? {
            name:            lead.name            ?? "",
            phone:           lead.phone           ?? "",
            course:          lead.course          ?? "",
            interestPercent: lead.interestPercent ?? 50,
            status:          lead.status          ?? "yangi",
            notes:           lead.notes           ?? "",
          }
        : EMPTY
    );
  }, [lead, open]);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    onSave({
      name:            form.name.trim(),
      phone:           form.phone.trim(),
      course:          form.course.trim(),
      interestPercent: Number(form.interestPercent),
      status:          form.status,
      notes:           form.notes.trim(),
    });
  };

  const isEdit = !!lead;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md p-0 gap-0">
        <DialogHeader className="px-6 pt-5 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 bg-brown-50 border border-brown-200">
              <UserPlus size={14} className="text-brown-800" strokeWidth={1.5} />
            </div>
            <DialogTitle className="text-base font-semibold text-gray-900">
              {isEdit ? "Leadni tahrirlash" : "Yangi lead qo'shish"}
            </DialogTitle>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="px-6 py-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={lbl}>Ism <span className="text-red-500">*</span></label>
                <input
                  className={inp}
                  placeholder="To'liq ism"
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  required
                />
              </div>
              <div>
                <label className={lbl}>Telefon</label>
                <input
                  className={inp}
                  placeholder="+998 90 123 45 67"
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className={lbl}>Kurs nomi</label>
              <input
                className={inp}
                placeholder="Ingliz tili, Matematika, IT..."
                value={form.course}
                onChange={(e) => set("course", e.target.value)}
              />
            </div>

            <div>
              <label className={lbl}>
                Qiziqish darajasi:{" "}
                <span className="text-brown-800 font-semibold">{form.interestPercent}%</span>
              </label>
              <input
                type="range"
                min={0}
                max={100}
                value={form.interestPercent}
                onChange={(e) => set("interestPercent", e.target.value)}
                className="w-full accent-brown-800 mt-1"
              />
              <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>

            {!isEdit && (
              <div>
                <label className={lbl}>Holat</label>
                <div className="flex gap-2 flex-wrap">
                  {[
                    { v: "yangi",          l: "Yangi"          },
                    { v: "aloqa_qilingan", l: "Aloqa qilingan" },
                  ].map((o) => (
                    <button
                      key={o.v}
                      type="button"
                      onClick={() => set("status", o.v)}
                      className={`text-xs px-3 py-1.5 rounded border font-medium transition-colors ${
                        form.status === o.v
                          ? "bg-brown-800 text-white border-brown-800"
                          : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {o.l}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className={lbl}>Izoh</label>
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
              className="text-sm px-4 py-2 border border-gray-200 text-gray-600 rounded hover:bg-gray-50"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              className="text-sm px-4 py-2 bg-brown-800 text-white rounded hover:bg-brown-700"
            >
              {isEdit ? "Yangilash" : "Saqlash"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LeadFormModal;
