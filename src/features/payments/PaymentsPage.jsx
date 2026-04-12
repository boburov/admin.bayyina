// Toast
import { toast } from "sonner";

// React
import { useState, useMemo } from "react";

// API
import { classesAPI } from "@/features/classes/api/classes.api";

// TanStack Query
import { useAppQuery } from "@/shared/lib/query/query-hooks";

// Hooks
import useModal from "@/shared/hooks/useModal";

// Data
import { monthOptions, formatMonthLabel } from "@/features/payments/data/payments.data";

// Utils
import { formatUzDate } from "@/shared/utils/formatDate";

// Components
import Card from "@/shared/components/ui/Card";
import Select from "@/shared/components/form/select";
import Button from "@/shared/components/ui/button/Button";
import CreatePaymentModal from "@/features/payments/components/CreatePaymentModal";

// Icons
import {
  Users,
  CheckCircle2,
  XCircle,
  TrendingDown,
  Wallet,
  Plus,
  Search,
} from "lucide-react";

// ─── Helper ──────────────────────────────────────────────────────────────────
// nextPaymentDate keyingi oyda yoki undan keyin bo'lsa → shu oy to'langan
const isPaidForMonth = (enrollment, selectedMonth) => {
  if (!enrollment.nextPaymentDate) return false;
  const sel  = new Date(selectedMonth);
  const next = new Date(enrollment.nextPaymentDate);
  return (
    next.getFullYear() > sel.getFullYear() ||
    (next.getFullYear() === sel.getFullYear() && next.getMonth() > sel.getMonth())
  );
};

// ─── Page ────────────────────────────────────────────────────────────────────

