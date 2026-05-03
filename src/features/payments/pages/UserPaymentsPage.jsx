// Toast
import { toast } from "sonner";

// React
import { useMemo } from "react";

// Router
import { useParams, useNavigate } from "react-router-dom";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// API
import { usersAPI }       from "@/features/users/api/users.api";
import { paymentsAPI }    from "@/features/payments/api/payments.api";
import { enrollmentsAPI } from "@/features/enrollments/api/enrollments.api";

// Utils
import { formatUzDate }   from "@/shared/utils/formatDate";
import { formatPhone }    from "@/shared/utils/formatPhone";
import { formatMoney }    from "@/shared/utils/formatNumber";

// Components
import Button from "@/shared/components/ui/button/Button";

// Icons
import {
  ArrowLeft,
  Receipt,
  Phone,
  BookOpen,
  GraduationCap,
  LogOut,
  Wallet,
  TrendingDown,
} from "lucide-react";

// ─── Status configs ───────────────────────────────────────────────────────────

const PAYMENT_STATUS = {
  paid:    { label: "To'langan",      cls: "bg-green-100 text-green-700"   },
  pending: { label: "Kutilmoqda",     cls: "bg-yellow-100 text-yellow-700" },
  overdue: { label: "Muddati o'tgan", cls: "bg-red-100 text-red-600"       },
};

const ENROLLMENT_STATUS = {
  active:    { label: "Faol",     icon: BookOpen,      cls: "bg-blue-50 text-blue-700 border-blue-200"  },
  completed: { label: "Bitirdi",  icon: GraduationCap, cls: "bg-green-50 text-green-700 border-green-200" },
  dropped:   { label: "Ketdi",    icon: LogOut,        cls: "bg-red-50 text-red-600 border-red-200"     },
};

const PaymentStatusBadge = ({ status }) => {
  const cfg = PAYMENT_STATUS[status] ?? { label: status, cls: "bg-gray-100 text-gray-600" };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
};

// ─── Page ─────────────────────────────────────────────────────────────────────

