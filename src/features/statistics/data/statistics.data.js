const UZ_MONTHS_SHORT = ["Yan", "Fev", "Mar", "Apr", "May", "Iyn", "Iyl", "Avg", "Sen", "Okt", "Noy", "Dek"];

export const formatStatMonth = ({ year, month }) =>
  `${UZ_MONTHS_SHORT[month - 1]} '${String(year).slice(2)}`;

export const CHART_COLORS = {
  primary:   "#65443c",
  secondary: "#a18072",
  blue:      "#3b82f6",
  green:     "#22c55e",
  red:       "#ef4444",
  orange:    "#f97316",
  amber:     "#f59e0b",
  purple:    "#8b5cf6",
  teal:      "#14b8a6",
  pink:      "#ec4899",
};

export const ENROLLMENT_PIE_COLORS  = ["#22c55e", "#3b82f6", "#ef4444"];
export const GENDER_PIE_COLORS      = ["#3b82f6", "#ec4899"];
export const LEAD_SOURCE_PIE_COLORS = ["#65443c", "#a18072", "#bfa094", "#d2bab0", "#e0cec7"];
export const LEAD_STATUS_COLORS     = ["#6366f1", "#3b82f6", "#f59e0b", "#14b8a6", "#22c55e", "#ef4444"];
export const PAYMENT_PIE_COLORS     = ["#22c55e", "#f59e0b", "#ef4444"];

export const ENROLLMENT_STATUS_LABELS = {
  active:    "Faol",
  completed: "Tugatgan",
  dropped:   "Tashlab ketgan",
};

export const LEAD_STATUS_LABELS = {
  new:       "Kutilmoqda",
  contacted: "Bog'lashildi",
  interested:"Qiziqyapti",
  scheduled: "Rejalashtirildi",
  converted: "Qabul qilindi",
  rejected:  "Bekor qilindi",
};

export const LEAD_SOURCE_LABELS = {
  instagram: "Instagram",
  telegram:  "Telegram",
  referral:  "Tavsiya",
  offline:   "Oflayn",
  other:     "Boshqa",
};

export const PAYMENT_STATUS_LABELS = {
  paid:    "To'langan",
  pending: "Kutilmoqda",
  overdue: "Muddati o'tgan",
};

export const GENDER_LABELS = {
  male:   "Erkak",
  female: "Ayol",
};

export const formatMoney = (val) => {
  if (!val && val !== 0) return "0";
  if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `${(val / 1_000).toFixed(0)}K`;
  return String(val);
};

export const formatMoneyFull = (val) =>
  val ? `${Number(val).toLocaleString()} so'm` : "0 so'm";

export const TOOLTIP_STYLE = {
  contentStyle: {
    borderRadius: "2px",
    border: "1px solid #E5E7EB",
    boxShadow: "0 2px 6px -1px rgb(0 0 0 / 0.1)",
    fontSize: "12px",
  },
  labelStyle: { color: "#6B7280", fontSize: "12px", marginBottom: "2px" },
};
