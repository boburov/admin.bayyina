export const eventTypeLabel = {
  USER_STUDENT_CREATED:    "O'quvchi yaratildi",
  USER_TEACHER_CREATED:    "O'qituvchi yaratildi",
  USER_ADMIN_CREATED:      "Admin yaratildi",
  USER_UPDATED:            "Foydalanuvchi yangilandi",
  USER_DELETED:            "Foydalanuvchi o'chirildi",
  LEAD_CREATED:            "Murojaat yaratildi",
  LEAD_UPDATED:            "Murojaat yangilandi",
  LEAD_STATUS_CHANGED:     "Murojaat holati o'zgardi",
  LEAD_DELETED:            "Murojaat o'chirildi",
  LEAD_LINK_CLICKED:       "Referral link bosildi",
  ENROLLMENT_CREATED:      "Guruhga qo'shildi",
  ENROLLMENT_UPDATED:      "Ro'yxatga olish yangilandi",
  ENROLLMENT_COMPLETED:    "Kurs tugatildi",
  ENROLLMENT_DROPPED:      "Guruhdan chiqdi",
  ENROLLMENT_DELETED:      "Ro'yxatga olish o'chirildi",
  GROUP_CREATED:           "Guruh yaratildi",
  GROUP_UPDATED:           "Guruh yangilandi",
  GROUP_DELETED:           "Guruh o'chirildi",
  PAYMENT_CREATED:         "To'lov yaratildi",
  PAYMENT_PAID:            "To'lov amalga oshirildi",
  PAYMENT_OVERDUE:         "To'lov muddati o'tdi",
  PAYMENT_UPDATED:         "To'lov yangilandi",
  PAYMENT_DELETED:         "To'lov o'chirildi",
  ATTENDANCE_MARKED:       "Davomat belgilandi",
  ATTENDANCE_UPDATED:      "Davomat yangilandi",
  ATTENDANCE_DELETED:      "Davomat o'chirildi",
  SALARY_CREATED:          "Maosh yaratildi",
  SALARY_UPDATED:          "Maosh yangilandi",
  SALARY_PAID:             "Maosh to'landi",
  SALARY_DELETED:          "Maosh o'chirildi",
};

export const entityTypeLabel = {
  Lead:       "Murojaat",
  User:       "Foydalanuvchi",
  Enrollment: "Ro'yxatga olish",
  Group:      "Guruh",
  Payment:    "To'lov",
  Attendance: "Davomat",
  Salary:     "Maosh",
  System:     "Tizim",
};

export const actorRoleLabel = {
  admin:   "Admin",
  teacher: "O'qituvchi",
  student: "O'quvchi",
  system:  "Tizim",
};

// color: "green" | "blue" | "amber" | "red"
// icon: lucide-react icon name
export const eventTypeConfig = {
  USER_STUDENT_CREATED:    { color: "blue",  icon: "UserPlus"      },
  USER_TEACHER_CREATED:    { color: "blue",  icon: "UserPlus"      },
  USER_ADMIN_CREATED:      { color: "blue",  icon: "UserPlus"      },
  USER_UPDATED:            { color: "amber", icon: "UserCog"       },
  USER_DELETED:            { color: "red",   icon: "UserX"         },
  LEAD_CREATED:            { color: "blue",  icon: "UserPlus"      },
  LEAD_UPDATED:            { color: "amber", icon: "RefreshCw"     },
  LEAD_STATUS_CHANGED:     { color: "amber", icon: "ArrowRightLeft"},
  LEAD_DELETED:            { color: "red",   icon: "Trash2"        },
  LEAD_LINK_CLICKED:       { color: "blue",  icon: "MousePointerClick" },
  ENROLLMENT_CREATED:      { color: "blue",  icon: "BookOpen"      },
  ENROLLMENT_UPDATED:      { color: "amber", icon: "Edit"          },
  ENROLLMENT_COMPLETED:    { color: "green", icon: "GraduationCap" },
  ENROLLMENT_DROPPED:      { color: "red",   icon: "LogOut"        },
  ENROLLMENT_DELETED:      { color: "red",   icon: "Trash2"        },
  GROUP_CREATED:           { color: "blue",  icon: "School"        },
  GROUP_UPDATED:           { color: "amber", icon: "Edit"          },
  GROUP_DELETED:           { color: "red",   icon: "Trash2"        },
  PAYMENT_CREATED:         { color: "blue",  icon: "Wallet"        },
  PAYMENT_PAID:            { color: "green", icon: "CheckCircle2"  },
  PAYMENT_OVERDUE:         { color: "red",   icon: "AlertCircle"   },
  PAYMENT_UPDATED:         { color: "amber", icon: "Edit"          },
  PAYMENT_DELETED:         { color: "red",   icon: "Trash2"        },
  ATTENDANCE_MARKED:       { color: "blue",  icon: "CalendarCheck" },
  ATTENDANCE_UPDATED:      { color: "amber", icon: "CalendarCog"   },
  ATTENDANCE_DELETED:      { color: "red",   icon: "CalendarX"     },
  SALARY_CREATED:          { color: "blue",  icon: "Banknote"      },
  SALARY_UPDATED:          { color: "amber", icon: "Edit"          },
  SALARY_PAID:             { color: "green", icon: "BadgeCheck"    },
  SALARY_DELETED:          { color: "red",   icon: "Trash2"        },
};

