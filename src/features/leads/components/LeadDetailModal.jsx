// TanStack Query
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Toast
import { toast } from "sonner";

// React
import { useState } from "react";

// API
import { leadsAPI }            from "../api/leads.api";
import { rejectionReasonsAPI } from "@/features/settings/api/rejectionReasons.api";

// Hooks
import { useLeadSources } from "@/features/settings/hooks/useLeadSources";
import { useCourseTypes } from "@/features/settings/hooks/useCourseTypes";
import { useInterests }   from "@/features/settings/hooks/useInterests";

// Components
import LeadStatusBadge from "./LeadStatusBadge";

// Data
import { GENDER_OPTIONS } from "../data/leads.data";

// Shared components
import Button from "@/shared/components/ui/button/Button";
import InputField from "@/shared/components/ui/input/InputField";
import InputGroup from "@/shared/components/ui/input/InputGroup";
import SelectField from "@/shared/components/ui/select/SelectField";

// Utils
import { formatDateUZ } from "@/shared/utils/date.utils";

// Icons
import {
  Phone, User, Calendar, MapPin, MessageSquare,
  BookOpen, Pencil, X,
} from "lucide-react";

// Shadcn
import {
  Dialog, DialogTitle, DialogHeader, DialogContent,
} from "@/shared/components/shadcn/dialog";


// ─── Helpers ─────────────────────────────────────────────────────────────────

// Returns display name regardless of whether field is populated or raw ObjectId
const resolveName = (field, list) => {
  if (!field) return null;
  if (typeof field === "object") return field.name ?? field.label ?? null;
  // raw ObjectId string — look up in list (selectOptions returns label, populated returns name)
  const found = list.find((item) => String(item._id) === String(field));
  return found?.name ?? found?.label ?? null;
};

// Returns the ObjectId string regardless of whether field is populated or raw
const resolveId = (field) => {
  if (!field) return "";
  if (typeof field === "object") return field._id ?? "";
  return field;
};

// ─── Edit form ────────────────────────────────────────────────────────────────

const EditForm = ({ lead, sources, courseTypes, interests, onSave, onCancel, isPending }) => {
  const [form, setForm] = useState({
    firstName:  lead.firstName  ?? "",
    lastName:   lead.lastName   ?? "",
    phone:      lead.phone != null ? String(lead.phone) : "",
    age:        lead.age        ?? "",
    gender:     lead.gender     ?? "",
    source:     resolveId(lead.source),
    courseType: resolveId(lead.courseType),
    interest:   resolveId(lead.interest),
    notes:      lead.notes      ?? "",
  });

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      firstName: form.firstName.trim() || undefined,
      lastName:  form.lastName.trim()  || null,
      phone:     form.phone.trim()     || undefined,
      age:       form.age ? Number(form.age) : null,
      gender:    form.gender || null,
      source:    form.source     || null,
      courseType: form.courseType || null,
      interest:  form.interest.trim() || null,
      notes:     form.notes.trim()    || null,
    };
    onSave(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <InputGroup>
        <InputField
          name="firstName"
          label="Ism"
          value={form.firstName}
          onChange={(e) => set("firstName", e.target.value)}
        />
        <InputField
          name="lastName"
          label="Familiya"
          value={form.lastName}
          onChange={(e) => set("lastName", e.target.value)}
        />
      </InputGroup>

      <InputGroup>
        <InputField
          name="phone"
          label="Telefon"
          type="tel"
          value={form.phone}
          onChange={(e) => set("phone", e.target.value)}
        />
        <InputField
          name="age"
          label="Yosh"
          type="number"
          value={form.age}
          onChange={(e) => set("age", e.target.value)}
        />
      </InputGroup>

      <InputGroup>
        <SelectField
          name="gender"
          label="Jins"
          options={GENDER_OPTIONS.filter((o) => o.value).map((o) => ({ value: o.value, label: o.label }))}
          value={form.gender}
          onChange={(val) => set("gender", val)}
          placeholder="Tanlang"
        />
        <SelectField
          name="source"
          label="Manba"
          options={sources.map((s) => ({ value: s._id, label: s.label }))}
          value={form.source}
          onChange={(val) => set("source", val)}
          placeholder="Tanlang"
        />
      </InputGroup>

      <SelectField
        name="courseType"
        label="Kurs turi"
        options={courseTypes.map((c) => ({ value: c._id, label: c.label }))}
        value={form.courseType}
        onChange={(val) => set("courseType", val)}
        placeholder="Tanlang"
      />

      <SelectField
        name="interest"
        label="Qiziqish"
        options={interests.map((i) => ({ value: i._id, label: i.label }))}
        value={form.interest}
        onChange={(val) => set("interest", val)}
        placeholder="Tanlang"
      />

      <div>
        <label className="block text-[10px] font-medium text-gray-500 mb-0.5">Izoh</label>
        <textarea
          className="w-full px-2.5 py-2 text-xs border border-gray-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-brown-800 placeholder:text-gray-400 resize-none"
          rows={2}
          value={form.notes}
          onChange={(e) => set("notes", e.target.value)}
          placeholder="Qo'shimcha izoh..."
        />
      </div>

      <div className="flex justify-end gap-2 pt-1">
        <Button type="button" variant="outline" size="sm" onClick={onCancel} disabled={isPending}>
          Bekor
        </Button>
        <Button type="submit" size="sm" disabled={isPending}>
          {isPending ? "Saqlanmoqda..." : "Saqlash"}
        </Button>
      </div>
    </form>
  );
};

