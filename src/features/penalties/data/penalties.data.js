export const penaltyStatusOptions = [
  { value: "all", label: "Barcha statuslar" },
  { value: "pending", label: "Kutilmoqda" },
  { value: "approved", label: "Tasdiqlangan" },
  { value: "rejected", label: "Rad etilgan" },
];

export const penaltyStatusLabels = {
  pending: "Kutilmoqda",
  approved: "Tasdiqlangan",
  rejected: "Rad etilgan",
};

export const penaltyStatusColors = {
  pending: "bg-yellow-100 text-yellow-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-gray-100 text-gray-500",
};

export const penaltyReviewOptions = [
  { value: "approved", label: "Tasdiqlash" },
  { value: "rejected", label: "Rad etish" },
];

export const targetRoleOptions = [
  { value: "student", label: "O'quvchi" },
  { value: "teacher", label: "O'qituvchi" },
];

export const targetRoleTabs = [
  { label: "O'quvchi kategoriyalari", value: "student" },
  { label: "O'qituvchi kategoriyalari", value: "teacher" },
];

export const penaltyPageTabs = [
  { label: "Jarimalar", value: "penalties" },
  { label: "Kamaytirishlar", value: "reductions" },
];
