export const GENDER_OPTIONS = [
  { value: "", label: "Jins (ixtiyoriy)" },
  { value: "male",   label: "Erkak" },
  { value: "female", label: "Ayol" },
];

export const CREATE_STATUS_OPTIONS = [
  { value: "new",        label: "Kutilmoqda" },
  { value: "contacted",  label: "Bog'lashildi" },
  { value: "interested", label: "Qiziqyapti" },
  { value: "scheduled",  label: "Rejalashtirildi" },
];

export const STATUS_OPTIONS = [
  { label: "Barchasi",           value: "" },
  { label: "⏳ Kutilmoqda",      value: "new" },
  { label: "📞 Bog'lashildi",    value: "contacted" },
  { label: "💡 Qiziqyapti",      value: "interested" },
  { label: "📅 Rejalashtirildi", value: "scheduled" },
  { label: "🎓 Qabul qilindi",   value: "converted" },
  { label: "🚫 Bekor qilindi",   value: "rejected" },
];


export const STATUS_BADGE = {
  new:        { label: "Kutilmoqda",     className: "bg-slate-50  text-slate-700  border border-slate-200" },
  contacted:  { label: "Bog'lashildi",   className: "bg-yellow-50 text-yellow-700 border border-yellow-200" },
  interested: { label: "Qiziqyapti",     className: "bg-purple-50 text-purple-700 border border-purple-200" },
  scheduled:  { label: "Rejalashtirildi",className: "bg-indigo-50 text-indigo-700 border border-indigo-200" },
  converted:  { label: "Qabul qilindi",  className: "bg-green-50  text-green-700  border border-green-200" },
  rejected:   { label: "Bekor qilindi",  className: "bg-red-50    text-red-700    border border-red-200" },
};

export const QUICK_STATUS_OPTIONS = [
  { value: "new",        label: "⏳ Kutilmoqda" },
  { value: "contacted",  label: "📞 Bog'lashildi" },
  { value: "interested", label: "💡 Qiziqyapti" },
  { value: "scheduled",  label: "📅 Rejalashtirildi" },
  { value: "converted",  label: "🎓 Qabul qilindi" },
];

export const FUNNEL_STEPS = [
  { key: "new",        label: "Kutilmoqda" },
  { key: "contacted",  label: "Bog'lashildi" },
  { key: "interested", label: "Qiziqdi" },
  { key: "scheduled",  label: "Rejalashtirildi" },
  { key: "converted",  label: "Qabul qilindi" },
];