// ─── Main modal ───────────────────────────────────────────────────────────────

const LeadDetailModal = ({ lead, open, onClose }) => {
  const queryClient = useQueryClient();
  const [isEditing,          setIsEditing]          = useState(false);
  const [isRejecting,        setIsRejecting]        = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const { sources }     = useLeadSources({ enabled: open });
  const { courseTypes } = useCourseTypes({ enabled: open });
  const { interests }   = useInterests({ enabled: open });

  // Fetch rejection reasons lazily
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
      setIsEditing(false);
    },
    onError: (err) => toast.error(err.response?.data?.message || "Xatolik"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => leadsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      toast.success("Lead o'chirildi");
      handleClose();
    },
    onError: (err) => toast.error(err.response?.data?.message || "Xatolik"),
  });

  if (!lead) return null;

  const sourceName     = resolveName(lead.source,     sources)     ?? "—";
  const courseTypeName = resolveName(lead.courseType, courseTypes) ?? null;
  const interestName   = resolveName(lead.interest,   interests)   ?? null;

  const changeStatus = (status) => {
    if (status === "rejected") { setIsRejecting(true); return; }
    updateMutation.mutate({ id: lead._id, data: { status, rejectionReason: null } });
  };

  const handleReject = (reasonId) => {
    updateMutation.mutate({ id: lead._id, data: { status: "rejected", rejectionReason: reasonId } });
  };

  const handleSaveEdit = (payload) => {
    updateMutation.mutate({ id: lead._id, data: payload });
  };

  const handleClose = () => {
    setIsEditing(false);
    setIsRejecting(false);
    setIsConfirmingDelete(false);
    onClose();
  };

  const QUICK_ACTIONS = [
    { label: "⏳ Kutilmoqda",   status: "new",        color: "bg-slate-50  hover:bg-slate-100  text-slate-700  border-slate-200"  },
    { label: "📞 Bog'lashildi", status: "contacted",  color: "bg-yellow-50 hover:bg-yellow-100 text-yellow-700 border-yellow-200" },
    { label: "💡 Qiziqdi",      status: "interested", color: "bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200" },
    { label: "📅 Rejalashtir",  status: "scheduled",  color: "bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200" },
    { label: "🎓 Qabul qilish", status: "converted",  color: "bg-green-50  hover:bg-green-100  text-green-700  border-green-200"  },
    { label: "🚫 Bekor qilish", status: "rejected",   color: "bg-red-50    hover:bg-red-100    text-red-700    border-red-200"    },
  ];

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden" showClose={false}>

        {/* Header */}
        <DialogHeader className="px-5 pt-4 pb-3.5 border-b border-gray-100">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <DialogTitle className="text-base font-semibold text-gray-900 truncate">
                {lead.firstName} {lead.lastName}
              </DialogTitle>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <LeadStatusBadge status={lead.status} />
                {sourceName !== "—" && (
                  <span className="text-xs text-gray-400">{sourceName}</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              {isEditing ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(false)}
                >
                  Bekor
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => { setIsRejecting(false); setIsEditing(true); }}
                >
                  <Pencil size={11} />
                  Tahrirlash
                </Button>
              )}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleClose}
                aria-label="Yopish"
              >
                <X size={15} />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="px-5 py-4 space-y-4 max-h-[65vh] overflow-y-auto">

          {/* ── Edit mode ── */}
          {isEditing ? (
            <EditForm
              lead={lead}
              sources={sources}
              courseTypes={courseTypes}
              interests={interests}
              onSave={handleSaveEdit}
              onCancel={() => setIsEditing(false)}
              isPending={updateMutation.isPending}
            />
          ) : (
            <>
              {/* ── View mode ── */}
              <div className="grid grid-cols-2 gap-3">
                <InfoRow icon={<Phone size={13} />}    label="Telefon"    value={lead.phone || "—"} />
                <InfoRow icon={<User size={13} />}     label="Jins"       value={lead.gender === "male" ? "Erkak" : lead.gender === "female" ? "Ayol" : "—"} />
                <InfoRow icon={<User size={13} />}     label="Yosh"       value={lead.age || "—"} />
                <InfoRow icon={<MapPin size={13} />}   label="Manba"      value={sourceName} />
                {courseTypeName && (
                  <InfoRow icon={<BookOpen size={13} />} label="Kurs turi" value={courseTypeName} />
                )}
                <InfoRow icon={<Calendar size={13} />} label="Yaratilgan" value={lead.createdAt ? formatDateUZ(lead.createdAt) : "—"} />
              </div>

              {interestName && (
                <div className="p-3 bg-gray-50 rounded-md">
                  <p className="text-xs text-gray-400 mb-1">Qiziqish</p>
                  <p className="text-sm font-medium text-gray-800">{interestName}</p>
                </div>
              )}

              {lead.status === "rejected" && lead.rejectionReason && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-md">
                  <p className="text-xs text-red-600 mb-1">Bekor qilish sababi</p>
                  <p className="text-sm font-semibold text-red-800">
                    {typeof lead.rejectionReason === "object" ? lead.rejectionReason.title : lead.rejectionReason}
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
                      {QUICK_ACTIONS.filter((a) => a.status !== lead.status).map((a) => (
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
                      <p className="text-xs font-bold text-gray-700 uppercase tracking-wider">Sabab tanlang:</p>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsRejecting(false)}
                        className="text-[10px] underline"
                      >
                        Bekor qilish
                      </Button>
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
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-gray-100 flex justify-between items-center gap-3">
          {!isEditing ? (
            <>
              {isConfirmingDelete ? (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-gray-600">Rostdan o'chirasizmi?</span>
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    onClick={() => deleteMutation.mutate(lead._id)}
                    disabled={deleteMutation.isPending}
                  >
                    {deleteMutation.isPending ? "..." : "Ha, o'chirish"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsConfirmingDelete(false)}
                  >
                    Bekor
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsConfirmingDelete(true)}
                  className="text-red-500 hover:text-red-700"
                >
                  O'chirish
                </Button>
              )}
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleClose}
                className="ml-auto"
              >
                Yopish
              </Button>
            </>
          ) : (
            <p className="text-xs text-gray-400 italic">
              O'zgarishlarni saqlash yoki bekor qilish uchun yuqoridagi tugmalardan foydalaning.
            </p>
          )}
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
