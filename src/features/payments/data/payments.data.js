export const DEMO_MODE = true

// ─── Oylar ro'yxati ─────────────────────────────────────────────────────────
const UZ_MONTHS = [
  "Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun",
  "Iyul", "Avgust", "Sentyabr", "Oktyabr", "Noyabr", "Dekabr",
];

export const monthOptions = [
  { value: "2026-04-01", label: "Aprel 2026" },
  { value: "2026-03-01", label: "Mart 2026" },
  { value: "2026-02-01", label: "Fevral 2026" },
  { value: "2026-01-01", label: "Yanvar 2026" },
  { value: "2025-12-01", label: "Dekabr 2025" },
  { value: "2025-11-01", label: "Noyabr 2025" },
  { value: "2025-10-01", label: "Oktyabr 2025" },
  { value: "2025-09-01", label: "Sentyabr 2025" },
  { value: "2025-08-01", label: "Avgust 2025" },
  { value: "2025-07-01", label: "Iyul 2025" },
  { value: "2025-06-01", label: "Iyun 2025" },
  { value: "2025-05-01", label: "May 2025" },
];

/** "2026-04-01" → "Aprel 2026" */
export const formatMonthLabel = (isoDate) => {
  const d = new Date(isoDate);
  if (isNaN(d.getTime())) return isoDate;
  return `${UZ_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};