const UserPaymentsPage = () => {
  const { userId } = useParams();
  const navigate   = useNavigate();

  const { data: userData } = useQuery({
    queryKey: ["user", userId],
    queryFn:  () => usersAPI.getOne(userId).then((r) => r.data),
    enabled:  !!userId,
    onError:  () => toast.error("Foydalanuvchi ma'lumotlari yuklanmadi"),
  });

  const { data: paymentsData, isLoading: paymentsLoading } = useQuery({
    queryKey: ["payments", "user", userId],
    queryFn:  () => paymentsAPI.search({ student: userId, limit: 200 }).then((r) => r.data),
    enabled:  !!userId,
    onError:  () => toast.error("To'lovlar yuklanmadi"),
  });

  const { data: enrollmentsData } = useQuery({
    queryKey: ["enrollments", "user", userId],
    queryFn:  () => enrollmentsAPI.getAll({ student: userId, limit: 50 }).then((r) => r.data),
    enabled:  !!userId,
  });

  const user        = userData?.user           ?? null;
  const payments    = paymentsData?.payments   ?? [];
  const enrollments = enrollmentsData?.enrollments ?? [];

  const stats = useMemo(() => {
    const paidPayments = payments.filter((p) => p.status === "paid");
    const totalPaid    = paidPayments.reduce((s, p) => s + (p.amount ?? 0), 0);
    const totalDebt    = enrollments.reduce((s, e) => s + (e.debt    ?? 0), 0);
    const totalBalance = enrollments.reduce((s, e) => s + (e.balance ?? 0), 0);
    return { count: paidPayments.length, totalPaid, totalDebt, totalBalance };
  }, [payments, enrollments]);

  const fullName = user ? `${user.firstName} ${user.lastName}` : "Yuklanmoqda...";

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center gap-2 pb-4 border-b border-border">
        <Button
          variant="ghost"
          onClick={() => navigate("/payments?tab=records")}
        >
          <ArrowLeft strokeWidth={1.5} />
        </Button>
        <h1 className="page-title">{fullName}</h1>
      </div>

      {/* Student info + stats */}
      {user && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Info card */}
          <div className="sm:col-span-2 lg:col-span-1 flex items-center gap-3 p-4 bg-white border border-border rounded-lg">
            <div className="size-11 rounded-full bg-brown-100 flex items-center justify-center shrink-0">
              <span className="text-base font-semibold text-brown-700">
                {user.firstName?.[0]?.toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{fullName}</p>
              <p className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                <Phone className="size-3" strokeWidth={1.5} />
                {formatPhone(String(user.phone))}
              </p>
            </div>
          </div>

          {/* Total paid */}
          <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="p-2 bg-green-100 rounded-lg shrink-0">
              <Wallet className="size-4 text-green-600" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-xs text-green-600">Jami to'langan</p>
              <p className="text-lg font-bold text-green-700">{formatMoney(stats.totalPaid)}</p>
              <p className="text-xs text-green-500">{stats.count} ta to'lov</p>
            </div>
          </div>

          {/* Debt */}
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="p-2 bg-red-100 rounded-lg shrink-0">
              <TrendingDown className="size-4 text-red-600" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-xs text-red-600">Jami qarz</p>
              <p className="text-lg font-bold text-red-700">{formatMoney(stats.totalDebt)}</p>
            </div>
          </div>

          {/* Balance */}
          <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="p-2 bg-blue-100 rounded-lg shrink-0">
              <Wallet className="size-4 text-blue-600" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-xs text-blue-600">Balans</p>
              <p className="text-lg font-bold text-blue-700">{formatMoney(stats.totalBalance)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Enrollments */}
      {enrollments.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-gray-700">Guruhlar</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {enrollments.map((e) => {
              const cfg  = ENROLLMENT_STATUS[e.status] ?? ENROLLMENT_STATUS.active;
              const Icon = cfg.icon;
              return (
                <div key={e._id} className="bg-white border border-border rounded-lg p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-gray-900 leading-snug">
                      {e.group?.name ?? "—"}
                    </p>
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border shrink-0 ${cfg.cls}`}>
                      <Icon className="size-3" strokeWidth={2} />
                      {cfg.label}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                    {e.group?.price > 0 && (
                      <span>Oylik: <strong className="text-gray-700">{formatMoney(e.group.price)}</strong></span>
                    )}
                    {e.discount > 0 && (
                      <span className="text-purple-600">Chegirma: <strong>-{formatMoney(e.discount)}</strong></span>
                    )}
                    {e.debt > 0 && (
                      <span className="text-red-600">Qarz: <strong>{formatMoney(e.debt)}</strong></span>
                    )}
                    {e.balance > 0 && (
                      <span className="text-blue-600">Balans: <strong>+{formatMoney(e.balance)}</strong></span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Payments history */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-gray-700">To'lovlar tarixi</h2>

        <div className="rounded-lg overflow-x-auto border border-border bg-white">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Miqdor</th>
                <th>Holat</th>
                <th>Oy</th>
                <th>Sana</th>
                <th>Qabul qilgan</th>
                <th>Izoh</th>
              </tr>
            </thead>
            <tbody>
              {paymentsLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-sm text-gray-400">
                    Yuklanmoqda...
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-2 text-gray-400">
                      <Receipt className="size-10 opacity-30" strokeWidth={1.5} />
                      <p className="text-sm">To'lovlar topilmadi</p>
                    </div>
                  </td>
                </tr>
              ) : (
                payments.map((p, idx) => (
                  <tr key={p._id}>
                    <td className="text-center text-sm text-gray-400">{idx + 1}</td>
                    <td className="text-center text-sm font-semibold text-gray-900 whitespace-nowrap">
                      {formatMoney(p.amount)}
                    </td>
                    <td className="text-center">
                      <PaymentStatusBadge status={p.status} />
                    </td>
                    <td className="text-center text-sm text-gray-500 whitespace-nowrap">
                      {p.month ?? "—"}
                    </td>
                    <td className="text-center text-sm text-gray-500 whitespace-nowrap">
                      {p.paidAt ? formatUzDate(p.paidAt) : "—"}
                    </td>
                    <td className="text-center text-sm text-gray-500 whitespace-nowrap">
                      {p.createdBy
                        ? `${p.createdBy.firstName} ${p.createdBy.lastName}`
                        : "—"}
                    </td>
                    <td className="text-sm text-gray-400 max-w-[180px] truncate">
                      {p.note ?? "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default UserPaymentsPage;