const PaymentsPage = () => {
  const { openModal } = useModal();

  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(monthOptions[0].value);
  const [search, setSearch]               = useState("");

  // ── All groups ─────────────────────────────────────────────────────────
  const { data: groupsData, isLoading: groupsLoading } = useAppQuery({
    queryKey: ["admin-groups"],
    queryFn:  () => classesAPI.getAll(),
    onError:  () => toast.error("Guruhlar yuklanmadi"),
  });

  // ── Group detail + enrollments ─────────────────────────────────────────
  const { data: groupData, isLoading: enrollmentsLoading } = useAppQuery({
    queryKey: ["group-detail", selectedGroup],
    queryFn:  () => classesAPI.getOne(selectedGroup),
    enabled:  !!selectedGroup,
    onError:  () => toast.error("Guruh ma'lumotlari yuklanmadi"),
  });

  const groups      = groupsData?.groups     ?? [];
  const enrollments = groupData?.enrollments ?? [];
  const groupInfo   = groupData?.group       ?? null;
  const isLoading   = enrollmentsLoading && !!selectedGroup;

  const groupOptions = groups.map((g) => ({ value: g._id, label: g.name }));

  // ── Stats ──────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const paid         = enrollments.filter((e) =>  isPaidForMonth(e, selectedMonth));
    const unpaid       = enrollments.filter((e) => !isPaidForMonth(e, selectedMonth));
    const totalDebt    = enrollments.reduce((s, e) => s + (e.debt    ?? 0), 0);
    const totalBalance = enrollments.reduce((s, e) => s + (e.balance ?? 0), 0);
    return { total: enrollments.length, paid: paid.length, unpaid: unpaid.length, totalDebt, totalBalance };
  }, [enrollments, selectedMonth]);

  // ── Search + sort ──────────────────────────────────────────────────────
  const sorted = useMemo(() => {
    const q    = search.trim().toLowerCase();
    const rows = enrollments.map((e) => ({ enrollment: e, paid: isPaidForMonth(e, selectedMonth) }));
    const hit  = q
      ? rows.filter(({ enrollment: e }) => {
          const name = `${e.student.firstName} ${e.student.lastName}`.toLowerCase();
          return name.includes(q) || String(e.student.phone).includes(q);
        })
      : rows;
    return [...hit].sort((a, b) => Number(b.paid) - Number(a.paid));
  }, [enrollments, selectedMonth, search]);

  const handleOpenCreate = (enrollment) => {
    const discount      = enrollment.discount ?? 0;
    const price         = groupInfo?.price    ?? 0;
    const defaultAmount = Math.round(price * (1 - discount / 100));
    openModal("createPayment", {
      enrollmentId:  enrollment._id,
      studentId:     enrollment.student._id,
      studentName:   `${enrollment.student.firstName} ${enrollment.student.lastName}`,
      studentPhone:  enrollment.student.phone,
      month:         selectedMonth,
      defaultAmount,
    });
  };

  return (
    <div className="space-y-5">
      {/* ── Header ── */}
      <h1 className="page-title">To'lovlar</h1>

      {/* ── Filters ── */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="w-full sm:w-60">
          <Select
            size="md"
            value={selectedGroup}
            onChange={(val) => { setSelectedGroup(val); setSearch(""); }}
            options={groupOptions}
            isLoading={groupsLoading}
            placeholder="Guruh tanlang"
          />
        </div>

        <div className="w-full sm:w-48">
          <Select
            size="md"
            value={selectedMonth}
            onChange={setSelectedMonth}
            options={monthOptions}
            placeholder="Oy tanlang"
          />
        </div>

        <div className="flex flex-1 items-center gap-2 h-10 border border-gray-300 rounded-md px-3 bg-white focus-within:border-blue-500 transition-colors">
          <Search className="size-4 text-gray-400 shrink-0" strokeWidth={1.5} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Ism yoki telefon..."
            className="flex-1 text-sm bg-transparent outline-none text-primary placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* ── Stats ── */}
      {selectedGroup && (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 xl:grid-cols-5">
          <StatCard label="Jami o'quvchi" value={stats.total}
            icon={<Users className="size-5" strokeWidth={1.5} />} color="blue" />
          <StatCard label="To'lagan" value={stats.paid}
            icon={<CheckCircle2 className="size-5" strokeWidth={1.5} />} color="green" />
          <StatCard label="To'lamagan" value={stats.unpaid}
            icon={<XCircle className="size-5" strokeWidth={1.5} />} color="red" />
          <StatCard label="Jami qarz" value={`${stats.totalDebt.toLocaleString()} so'm`}
            icon={<TrendingDown className="size-5" strokeWidth={1.5} />} color="orange" small />
          <StatCard label="Jami balans" value={`${stats.totalBalance.toLocaleString()} so'm`}
            icon={<Wallet className="size-5" strokeWidth={1.5} />} color="purple" small />
        </div>
      )}

      {/* ── Content ── */}
      {!selectedGroup ? (
        <EmptyState icon={<Users className="size-10 opacity-30" strokeWidth={1.5} />} text="Guruhni tanlang" />
      ) : isLoading ? (
        <div className="text-center py-12 text-sm text-gray-400">Yuklanmoqda...</div>
      ) : enrollments.length === 0 ? (
        <EmptyState icon={<Users className="size-10 opacity-30" strokeWidth={1.5} />} text="Bu guruhda o'quvchilar yo'q" />
      ) : (
        <div>
          {groupInfo && (
            <p className="text-sm text-gray-400 mb-2">
              {groupInfo.name} — {formatMonthLabel(selectedMonth)}
              {groupInfo.price > 0 && (
                <span className="ml-2 text-gray-500">
                  · Oylik: {groupInfo.price.toLocaleString()} so'm
                </span>
              )}
            </p>
          )}

          <div className="rounded-lg overflow-x-auto border border-border bg-white">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>F.I.O</th>
                  <th>Telefon</th>
                  <th>To'lov holati</th>
                  <th>So'nggi to'lov</th>
                  <th>Keyingi to'lov</th>
                  <th>Qarz</th>
                  <th>Balans</th>
                  <th>Harakat</th>
                </tr>
              </thead>
              <tbody>
                {sorted.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-10 text-center text-sm text-gray-400">
                      O'quvchi topilmadi
                    </td>
                  </tr>
                ) : (
                  sorted.map(({ enrollment, paid }, idx) => {
                    const s = enrollment.student;
                    return (
                      <tr key={enrollment._id} className={paid ? "" : "bg-red-50/40"}>

                        <td className="text-center text-sm text-gray-400">{idx + 1}</td>

                        <td className="text-sm font-medium text-primary whitespace-nowrap">
                          {s.firstName} {s.lastName}
                        </td>

                        <td className="text-sm text-gray-400 text-center whitespace-nowrap">
                          +{s.phone}
                        </td>

                        {/* To'lov holati */}
                        <td className="text-center">
                          {paid ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-700">
                              <CheckCircle2 className="size-3" strokeWidth={2} />
                              To'lagan
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-600">
                              <XCircle className="size-3" strokeWidth={2} />
                              To'lanmagan
                            </span>
                          )}
                        </td>

                        {/* So'nggi to'lov */}
                        <td className="text-center text-sm text-gray-400 whitespace-nowrap">
                          {enrollment.lastPaymentDate ? formatUzDate(enrollment.lastPaymentDate) : "—"}
                        </td>

                        {/* Keyingi to'lov */}
                        <td className="text-center text-sm whitespace-nowrap">
                          {enrollment.nextPaymentDate ? (
                            <span className={paid ? "text-gray-400" : "text-orange-600 font-medium"}>
                              {formatUzDate(enrollment.nextPaymentDate)}
                            </span>
                          ) : "—"}
                        </td>

                        {/* Qarz */}
                        <td className="text-center text-sm whitespace-nowrap">
                          {enrollment.debt > 0 ? (
                            <span className="text-red-600 font-medium">
                              {enrollment.debt.toLocaleString()} so'm
                            </span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>

                        {/* Balans */}
                        <td className="text-center text-sm whitespace-nowrap">
                          {enrollment.balance > 0 ? (
                            <span className="text-blue-600 font-medium">
                              {enrollment.balance.toLocaleString()} so'm
                            </span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>

                        {/* Harakat */}
                        <td className="text-center">
                          {!paid && (
                            <Button
                              size="sm"
                              className="gap-1 px-2.5 text-xs h-7"
                              onClick={() => handleOpenCreate(enrollment)}
                            >
                              <Plus className="size-3.5" strokeWidth={2} />
                              To'lov
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="flex flex-wrap items-center gap-4 mt-3 px-1 text-xs text-gray-400">
            <span>Jami: <strong className="text-gray-700">{stats.total}</strong> o'quvchi</span>
            <span className="text-green-600">To'lagan: <strong>{stats.paid}</strong></span>
            <span className="text-red-500">To'lamagan: <strong>{stats.unpaid}</strong></span>
            {stats.totalDebt > 0 && (
              <span className="text-orange-500">
                Jami qarz: <strong>{stats.totalDebt.toLocaleString()} so'm</strong>
              </span>
            )}
            {stats.totalBalance > 0 && (
              <span className="text-blue-500">
                Jami balans: <strong>{stats.totalBalance.toLocaleString()} so'm</strong>
              </span>
            )}
          </div>
        </div>
      )}

      <CreatePaymentModal />
    </div>
  );
};

// ─── Stat Card ───────────────────────────────────────────────────────────────

const colorMap = {
  blue:   { bg: "bg-blue-50",   icon: "text-blue-500",   value: "text-blue-700"   },
  green:  { bg: "bg-green-50",  icon: "text-green-500",  value: "text-green-700"  },
  red:    { bg: "bg-red-50",    icon: "text-red-500",    value: "text-red-700"    },
  orange: { bg: "bg-orange-50", icon: "text-orange-500", value: "text-orange-700" },
  purple: { bg: "bg-purple-50", icon: "text-purple-500", value: "text-purple-700" },
};

const StatCard = ({ label, value, icon, color = "blue", small = false }) => {
  const c = colorMap[color];
  return (
    <Card className="flex items-center gap-3">
      <div className={`${c.bg} ${c.icon} p-2.5 rounded-lg shrink-0`}>{icon}</div>
      <div className="min-w-0">
        <p className="text-xs text-gray-400 truncate">{label}</p>
        <p className={`font-bold truncate ${small ? "text-sm" : "text-xl"} ${c.value}`}>{value}</p>
      </div>
    </Card>
  );
};

const EmptyState = ({ icon, text }) => (
  <div className="flex flex-col items-center gap-2 py-16 text-gray-400">
    {icon}
    <p className="text-sm">{text}</p>
  </div>
);

export default PaymentsPage;
