// React
import { useState } from "react";

// TanStack Query
import { useMutation, useQueryClient } from "@tanstack/react-query";

// Toast
import { toast } from "sonner";

// API
import { leadsAPI } from "../api/leads.api";

// Settings hooks
import { useLeadSources } from "@/features/settings/hooks/useLeadSources";
import { useCourseTypes } from "@/features/settings/hooks/useCourseTypes";
import { useInterests }   from "@/features/settings/hooks/useInterests";

// Shadcn
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/shared/components/shadcn/dialog";

// Icons
import { UserPlus } from "lucide-react";

// Data
import { GENDER_OPTIONS, CREATE_STATUS_OPTIONS } from "../data/leads.data";

// Shared components
import Button from "@/shared/components/ui/button/Button";
import InputField from "@/shared/components/ui/input/InputField";
import InputGroup from "@/shared/components/ui/input/InputGroup";
import SelectField from "@/shared/components/ui/select/SelectField";

const CreateLeadModal = ({ open, onClose }) => {
  const qc = useQueryClient();

  const empty = { firstName: "", lastName: "", phone: "", gender: "", age: "", source: "", interest: "", courseType: "", level: "", notes: "", status: "new" };
  const [form, setForm] = useState(empty);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const { sources }     = useLeadSources({ enabled: open });
  const { courseTypes } = useCourseTypes({ enabled: open });
  const { interests }   = useInterests({ enabled: open });

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
      ...(form.lastName  && { lastName:  form.lastName.trim() }),
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
              Yangi sotuv qo'shish
            </DialogTitle>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="px-6 py-5 space-y-4 max-h-[65vh] overflow-y-auto">

            {/* Row 1: firstName + lastName */}
            <InputGroup>
              <InputField
                name="firstName"
                label="Ism"
                placeholder="Ism"
                value={form.firstName}
                onChange={(e) => set("firstName", e.target.value)}
                required
              />
              <InputField
                name="lastName"
                label="Familiya"
                placeholder="Familiya"
                value={form.lastName}
                onChange={(e) => set("lastName", e.target.value)}
              />
            </InputGroup>

            {/* Row 1b: phone */}
            <InputField
              name="phone"
              label="Telefon"
              type="tel"
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
            />

            {/* Row 2: gender + age */}
            <InputGroup>
              <SelectField
                name="gender"
                label="Jins"
                options={GENDER_OPTIONS.filter((o) => o.value).map((o) => ({ value: o.value, label: o.label }))}
                value={form.gender}
                onChange={(val) => set("gender", val)}
                placeholder="Jins (ixtiyoriy)"
              />
              <InputField
                name="age"
                label="Yosh"
                type="number"
                placeholder="25"
                value={form.age}
                onChange={(e) => set("age", e.target.value)}
              />
            </InputGroup>

            {/* Row 3: source + courseType */}
            <InputGroup>
              <SelectField
                name="source"
                label="Manba"
                options={sources.map((s) => ({ value: s._id, label: s.label }))}
                value={form.source}
                onChange={(val) => set("source", val)}
                placeholder="Manba tanlang"
              />
              <SelectField
                name="courseType"
                label="Kurs turi"
                options={courseTypes.map((c) => ({ value: c._id, label: c.label }))}
                value={form.courseType}
                onChange={(val) => set("courseType", val)}
                placeholder="Kurs turi"
              />
            </InputGroup>

            {/* Row 4: interest + level */}
            <InputGroup>
              <SelectField
                name="interest"
                label="Qiziqishi"
                options={interests.map((i) => ({ value: i._id, label: i.label }))}
                value={form.interest}
                onChange={(val) => set("interest", val)}
                placeholder="Qiziqish tanlang"
              />
              <InputField
                name="level"
                label="Daraja"
                placeholder="Boshlang'ich, o'rta..."
                value={form.level}
                onChange={(e) => set("level", e.target.value)}
              />
            </InputGroup>

            {/* Status */}
            <div>
              <p className="block text-xs font-medium text-gray-600 mb-1">Holat</p>
              <div className="flex flex-wrap gap-2">
                {CREATE_STATUS_OPTIONS.map((o) => (
                  <Button
                    key={o.value}
                    type="button"
                    variant={form.status === o.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => set("status", o.value)}
                    className="rounded-full text-xs"
                  >
                    {o.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Izoh</label>
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
            <Button type="button" variant="outline" onClick={handleClose}>
              Bekor qilish
            </Button>
            <Button type="submit" disabled={createMut.isPending}>
              {createMut.isPending ? "Saqlanmoqda..." : "Saqlash"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateLeadModal;
