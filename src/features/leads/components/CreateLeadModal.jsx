// React
import { useState } from "react";

// TanStack Query
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Toast
import { toast } from "sonner";

// API
import { leadsAPI }         from "../api/leads.api";
import { leadSourcesAPI }   from "@/features/settings/api/leadSources.api";
import { courseTypesAPI }   from "@/features/settings/api/courseTypes.api";

// Shadcn
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/shared/components/shadcn/dialog";

// Icons
import { UserPlus } from "lucide-react";

const GENDER_OPTIONS = [
  { value: "", label: "Jins (ixtiyoriy)" },
  { value: "male",   label: "Erkak" },
  { value: "female", label: "Ayol" },
];

const STATUS_OPTIONS = [
  { value: "new",       label: "Yangi" },
  { value: "contacted", label: "Bog'lashildi" },
  { value: "interested",label: "Qiziqyapti" },
  { value: "scheduled", label: "Rejalashtirildi" },
];

const inputCls = "w-full h-9 px-3 text-sm border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-brown-800 placeholder:text-gray-400";
const selectCls = "w-full h-9 px-2 text-sm border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-brown-800 text-gray-700";
const labelCls  = "block text-xs font-medium text-gray-600 mb-1";

const CreateLeadModal = ({ open, onClose }) => {
  const qc = useQueryClient();

  const empty = { firstName: "", phone: "", gender: "", age: "", source: "", interest: "", courseType: "", level: "", notes: "", status: "new" };
  const [form, setForm] = useState(empty);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  // Lead sources
  const { data: sourcesData } = useQuery({
    queryKey: ["settings", "lead-sources"],
    queryFn:  () => leadSourcesAPI.getAll({ limit: 100 }).then((r) => r.data),
    enabled:  open,
  });
  const sources = sourcesData?.leadSources ?? [];

  // Course types
  const { data: typesData } = useQuery({
    queryKey: ["settings", "course-types"],
    queryFn:  () => courseTypesAPI.getAll({ limit: 100 }).then((r) => r.data),
    enabled:  open,
  });
  const courseTypes = typesData?.courseTypes ?? [];

  const createMut = useMutation({
    mutationFn: (data) => leadsAPI.create(data),
    onSuccess: () => {
      toast.success("Lead qo'shildi");
      qc.invalidateQueries({ queryKey: ["leads"] });
      setForm(empty);
      onClose();
    },
    onError: (e) => toast.error(e.response?.data?.message || "Xatolik yuz berdi"),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.firstName.trim()) return toast.error("Ism kiritilishi shart");

    const payload = {
      firstName: form.firstName.trim(),
      status:    form.status,
      ...(form.phone      && { phone:      form.phone.trim() }),
      ...(form.gender     && { gender:     form.gender }),
      ...(form.age        && { age:        Number(form.age) }),
      ...(form.source     && { source:     form.source }),
      ...(form.interest   && { interest:   form.interest.trim() }),
      ...(form.courseType && { courseType: form.courseType }),
      ...(form.level      && { level:      form.level.trim() }),
      ...(form.notes      && { notes:      form.notes.trim() }),
    };

    createMut.mutate(payload);
  };

  const handleClose = () => {
    setForm(empty);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="sm:max-w-md p-0 gap-0">
        <DialogHeader className="px-6 pt-5 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 bg-brown-50 border border-brown-200">
              <UserPlus size={14} className="text-brown-800" strokeWidth={1.5} />
            </div>
            <DialogTitle className="text-base font-semibold text-gray-900">
              Yangi lead qo'shish
            </DialogTitle>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="px-6 py-5 space-y-4 max-h-[65vh] overflow-y-auto">

            {/* Row 1: name + phone */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Ism <span className="text-red-500">*</span></label>
                <input className={inputCls} placeholder="Ism" value={form.firstName} onChange={(e) => set("firstName", e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Telefon</label>
                <input className={inputCls} placeholder="+998 90 123 45 67" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
              </div>
            </div>

            {/* Row 2: gender + age */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Jins</label>
                <select className={selectCls} value={form.gender} onChange={(e) => set("gender", e.target.value)}>
                  {GENDER_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Yosh</label>
                <input className={inputCls} type="number" min={1} max={120} placeholder="25" value={form.age} onChange={(e) => set("age", e.target.value)} />
              </div>
            </div>

            {/* Row 3: source + courseType */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Manba</label>
                <select className={selectCls} value={form.source} onChange={(e) => set("source", e.target.value)}>
                  <option value="">Manba tanlang</option>
                  {sources.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Kurs turi</label>
                <select className={selectCls} value={form.courseType} onChange={(e) => set("courseType", e.target.value)}>
                  <option value="">Kurs turi</option>
                  {courseTypes.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
            </div>

            {/* Row 4: interest + level */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Qiziqishi</label>
                <input className={inputCls} placeholder="Qaysi kursga qiziqmoqda" value={form.interest} onChange={(e) => set("interest", e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Daraja</label>
                <input className={inputCls} placeholder="Boshlang'ich, o'rta..." value={form.level} onChange={(e) => set("level", e.target.value)} />
              </div>
            </div>

            {/* Status */}
            <div>
              <label className={labelCls}>Holat</label>
              <div className="flex flex-wrap gap-2">
                {STATUS_OPTIONS.map((o) => (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => set("status", o.value)}
                    className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${
                      form.status === o.value
                        ? "bg-brown-800 text-white border-brown-800"
                        : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className={labelCls}>Izoh</label>
              <textarea
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-brown-800 placeholder:text-gray-400 resize-none"
                placeholder="Qo'shimcha izoh..."
                rows={3}
                value={form.notes}
                onChange={(e) => set("notes", e.target.value)}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={handleClose}
              className="text-sm px-4 py-2 border border-gray-200 text-gray-600 rounded-md hover:bg-gray-50"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={createMut.isPending}
              className="text-sm px-4 py-2 bg-brown-800 text-white rounded-md hover:bg-brown-700 disabled:opacity-60"
            >
              {createMut.isPending ? "Saqlanmoqda..." : "Saqlash"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateLeadModal;
