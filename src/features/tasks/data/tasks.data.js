export const taskStatusLabels = {
  pending: "Kutilmoqda",
  extended: "Uzaytirilgan",
  pending_rejected: "Kutilmoqda (Rad etilgan)",
  stopped: "To'xtatilgan",
  completed: "Muvaffaqiyatli yakunlangan",
  pending_review: "Yakunlangan (Tasdiq kutilmoqda)",
};

export const taskStatusColors = {
  pending: "bg-yellow-100 text-yellow-700",
  extended: "bg-blue-100 text-blue-700",
  pending_rejected: "bg-red-100 text-red-700",
  stopped: "bg-gray-100 text-gray-500",
  completed: "bg-green-100 text-green-700",
  pending_review: "bg-purple-100 text-purple-700",
};

export const taskStatusOptions = [
  { value: "all", label: "Barcha statuslar" },
  { value: "pending", label: "Kutilmoqda" },
  { value: "extended", label: "Uzaytirilgan" },
  { value: "pending_rejected", label: "Kutilmoqda (Rad etilgan)" },
  { value: "pending_review", label: "Tasdiq kutilmoqda" },
  { value: "stopped", label: "To'xtatilgan" },
  { value: "completed", label: "Muvaffaqiyatli yakunlangan" },
];

export const ACTIVE_TASK_STATUSES = [
  "pending",
  "extended",
  "pending_rejected",
  "pending_review",
];
