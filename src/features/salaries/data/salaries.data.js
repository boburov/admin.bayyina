import { createQueryKeys } from "@/shared/lib/query/query-keys";

export const salariesKeys = createQueryKeys("salaries");

const UZ_MONTHS = [
  "Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun",
  "Iyul", "Avgust", "Sentyabr", "Oktyabr", "Noyabr", "Dekabr",
];

function buildMonthOptions(count = 12) {
  const options = [];
  const now = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
    options.push({ value, label: `${UZ_MONTHS[d.getMonth()]} ${d.getFullYear()}` });
  }
  return options;
}

export const monthOptions = [
  { value: "all", label: "Barcha oylar" },
  ...buildMonthOptions(18),
];

/** "2026-04-01T…" or "2026-04-01" → "Aprel 2026" */
export const formatMonthLabel = (isoDate) => {
  const d = new Date(isoDate);
  if (isNaN(d.getTime())) return isoDate;
  return `${UZ_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};

export const statusOptions = [
  { value: "all",     label: "Barcha holat" },
  { value: "pending", label: "Kutilmoqda"   },
  { value: "paid",    label: "To'langan"    },
];
