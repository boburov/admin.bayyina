export const STATUS_LIST = [
  {
    value: "yangi",
    label: "Yangi",
    badge: "bg-slate-50 text-slate-700 border border-slate-200",
    dot:   "bg-slate-400",
  },
  {
    value: "aloqa_qilingan",
    label: "Aloqa qilingan",
    badge: "bg-yellow-50 text-yellow-700 border border-yellow-200",
    dot:   "bg-yellow-400",
  },
  {
    value: "student",
    label: "Student",
    badge: "bg-green-50 text-green-700 border border-green-200",
    dot:   "bg-green-500",
  },
];

export const STATUS_MAP = Object.fromEntries(STATUS_LIST.map((s) => [s.value, s]));

export const INTEREST_COLOR = (pct) => {
  if (pct >= 80) return "bg-green-500";
  if (pct >= 60) return "bg-blue-500";
  if (pct >= 30) return "bg-amber-500";
  return "bg-red-400";
};
