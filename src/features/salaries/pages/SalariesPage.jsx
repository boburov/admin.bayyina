// Toast
import { toast } from "sonner";

// React
import { useState } from "react";

// API
import { salariesAPI } from "@/features/salaries/api/salaries.api";
import { usersAPI } from "@/features/users/api/users.api";

// Data
import {
  salariesKeys,
  monthOptions,
  statusOptions,
  formatMonthLabel,
} from "@/features/salaries/data/salaries.data";

// Query
import { useAppQuery, useAppMutation } from "@/shared/lib/query/query-hooks";

// Hooks
import useModal from "@/shared/hooks/useModal";

// Components
import Card from "@/shared/components/ui/Card";
import Button from "@/shared/components/ui/button/Button";
import Select from "@/shared/components/form/select";
import Pagination from "@/shared/components/ui/Pagination";
import SalaryDetailModal from "@/features/salaries/components/SalaryDetailModal";
import GenerateSalariesModal from "@/features/salaries/components/GenerateSalariesModal";

// Utils
import { formatUzDate } from "@/shared/utils/formatDate";

// Icons
import {
  Wallet,
  Plus,
  RefreshCw,
  CheckCircle2,
  Clock,
  TrendingUp,
  Banknote,
} from "lucide-react";

const SalariesPage = () => {
  const { openModal } = useModal();

  const [month, setMonth] = useState("all");
  const [status, setStatus] = useState("all");
  const [teacher, setTeacher] = useState("all");
  const [page, setPage] = useState(1);

  // ── Teachers list for filter ──────────────────────────────────────────
  const { data: teachersData } = useAppQuery({
    queryKey: ["teachers-short"],
    queryFn: () => usersAPI.getTeachers({ limit: 200 }),
    staleTime: 5 * 60 * 1000,
  });

  const teachers = teachersData?.users ?? teachersData?.data ?? [];
  const teacherOptions = [
    { value: "all", label: "Barcha o'qituvchilar" },
    ...teachers.map((t) => ({
      value: t._id,
      label: `${t.firstName} ${t.lastName}`,
    })),
  ];

  // ── Salaries list ─────────────────────────────────────────────────────
  const activeMonth   = month   === "all" ? undefined : month;
  const activeStatus  = status  === "all" ? undefined : status;
  const activeTeacher = teacher === "all" ? undefined : teacher;
  const params = {
    page,
    limit: 20,
    ...(activeMonth   && { month:   activeMonth   }),
    ...(activeStatus  && { status:  activeStatus  }),
    ...(activeTeacher && { teacher: activeTeacher }),
  };

  const { data, isLoading, isError } = useAppQuery({
    queryKey: salariesKeys.list(params),
    queryFn: () => salariesAPI.getAll(params),
    onError: () => toast.error("Oyliklar yuklanmadi"),
  });

  const salaries = data?.salaries ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;
  // ── Pay mutation ──────────────────────────────────────────────────────
  const payMutation = useAppMutation({
    mutationFn: (id) => salariesAPI.pay(id),
    invalidateKeys: [salariesKeys.all],
    onSuccess: () => toast.success("Oylik to'landi"),
    onError: (err) => toast.error(err.response?.data?.message ?? "Xatolik"),
  });

  // ── Stats ─────────────────────────────────────────────────────────────
  const paidCount = salaries.filter((s) => s.status === "paid").length;
  const pendingCount = salaries.filter((s) => s.status === "pending").length;
  const totalNet = salaries.reduce((sum, s) => sum + (s.netAmount ?? 0), 0);

  const handleFilterChange = (setter) => (val) => {
    setter(val);
    setPage(1);
  };

  return (
    <div className="space-y-5">
      {/* ── Header ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="page-title">Oyliklar</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="gap-1.5 text-sm h-9"
            onClick={() => openModal("generateSalaries")}
          >
            <RefreshCw className="size-3.5" strokeWidth={1.5} />
            Hisoblash
          </Button>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="w-full sm:w-48">
          <Select
            size="md"
            value={month}
            onChange={handleFilterChange(setMonth)}
            options={monthOptions}
            placeholder="Oy tanlang"
          />
        </div>
        <div className="w-full sm:w-52">
          <Select
            size="md"
            value={teacher}
            onChange={handleFilterChange(setTeacher)}
            options={teacherOptions}
            placeholder="O'qituvchi"
          />
        </div>
        <div className="w-full sm:w-44">
          <Select
            size="md"
            value={status}
            onChange={handleFilterChange(setStatus)}
            options={statusOptions}
            placeholder="Holat"
          />
        </div>
      </div>

      {/* ── Stats ── */}
      {salaries.length > 0 && (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            label="Jami"
            value={total}
            icon={<Wallet className="size-5" strokeWidth={1.5} />}
            color="blue"
          />
          <StatCard
            label="To'langan"
            value={paidCount}
            icon={<CheckCircle2 className="size-5" strokeWidth={1.5} />}
            color="green"
          />
          <StatCard
            label="Kutilmoqda"
            value={pendingCount}
            icon={<Clock className="size-5" strokeWidth={1.5} />}
            color="orange"
          />
          <StatCard
            label="Jami to'lov"
            value={`${totalNet.toLocaleString()} so'm`}
            icon={<Banknote className="size-5" strokeWidth={1.5} />}
            color="purple"
            small
          />
        </div>
      )}

      {/* ── Table ── */}
      {isLoading ? (
        <div className="text-center py-16 text-sm text-gray-400">
          Yuklanmoqda...
        </div>
      ) : isError ? (
        <EmptyState
          icon={<Wallet className="size-10 opacity-30" strokeWidth={1.5} />}
          text="Ma'lumot yuklanmadi"
        />
      ) : salaries.length === 0 ? (
        <EmptyState
          icon={<Wallet className="size-10 opacity-30" strokeWidth={1.5} />}
          text="Oyliklar topilmadi"
        />
      ) : (
        <div className="rounded-lg overflow-x-auto border border-border bg-white">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>O'qituvchi</th>
                <th>Oy</th>
                <th>Hisoblangan</th>
                <th>Bonus</th>
                <th>Jarima</th>
                <th>Sof to'lov</th>
                <th>Holat</th>
                <th>To'langan sana</th>
                <th>Harakat</th>
              </tr>
            </thead>
            <tbody>
              {salaries.map((salary, idx) => {
                const isPaid = salary.status === "paid";
                const teacherName =
                  typeof salary.teacher === "object"
                    ? `${salary.teacher.firstName} ${salary.teacher.lastName}`
                    : "—";

                return (
                  <tr
                    key={salary._id}
                    className="cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => openModal("salaryDetail", { salary })}
                  >
                    <td className="text-center text-sm text-gray-400">
                      {(page - 1) * 20 + idx + 1}
                    </td>
                    <td className="text-sm font-medium text-primary whitespace-nowrap">
                      {teacherName}
                    </td>
                    <td className="text-sm text-gray-600 whitespace-nowrap">
                      {formatMonthLabel(salary.month)}
                    </td>
                    <td className="text-sm text-gray-600 whitespace-nowrap text-right">
                      {salary.totalAmount?.toLocaleString()} so'm
                    </td>
                    <td className="text-sm whitespace-nowrap text-right">
                      {salary.bonus > 0 ? (
                        <span className="text-green-600">
                          +{salary.bonus?.toLocaleString()} so'm
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="text-sm whitespace-nowrap text-right">
                      {salary.deduction > 0 ? (
                        <span className="text-red-500">
                          -{salary.deduction?.toLocaleString()} so'm
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="text-sm font-semibold whitespace-nowrap text-right">
                      {salary.netAmount?.toLocaleString()} so'm
                    </td>
                    <td>
                      <StatusBadge status={salary.status} />
                    </td>
                    <td className="text-sm text-gray-400 whitespace-nowrap text-center">
                      {salary.paidAt ? formatUzDate(salary.paidAt) : "—"}
                    </td>
                    <td
                      className="text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {!isPaid && (
                        <Button
                          size="sm"
                          className="gap-1 px-2.5 text-xs h-7 whitespace-nowrap"
                          disabled={payMutation.isPending}
                          onClick={() => payMutation.mutate(salary._id)}
                        >
                          <CheckCircle2 className="size-3.5" strokeWidth={2} />
                          To'landi
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      )}

      {/* ── Modals ── */}
      <SalaryDetailModal />
      <GenerateSalariesModal />
    </div>
  );
};

// ─── Stat Card ────────────────────────────────────────────────────────────────

const colorMap = {
  blue: { bg: "bg-blue-50", icon: "text-blue-500", value: "text-blue-700" },
  green: { bg: "bg-green-50", icon: "text-green-500", value: "text-green-700" },
  orange: {
    bg: "bg-orange-50",
    icon: "text-orange-500",
    value: "text-orange-700",
  },
  purple: {
    bg: "bg-purple-50",
    icon: "text-purple-500",
    value: "text-purple-700",
  },
};

const StatCard = ({ label, value, icon, color = "blue", small = false }) => {
  const c = colorMap[color];
  return (
    <Card className="flex items-center gap-3">
      <div className={`${c.bg} ${c.icon} p-2.5 rounded-lg shrink-0`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-400 truncate">{label}</p>
        <p
          className={`font-bold truncate ${small ? "text-sm" : "text-xl"} ${c.value}`}
        >
          {value}
        </p>
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

const StatusBadge = ({ status }) => {
  const paid = status === "paid";
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${
        paid ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
      }`}
    >
      {paid ? (
        <CheckCircle2 className="size-3" strokeWidth={2} />
      ) : (
        <Clock className="size-3" strokeWidth={2} />
      )}
      {paid ? "To'langan" : "Kutilmoqda"}
    </span>
  );
};

export default SalariesPage;
