export const STATUS_LIST = [
  {
    value: "new",
    label: "Kutilmoqda",
    badge: "bg-slate-50 text-slate-700 border border-slate-200",
    dot:   "bg-slate-400",
  },
  {
    value: "contacted",
    label: "Bog'lashildi",
    badge: "bg-yellow-50 text-yellow-700 border border-yellow-200",
    dot:   "bg-yellow-400",
  },
  {
    value: "interested",
    label: "Qiziqyapti",
    badge: "bg-purple-50 text-purple-700 border border-purple-200",
    dot:   "bg-purple-400",
  },
  {
    value: "scheduled",
    label: "Rejalashtirildi",
    badge: "bg-indigo-50 text-indigo-700 border border-indigo-200",
    dot:   "bg-indigo-400",
  },
  {
    value: "converted",
    label: "Qabul qilindi",
    badge: "bg-green-50 text-green-700 border border-green-200",
    dot:   "bg-green-500",
  },
  {
    value: "rejected",
    label: "Bekor qilindi",
    badge: "bg-red-50 text-red-700 border border-red-200",
    dot:   "bg-red-400",
  },
];

export const STATUS_MAP = Object.fromEntries(STATUS_LIST.map((s) => [s.value, s]));

// For create/edit form — exclude "converted" (happens via ConvertLeadModal)
export const FORM_STATUS_OPTIONS = STATUS_LIST.filter((s) => s.value !== "converted");

export const INTEREST_COLOR = (pct) => {
  if (pct >= 80) return "bg-green-500";
  if (pct >= 60) return "bg-blue-500";
  if (pct >= 30) return "bg-amber-500";
  return "bg-red-400";
};
