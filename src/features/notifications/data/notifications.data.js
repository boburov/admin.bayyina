export const typeLabel = {
  complaint:  "Shikoyat",
  suggestion: "Taklif",
  info:       "Ma'lumot",
  request:    "So'rov",
};

export const statusLabel = {
  open:        { text: "Ochiq",       cls: "bg-amber-50 text-amber-700 border border-amber-200" },
  in_progress: { text: "Jarayonda",   cls: "bg-blue-50 text-blue-700 border border-blue-200"   },
  resolved:    { text: "Hal qilindi", cls: "bg-green-50 text-green-700 border border-green-200" },
  closed:      { text: "Yopiq",       cls: "bg-gray-100 text-gray-600 border border-gray-200"  },
  pending:     { text: "Kutilmoqda",  cls: "bg-gray-100 text-gray-600 border border-gray-200"  },
};

export const typeOptions = [
  { value: "complaint",  label: "Shikoyat"  },
  { value: "suggestion", label: "Taklif"    },
  { value: "info",       label: "Ma'lumot"  },
  { value: "request",    label: "So'rov"    },
];

export const typeFilterOptions = [
  { value: "all",        label: "Barcha turlar"   },
  { value: "complaint",  label: "Shikoyat"        },
  { value: "suggestion", label: "Taklif"          },
  { value: "info",       label: "Ma'lumot"        },
  { value: "request",    label: "So'rov"          },
];

export const statusFilterOptions = [
  { value: "all",         label: "Barcha statuslar" },
  { value: "open",        label: "Ochiq"            },
  { value: "in_progress", label: "Jarayonda"        },
  { value: "resolved",    label: "Hal qilindi"      },
  { value: "closed",      label: "Yopiq"            },
];
