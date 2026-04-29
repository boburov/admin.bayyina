import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { usersAPI }    from "@/features/users/api/users.api";
import { salariesAPI } from "@/features/salaries/api/salaries.api";
import {
  salariesKeys,
  monthOptions,
  formatMonthLabel,
} from "@/features/salaries/data/salaries.data";
import { useAppQuery } from "@/shared/lib/query/query-hooks";
import useModal        from "@/shared/hooks/useModal";
import { formatUzDate } from "@/shared/utils/formatDate";

import Card       from "@/shared/components/ui/Card";
import Button     from "@/shared/components/ui/button/Button";
import Pagination from "@/shared/components/ui/Pagination";
import SalaryDetailModal from "@/features/salaries/components/SalaryDetailModal";

import {
  ArrowLeft, User, Phone, Wallet,
  CheckCircle2, Clock, ChevronRight,
} from "lucide-react";

// ─── Status badge ─────────────────────────────────────────────────────────────

const StatusBadge = ({ status }) => {
  const paid = status === "paid";
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${
      paid ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
    }`}>
      {paid ? <CheckCircle2 size={11} /> : <Clock size={11} />}
      {paid ? "To'langan" : "Kutilmoqda"}
    </span>
  );
};

// ─── Page ─────────────────────────────────────────────────────────────────────

const TeacherSalaryPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { openModal } = useModal();

  const [month, setMonth] = useState("all");
  const [page, setPage]   = useState(1);

  // Teacher info
  const { data: teacherData, isLoading: teacherLoading } = useAppQuery({
    queryKey: ["users", id],
    queryFn:  () => usersAPI.getOne(id),
    select:   (r) => r.data,
    onError:  () => toast.error("O'qituvchi topilmadi"),
  });

  const teacher = teacherData?.user ?? teacherData;

  // Salaries filtered by teacher
  const params = {
    teacher: id,
    page,
    limit: 15,
    ...(month !== "all" && { month }),
  };

  const { data, isLoading: salariesLoading } = useAppQuery({
    queryKey: salariesKeys.list(params),
    queryFn:  () => salariesAPI.getAll(params),
    onError:  () => toast.error("Oyliklar yuklanmadi"),
  });

  const salaries   = data?.salaries   ?? [];
  const totalPages = data?.totalPages ?? 1;

  const totalNet  = salaries.reduce((s, x) => s + (x.netAmount ?? 0), 0);
  const paidCount = salaries.filter((s) => s.status === "paid").length;

  const teacherName = teacher
    ? `${teacher.firstName ?? ""} ${teacher.lastName ?? ""}`.trim()
    : "—";

  return (
    <div className="space-y-5 pb-10">
      <SalaryDetailModal />

      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-border">
        <button
          onClick={() => navigate("/teachers")}
          className="text-gray-400 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft size={18} strokeWidth={1.5} />
        </button>
        <div>
          <h1 className="page-title">Oylik tarixi</h1>
          {!teacherLoading && teacher && (
            <p className="text-sm text-gray-400 mt-0.5">{teacherName}</p>
          )}
        </div>
      </div>

      {/* Teacher info cards */}
      {!teacherLoading && teacher && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="flex items-center gap-3 !py-3">
            <div className="flex items-center justify-center size-9 bg-brown-50 border border-brown-200 shrink-0">
              <User size={15} className="text-brown-800" strokeWidth={1.5} />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-400">Ism</p>
              <p className="text-sm font-semibold text-gray-900 truncate">{teacherName}</p>
            </div>
          </Card>

          <Card className="flex items-center gap-3 !py-3">
            <div className="flex items-center justify-center size-9 bg-blue-50 border border-blue-200 shrink-0">
              <Phone size={15} className="text-blue-600" strokeWidth={1.5} />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-400">Telefon</p>
              <p className="text-sm font-semibold text-gray-900">{teacher.phone ?? "—"}</p>
            </div>
          </Card>

          <Card className="flex items-center gap-3 !py-3">
            <div className="flex items-center justify-center size-9 bg-green-50 border border-green-200 shrink-0">
              <Wallet size={15} className="text-green-600" strokeWidth={1.5} />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-400">Jami sof (filtr)</p>
              <p className="text-sm font-semibold text-gray-900">
                {totalNet.toLocaleString()} so'm
              </p>
            </div>
          </Card>

          <Card className="flex items-center gap-3 !py-3">
            <div className="flex items-center justify-center size-9 bg-amber-50 border border-amber-200 shrink-0">
              <CheckCircle2 size={15} className="text-amber-600" strokeWidth={1.5} />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-400">To'langan oylar</p>
              <p className="text-sm font-semibold text-gray-900">
                {paidCount} / {salaries.length}
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={month}
          onChange={(e) => { setMonth(e.target.value); setPage(1); }}
          className="py-2 px-3 text-sm border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-gray-300"
        >
          {monthOptions.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className={`rounded-lg overflow-x-auto border border-border bg-white transition-opacity ${salariesLoading ? "opacity-60" : ""}`}>
        <table>
          <thead>
            <tr>
              <th>Oy</th>
              <th>Guruhlar</th>
              <th>Hisoblangan</th>
              <th>Bonus</th>
              <th>Jarima</th>
              <th>Sof to'lov</th>
              <th>To'langan sana</th>
              <th>Holat</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {salariesLoading ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-sm text-gray-400">
                  Yuklanmoqda...
                </td>
              </tr>
            ) : salaries.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-2 text-gray-400">
                    <Wallet className="size-10 opacity-30" strokeWidth={1.5} />
                    <p className="text-sm">Oyliklar topilmadi</p>
                  </div>
                </td>
              </tr>
            ) : (
              salaries.map((sal) => (
                <tr key={sal._id}>
                  <td className="font-medium text-gray-900">
                    {formatMonthLabel(sal.month)}
                  </td>
                  <td className="text-gray-500 text-xs">
                    {sal.groups?.length
                      ? sal.groups.map((g) => g.groupName).join(", ")
                      : "—"}
                  </td>
                  <td>{sal.totalAmount?.toLocaleString()} so'm</td>
                  <td className={sal.bonus > 0 ? "text-green-600 font-medium" : "text-gray-400"}>
                    {sal.bonus > 0 ? `+${sal.bonus.toLocaleString()}` : "—"}
                  </td>
                  <td className={sal.deduction > 0 ? "text-red-500 font-medium" : "text-gray-400"}>
                    {sal.deduction > 0 ? `-${sal.deduction.toLocaleString()}` : "—"}
                  </td>
                  <td className="font-semibold text-gray-900">
                    {sal.netAmount?.toLocaleString()} so'm
                  </td>
                  <td className="text-gray-500 text-sm">
                    {sal.paidAt ? formatUzDate(sal.paidAt) : "—"}
                  </td>
                  <td>
                    <StatusBadge status={sal.status} />
                  </td>
                  <td>
                    <button
                      onClick={() => openModal("salaryDetail", sal)}
                      className="text-gray-400 hover:text-gray-700 transition-colors"
                      title="Batafsil / tahrirlash"
                    >
                      <ChevronRight size={16} strokeWidth={1.5} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!salariesLoading && salaries.length > 0 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
          hasNextPage={page < totalPages}
          hasPrevPage={page > 1}
          maxPageButtons={5}
          showPageNumbers
          className="pt-2"
        />
      )}
    </div>
  );
};

export default TeacherSalaryPage;
