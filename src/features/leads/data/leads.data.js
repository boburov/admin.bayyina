export const STATUS_OPTIONS = [
  { label: "Barchasi",        value: "" },
  { label: "🆕 Yangi",        value: "new" },
  { label: "📞 Bog'lashildi", value: "contacted" },
  { label: "💡 Qiziqyapti",   value: "interested" },
  { label: "📅 Rejalashtirildi", value: "scheduled" },
  { label: "🎓 Qabul qilindi", value: "converted" },
  { label: "❌ Rad etildi",   value: "rejected" },
];

export const SOURCE_OPTIONS = [
  { label: "Barcha manbalar", value: "" },
  { label: "📸 Instagram",    value: "instagram" },
  { label: "✈️ Telegram",     value: "telegram" },
  { label: "👥 Do'st orqali", value: "referral" },
  { label: "🏠 Offline",      value: "offline" },
  { label: "🌍 Boshqa",       value: "other" },
];

export const STATUS_BADGE = {
  new:        { label: "Yangi",          className: "bg-blue-50   text-blue-700   border border-blue-200" },
  contacted:  { label: "Bog'lashildi",   className: "bg-yellow-50 text-yellow-700 border border-yellow-200" },
  interested: { label: "Qiziqyapti",     className: "bg-purple-50 text-purple-700 border border-purple-200" },
  scheduled:  { label: "Rejalashtirildi",className: "bg-indigo-50 text-indigo-700 border border-indigo-200" },
  converted:  { label: "Qabul qilindi",  className: "bg-green-50  text-green-700  border border-green-200" },
  rejected:   { label: "Rad etildi",     className: "bg-red-50    text-red-700    border border-red-200" },
};

export const FUNNEL_STEPS = [
  { key: "new",        label: "Yangi leadlar" },
  { key: "contacted",  label: "Bog'lashildi" },
  { key: "interested", label: "Qiziqdi" },
  { key: "scheduled",  label: "Rejalashtirildi" },
  { key: "converted",  label: "Qabul qilindi" },
];
