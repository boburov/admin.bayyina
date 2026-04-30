// Toast
import { toast } from "sonner";

// React
import { useState, useMemo } from "react";

// Router
import { useParams, useNavigate } from "react-router-dom";

// TanStack Query
import { useAppQuery } from "@/shared/lib/query/query-hooks";

// API
import { classesAPI }   from "@/features/classes/api/classes.api";
import { statisticsAPI } from "@/features/statistics/api/statistics.api";

// Utils
import { formatUzDate } from "@/shared/utils/formatDate";

// Data
import { monthOptions } from "@/features/payments/data/payments.data";

// Hooks
import useModal from "@/shared/hooks/useModal";

// Components
import Button                    from "@/shared/components/ui/button/Button";
import Select                    from "@/shared/components/ui/select/Select";
import TransferEnrollmentModal   from "@/features/classes/components/TransferEnrollmentModal";
import CompleteEnrollmentModal   from "@/features/classes/components/CompleteEnrollmentModal";

// Icons
import {
  ArrowLeft,
  ArrowRightLeft,
  GraduationCap,
  Users,
  CheckCircle2,
  XCircle,
} from "lucide-react";

// ─── Helper ───────────────────────────────────────────────────────────────────
const isPaidForMonth = (enrollment, selectedMonth) => {
  if (!enrollment.nextPaymentDate) return false;
  const sel  = new Date(selectedMonth);
  const next = new Date(enrollment.nextPaymentDate);
  return (
    next.getFullYear() > sel.getFullYear() ||
    (next.getFullYear() === sel.getFullYear() && next.getMonth() > sel.getMonth())
  );
};