export const colorStyles = {
  green: {
    dot:  "bg-green-500",
    icon: "bg-green-50 text-green-600",
    text: "text-green-700",
    tag:  "bg-green-50 text-green-700 border-green-200",
  },
  blue: {
    dot:  "bg-blue-500",
    icon: "bg-blue-50 text-blue-600",
    text: "text-blue-700",
    tag:  "bg-blue-50 text-blue-700 border-blue-200",
  },
  amber: {
    dot:  "bg-amber-400",
    icon: "bg-amber-50 text-amber-600",
    text: "text-amber-700",
    tag:  "bg-amber-50 text-amber-700 border-amber-200",
  },
  red: {
    dot:  "bg-red-500",
    icon: "bg-red-50 text-red-600",
    text: "text-red-700",
    tag:  "bg-red-50 text-red-700 border-red-200",
  },
};

export const eventTypeFilterOptions = [
  { value: "",                     label: "Barcha hodisalar"          },
  { value: "USER_STUDENT_CREATED", label: "O'quvchi yaratildi"        },
  { value: "USER_TEACHER_CREATED", label: "O'qituvchi yaratildi"      },
  { value: "USER_UPDATED",         label: "Foydalanuvchi yangilandi"  },
  { value: "USER_DELETED",         label: "Foydalanuvchi o'chirildi"  },
  { value: "LEAD_CREATED",         label: "Murojaat yaratildi"        },
  { value: "LEAD_STATUS_CHANGED",  label: "Murojaat holati o'zgardi"  },
  { value: "LEAD_LINK_CLICKED",    label: "Referral link bosildi"     },
  { value: "ENROLLMENT_CREATED",   label: "Guruhga qo'shildi"         },
  { value: "ENROLLMENT_DROPPED",   label: "Guruhdan chiqdi"           },
  { value: "ENROLLMENT_COMPLETED", label: "Kurs tugatildi"            },
  { value: "GROUP_CREATED",        label: "Guruh yaratildi"           },
  { value: "GROUP_UPDATED",        label: "Guruh yangilandi"          },
  { value: "GROUP_DELETED",        label: "Guruh o'chirildi"          },
  { value: "PAYMENT_CREATED",      label: "To'lov yaratildi"          },
  { value: "PAYMENT_PAID",         label: "To'lov amalga oshirildi"   },
  { value: "PAYMENT_OVERDUE",      label: "To'lov muddati o'tdi"      },
  { value: "PAYMENT_UPDATED",      label: "To'lov yangilandi"         },
  { value: "PAYMENT_DELETED",      label: "To'lov o'chirildi"         },
  { value: "SALARY_CREATED",       label: "Maosh yaratildi"           },
  { value: "SALARY_PAID",          label: "Maosh to'landi"            },
  { value: "SALARY_UPDATED",       label: "Maosh yangilandi"          },
  { value: "SALARY_DELETED",       label: "Maosh o'chirildi"          },
  { value: "ATTENDANCE_MARKED",    label: "Davomat belgilandi"        },
  { value: "ATTENDANCE_UPDATED",   label: "Davomat yangilandi"        },
  { value: "ATTENDANCE_DELETED",   label: "Davomat o'chirildi"        },
];

export const entityTypeFilterOptions = [
  { value: "",           label: "Barcha obyekt turlari" },
  { value: "Payment",    label: "To'lov"                },
  { value: "User",       label: "O'quvchi / O'qituvchi" },
  { value: "Group",      label: "Guruh"                 },
  { value: "Salary",     label: "Maosh"                 },
  { value: "Lead",       label: "Murojaat"              },
  { value: "Enrollment", label: "Ro'yxatga olish"       },
  { value: "Attendance", label: "Davomat"               },
  { value: "System",     label: "Tizim"                 },
];

const today     = () => { const d = new Date(); d.setHours(0,0,0,0); return d; };
const yesterday = () => new Date(today() - 86400000);
const weekStart = () => {
  const d = today();
  const day = d.getDay() || 7;
  return new Date(d - (day - 1) * 86400000);
};

export const getDateGroup = (iso) => {
  const d = new Date(iso);
  d.setHours(0, 0, 0, 0);
  if (d >= today())     return "bugun";
  if (d >= yesterday()) return "kecha";
  if (d >= weekStart()) return "bu_hafta";
  return "oldinroq";
};

export const dateGroupLabel = {
  bugun:    "Bugun",
  kecha:    "Kecha",
  bu_hafta: "Bu hafta",
  oldinroq: "Oldinroq",
};

export const DATE_GROUP_ORDER = ["bugun", "kecha", "bu_hafta", "oldinroq"];
