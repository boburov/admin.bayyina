// TanStack Query
import { useQuery } from "@tanstack/react-query";

// API
import { enrollmentsAPI } from "@/features/enrollments/api/enrollments.api";
import { paymentsAPI }    from "@/features/payments/api/payments.api";

// Components
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

// Utils
import { formatUzDate } from "@/shared/utils/formatDate";
import { formatPhone }  from "@/shared/utils/formatPhone";

// Icons
import {
  Phone, Calendar, UserRound, BookOpen,
  CreditCard, Wallet, AlertCircle, Users,
} from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n) => Number(n || 0).toLocaleString("uz-UZ");

const MONTH_NAMES = [
  "Yanvar","Fevral","Mart","Aprel","May","Iyun",
  "Iyul","Avgust","Sentyabr","Oktyabr","Noyabr","Dekabr",
];

const formatMonth = (date) => {
  if (!date) return "—";
  const d = new Date(date);
  return `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
};

const InfoRow = ({ icon, label, value }) => (
  <div>
    <p className="flex items-center gap-1 text-xs text-gray-400 mb-0.5">{icon} {label}</p>
    <p className="text-sm font-medium text-gray-800">{value || "—"}</p>
  </div>
);

const STATUS_LABELS = {
  active:    { label: "Faol",        cls: "bg-green-50 text-green-700 border-green-200" },
  completed: { label: "Yakunlangan", cls: "bg-blue-50 text-blue-700 border-blue-200"   },
  dropped:   { label: "Tark etgan",  cls: "bg-red-50 text-red-700 border-red-200"      },
};

// ─── Modal wrapper ────────────────────────────────────────────────────────────

const StudentDetailModal = () => (
  <ResponsiveModal name="studentDetail" title="O'quvchi ma'lumotlari" className="sm:max-w-lg">
    <Content />
  </ResponsiveModal>
);

// ─── Content ──────────────────────────────────────────────────────────────────

const Content = ({ _id, firstName, lastName, phone, age, gender, source, createdAt }) => {
  const { data: enrollData, isLoading: enrollLoading } = useQuery({
    queryKey: ["enrollments", "student", _id],
    queryFn: () => enrollmentsAPI.getAll({ student: _id, limit: 50 }).then((r) => r.data),
    enabled: !!_id,
    staleTime: 60_000,
  });

  const { data: payData, isLoading: payLoading } = useQuery({
    queryKey: ["payments", "student", _id],
    queryFn: () => paymentsAPI.getAll({ student: _id, limit: 30 }).then((r) => r.data),
    enabled: !!_id,
    staleTime: 60_000,
  });

  const enrollments = enrollData?.enrollments ?? [];
  const payments    = payData?.payments ?? [];

  const genderLabel = gender === "male" ? "Erkak" : gender === "female" ? "Ayol" : null;

  return (
    <div className="space-y-5">

      {/* Basic info */}
      <div className="grid grid-cols-2 gap-3">
        <InfoRow
          icon={<Phone size={12} />}
          label="Telefon"
          value={phone ? formatPhone(String(phone)) : null}
        />
        <InfoRow
          icon={<Calendar size={12} />}
          label="Ro'yxatdan o'tgan"
          value={createdAt ? formatUzDate(createdAt) : null}
        />
        {age && (
          <InfoRow
            icon={<UserRound size={12} />}
            label="Yosh"
            value={`${age} yosh`}
          />
        )}
        {genderLabel && (
          <InfoRow
            icon={<Users size={12} />}
            label="Jins"
            value={genderLabel}
          />
        )}
      </div>

      {/* Enrollments */}
      <div>
        <p className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2.5">
          <BookOpen size={12} /> Guruhlar
        </p>

        {enrollLoading ? (
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : enrollments.length === 0 ? (
          <p className="text-xs text-gray-400 py-2">Guruhga biriktirilmagan</p>
        ) : (
          <div className="space-y-2">
            {enrollments.map((en) => {
              const st = STATUS_LABELS[en.status] ?? STATUS_LABELS.active;
              return (
                <div key={en._id} className="p-3 border border-gray-200 rounded-lg bg-white">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-gray-900">{en.group?.name ?? "—"}</p>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${st.cls}`}>
                      {st.label}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <p className="text-gray-400">Chegirma</p>
                      <p className="font-medium">{en.discount ? `${en.discount}%` : "Yo'q"}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 flex items-center gap-0.5">
                        <AlertCircle size={10} /> Qarz
                      </p>
                      <p className={`font-medium ${en.debt > 0 ? "text-red-600" : "text-gray-700"}`}>
                        {fmt(en.debt)} so'm
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 flex items-center gap-0.5">
                        <Wallet size={10} /> Balans
                      </p>
                      <p className={`font-medium ${en.balance > 0 ? "text-green-600" : "text-gray-700"}`}>
                        {fmt(en.balance)} so'm
                      </p>
                    </div>
                  </div>
                  {en.nextPaymentDate && (
                    <p className="mt-1.5 text-[10px] text-gray-400">
                      Keyingi to'lov: {formatUzDate(en.nextPaymentDate)}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Payment history */}
      <div>
        <p className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2.5">
          <CreditCard size={12} /> To'lovlar tarixi
        </p>

        {payLoading ? (
          <div className="h-10 bg-gray-100 rounded-lg animate-pulse" />
        ) : payments.length === 0 ? (
          <p className="text-xs text-gray-400 py-2">To'lovlar mavjud emas</p>
        ) : (
          <div className="divide-y divide-gray-100 border border-gray-200 rounded-lg overflow-hidden">
            {payments.map((p) => (
              <div key={p._id} className="flex items-center justify-between px-3 py-2.5 bg-white">
                <div>
                  <p className="text-xs font-medium text-gray-800">{formatMonth(p.month)}</p>
                  {p.note && <p className="text-[10px] text-gray-400">{p.note}</p>}
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{fmt(p.amount)} so'm</p>
                  <p className={`text-[10px] ${
                    p.status === "paid"    ? "text-green-600" :
                    p.status === "overdue" ? "text-red-500"   : "text-amber-500"
                  }`}>
                    {p.status === "paid" ? "To'langan" : p.status === "overdue" ? "Muddati o'tgan" : "Kutilmoqda"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default StudentDetailModal;