// ─── Page ─────────────────────────────────────────────────────────────────────
const ClassDetailPage = () => {
  const { classId } = useParams();
  const navigate    = useNavigate();
  const { openModal } = useModal("transferEnrollment");
  const { openModal: openCompleteModal } = useModal("completeEnrollment");

  const [selectedMonth, setSelectedMonth] = useState(monthOptions[0].value);

  // Group info + enrollments
  const { data: groupData, isLoading: groupLoading } = useAppQuery({
    queryKey: ["group-detail", classId],
    queryFn:  () => classesAPI.getOne(classId),
    enabled:  !!classId,
    onError:  () => toast.error("Guruh ma'lumotlari yuklanmadi"),
  });

  // Attendance rankings
  const { data: rankingsData, isLoading: rankingsLoading } = useAppQuery({
    queryKey: ["class-rankings", classId],
    queryFn:  () => statisticsAPI.getClassRankings(classId, { page: 1, limit: 200 }),
    enabled:  !!classId,
    onError:  () => toast.error("Davomat ma'lumotlari yuklanmadi"),
  });

  const group       = groupData?.group       ?? null;
  const enrollments = groupData?.enrollments ?? [];
  const rankings    = rankingsData?.data?.rankings ?? [];

  // Merge enrollments + rankings by student._id
  const rows = useMemo(() => {
    const rankMap = {};
    rankings.forEach((r) => { rankMap[r.student._id] = r; });

    return enrollments.map((enrollment) => ({
      enrollment,
      rank: rankMap[enrollment.student._id] ?? null,
      paid: isPaidForMonth(enrollment, selectedMonth),
    }));
  }, [enrollments, rankings, selectedMonth]);

  const stats = useMemo(() => ({
    total:  rows.length,
    paid:   rows.filter((r) =>  r.paid).length,
    unpaid: rows.filter((r) => !r.paid).length,
  }), [rows]);

  if (groupLoading) {
    return <div className="text-center py-12 text-sm text-gray-400">Yuklanmoqda...</div>;
  }

  if (!group) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 mb-4">Guruh topilmadi</p>
        <Button onClick={() => navigate("/classes")}>Orqaga</Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="flex items-center gap-1.5">
          <Button variant="ghost" onClick={() => navigate("/classes")}>
            <ArrowLeft strokeWidth={1.5} />
          </Button>
          <h1 className="page-title">{group.name}</h1>
        </div>

      </div>

      {/* Filters + stats */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="w-48">
          <Select
            value={selectedMonth}
            options={monthOptions}
            onChange={setSelectedMonth}
            placeholder="Oy tanlang"
          />
        </div>

        {enrollments.length > 0 && (
          <div className="flex items-center gap-4 sm:ml-auto text-xs text-gray-400">
            <span>
              Jami: <strong className="text-gray-700">{stats.total}</strong>
            </span>
            <span className="text-green-600">
              To'lagan: <strong>{stats.paid}</strong>
            </span>
            <span className="text-red-500">
              To'lamagan: <strong>{stats.unpaid}</strong>
            </span>
          </div>
        )}
      </div>

      {/* Empty state */}
      {enrollments.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-16 text-gray-400">
          <Users className="size-10 opacity-30" strokeWidth={1.5} />
          <p className="text-sm">Bu guruhda o'quvchilar yo'q</p>
        </div>
      )}

      {/* Table */}
      {enrollments.length > 0 && (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>F.I.O</th>
                <th>Telefon</th>
                <th>Davomat</th>
                <th>Oylik to'lov</th>
                <th>So'nggi to'lov</th>
                <th>Qarz / Balans</th>
                <th>Holat</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rankingsLoading ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-sm text-gray-400">
                    Yuklanmoqda...
                  </td>
                </tr>
              ) : (
                rows.map(({ enrollment, rank, paid }, idx) => {
                  const s      = enrollment.student;
                  const score  = rank?.totalSum    ?? null;
                  const grades = rank?.totalGrades ?? null;

                  return (
                    <tr key={enrollment._id} className={paid ? "" : "bg-red-50/40"}>
                      {/* # */}
                      <td className="text-center text-sm text-gray-400">{idx + 1}</td>

                      {/* F.I.O */}
                      <td className="text-sm font-medium text-gray-900 whitespace-nowrap">
                        {s.firstName} {s.lastName}
                      </td>

                      {/* Telefon */}
                      <td className="text-center text-sm text-gray-400 whitespace-nowrap">
                        +{s.phone}
                      </td>

                      {/* Davomat */}
                      <td className="text-center">
                        {score !== null ? (
                          <span className={`text-sm font-semibold ${
                            score >= 45 ? "text-green-600" :
                            score >= 35 ? "text-blue-600"  : "text-orange-500"
                          }`}>
                            {score}
                            {grades !== null && (
                              <span className="text-xs font-normal text-gray-400 ml-1">
                                ({grades} baho)
                              </span>
                            )}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-300">—</span>
                        )}
                      </td>

                      {/* Oylik to'lov */}
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
                        {enrollment.lastPaymentDate
                          ? formatUzDate(enrollment.lastPaymentDate)
                          : "—"}
                      </td>

                      {/* Qarz / Balans */}
                      <td className="text-center text-sm whitespace-nowrap">
                        {enrollment.debt > 0 ? (
                          <span className="text-red-600 font-medium">
                            -{enrollment.debt.toLocaleString()} so'm
                          </span>
                        ) : enrollment.balance > 0 ? (
                          <span className="text-blue-600 font-medium">
                            +{enrollment.balance.toLocaleString()} so'm
                          </span>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>

                      {/* Holat */}
                      <td className="text-center">
                        {enrollment.status === "completed" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-700">
                            <GraduationCap className="size-3" strokeWidth={2} />
                            Tugallangan
                          </span>
                        ) : enrollment.status === "dropped" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-500">
                            Tashlab ketilgan
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-blue-50 text-blue-700">
                            Faol
                          </span>
                        )}
                      </td>

                      {/* Amallar */}
                      <td className="text-center">
                        {enrollment.status === "active" && (
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              title="Kursni tugatdi deb belgilash"
                              className="p-1.5 rounded hover:bg-green-50 text-gray-400 hover:text-green-600 transition-colors"
                              onClick={() =>
                                openCompleteModal("completeEnrollment", {
                                  enrollmentId: enrollment._id,
                                  studentName:  `${s.firstName} ${s.lastName}`,
                                  groupName:    group.name,
                                })
                              }
                            >
                              <GraduationCap className="size-4" strokeWidth={1.5} />
                            </button>
                            <button
                              type="button"
                              title="Boshqa guruhga o'tkazish"
                              className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                              onClick={() =>
                                openModal("transferEnrollment", {
                                  enrollmentId:   enrollment._id,
                                  studentId:      s._id,
                                  studentName:    `${s.firstName} ${s.lastName}`,
                                  currentGroupId: classId,
                                  discount:       enrollment.discount,
                                  discountReason: enrollment.discountReason,
                                  paymentDay:     enrollment.paymentDay,
                                  debt:           enrollment.debt,
                                  balance:        enrollment.balance,
                                })
                              }
                            >
                              <ArrowRightLeft className="size-4" strokeWidth={1.5} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      <TransferEnrollmentModal />
      <CompleteEnrollmentModal />
    </div>
  );
};

export default ClassDetailPage;
