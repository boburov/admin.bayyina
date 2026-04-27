// Toast
import { toast } from "sonner";

// React
import { useState, useMemo, useCallback, useEffect, useRef } from "react";

// API
import { classesAPI } from "@/features/classes/api/classes.api";
import { paymentsAPI } from "@/features/payments/api/payments.api";

// Components
import SetDiscountModal from "@/features/payments/components/SetDiscountModal";

// TanStack Query
import { useAppQuery } from "@/shared/lib/query/query-hooks";
import { useQuery } from "@tanstack/react-query";

// Router
import { useSearchParams } from "react-router-dom";

// Hooks
import useModal from "@/shared/hooks/useModal";

// Data
import {
  monthOptions,
  formatMonthLabel,
  PAYMENT_STATUS_OPTIONS,
} from "@/features/payments/data/payments.data";

// Utils
import { formatUzDate } from "@/shared/utils/formatDate";

// Components
import Card from "@/shared/components/ui/Card";
import Select from "@/shared/components/form/select";
import Button from "@/shared/components/ui/button/Button";
import Pagination from "@/shared/components/ui/Pagination";
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
  X,
  Receipt,
  Tag,
} from "lucide-react";

// ─── Helper ──────────────────────────────────────────────────────────────────
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
  const [searchParams, setSearchParams] = useSearchParams();

  const activeTab = searchParams.get("tab") || "enrollments";

  const switchTab = (tab) => {
    setSearchParams({ tab, page: "1" });
  };

  return (
    <div className="space-y-5">
      <h1 className="page-title">To'lovlar</h1>

      {/* Tab switcher */}
      <div className="flex gap-1 border-b border-border">
        <button
          onClick={() => switchTab("enrollments")}
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
            activeTab === "enrollments"
              ? "border-gray-900 text-gray-900"
              : "border-transparent text-gray-400 hover:text-gray-600"
          }`}
        >
          Guruh bo'yicha
        </button>
        <button
          onClick={() => switchTab("records")}
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
            activeTab === "records"
              ? "border-gray-900 text-gray-900"
              : "border-transparent text-gray-400 hover:text-gray-600"
          }`}
        >
          To'lov tarixi
        </button>
      </div>

      {activeTab === "enrollments" ? (
        <EnrollmentsTab />
      ) : (
        <RecordsTab />
      )}

      <CreatePaymentModal />
      <SetDiscountModal />
    </div>
  );
};

// ─── Enrollments Tab ─────────────────────────────────────────────────────────

const EnrollmentsTab = () => {
  const { openModal } = useModal();

  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(monthOptions[0].value);
  const [search, setSearch]               = useState("");

  const { data: groupsData, isLoading: groupsLoading } = useAppQuery({
    queryKey: ["admin-groups"],
    queryFn:  () => classesAPI.getAll({ limit: 200 }),
    onError:  () => toast.error("Guruhlar yuklanmadi"),
  });

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

  const stats = useMemo(() => {
    const paid         = enrollments.filter((e) =>  isPaidForMonth(e, selectedMonth));
    const unpaid       = enrollments.filter((e) => !isPaidForMonth(e, selectedMonth));
    const totalDebt    = enrollments.reduce((s, e) => s + (e.debt    ?? 0), 0);
    const totalBalance = enrollments.reduce((s, e) => s + (e.balance ?? 0), 0);
    return { total: enrollments.length, paid: paid.length, unpaid: unpaid.length, totalDebt, totalBalance };
  }, [enrollments, selectedMonth]);

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
    const defaultAmount = Math.max(0, price - discount);
    openModal("createPayment", {
      enrollmentId:  enrollment._id,
      studentId:     enrollment.student._id,
      studentName:   `${enrollment.student.firstName} ${enrollment.student.lastName}`,
      studentPhone:  enrollment.student.phone,
      month:         selectedMonth,
      defaultAmount,
    });
  };

  const handleOpenDiscount = (enrollment) => {
    const s = enrollment.student;
    openModal("setEnrollmentDiscount", {
      enrollmentId:          enrollment._id,
      studentName:           `${s.firstName} ${s.lastName}`,
      groupName:             groupInfo?.name ?? "",
      currentDiscount:       enrollment.discount ?? 0,
      currentDiscountReason: enrollment.discountReason ?? "",
    });
  };

  return (
    <>
      {/* Filters */}
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

      {/* Stats */}
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

      {/* Content */}
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
                  <th>Chegirma</th>
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
                    <td colSpan={10} className="py-10 text-center text-sm text-gray-400">
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
                        <td className="text-center text-sm whitespace-nowrap">
                          {enrollment.discount > 0 ? (
                            <span className="text-purple-600 font-medium">
                              -{enrollment.discount.toLocaleString()} so'm
                            </span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="text-center text-sm text-gray-400 whitespace-nowrap">
                          {enrollment.lastPaymentDate ? formatUzDate(enrollment.lastPaymentDate) : "—"}
                        </td>
                        <td className="text-center text-sm whitespace-nowrap">
                          {enrollment.nextPaymentDate ? (
                            <span className={paid ? "text-gray-400" : "text-orange-600 font-medium"}>
                              {formatUzDate(enrollment.nextPaymentDate)}
                            </span>
                          ) : "—"}
                        </td>
                        <td className="text-center text-sm whitespace-nowrap">
                          {enrollment.debt > 0 ? (
                            <span className="text-red-600 font-medium">
                              {enrollment.debt.toLocaleString()} so'm
                            </span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="text-center text-sm whitespace-nowrap">
                          {enrollment.balance > 0 ? (
                            <span className="text-blue-600 font-medium">
                              {enrollment.balance.toLocaleString()} so'm
                            </span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="text-center">
                          <div className="flex items-center justify-center gap-1.5">
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
                            <button
                              type="button"
                              title="Chegirma o'rnatish"
                              onClick={() => handleOpenDiscount(enrollment)}
                              className="p-1.5 text-muted-foreground hover:text-purple-600 transition-colors"
                            >
                              <Tag className="size-3.5" strokeWidth={1.5} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

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
    </>
  );
};

// ─── Records Tab ─────────────────────────────────────────────────────────────

const RecordsTab = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  const qParam      = searchParams.get("q") || "";
  const statusParam = searchParams.get("status") || "";
  const monthParam  = searchParams.get("month") || "";

  const [inputQ, setInputQ] = useState(qParam);

  // always use latest searchParams inside the debounce callback
  const searchParamsRef = useRef(searchParams);
  useEffect(() => { searchParamsRef.current = searchParams; }, [searchParams]);

  // skip the initial render so mount doesn't push a redundant history entry
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const id = setTimeout(() => {
      const params = new URLSearchParams(searchParamsRef.current);
      if (inputQ) {
        params.set("q", inputQ);
      } else {
        params.delete("q");
      }
      params.set("page", "1");
      setSearchParams(params, { replace: true });
    }, 400);
    return () => clearTimeout(id);
  }, [inputQ, setSearchParams]);

  const setFilter = useCallback(
    (key, value) => {
      const params = new URLSearchParams(searchParams);
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.set("page", "1");
      setSearchParams(params);
    },
    [searchParams, setSearchParams],
  );

  const hasFilters = qParam || statusParam || monthParam;

  const resetFilters = useCallback(() => {
    setInputQ("");
    setSearchParams({ tab: "records", page: "1" });
  }, [setSearchParams]);

  const goToPage = useCallback(
    (page) => {
      if (page < 1) return;
      const params = new URLSearchParams(searchParams);
      params.set("page", page.toString());
      setSearchParams(params);
    },
    [searchParams, setSearchParams],
  );

  const queryParams = {
    page: currentPage,
    limit: 20,
    ...(qParam      && { q: qParam }),
    ...(statusParam && { status: statusParam }),
    ...(monthParam  && { month: monthParam }),
  };

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["payments", "search", queryParams],
    queryFn: () => paymentsAPI.search(queryParams).then((res) => res.data),
    keepPreviousData: true,
    onError: () => toast.error("To'lovlar yuklanmadi"),
  });

  const payments = data?.payments ?? [];

  const monthFilterOptions = monthOptions.map((o) => ({
    value: o.value.slice(0, 7),
    label: o.label,
  }));

  return (
    <>
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={inputQ}
            onChange={(e) => setInputQ(e.target.value)}
            placeholder="O'quvchi ismi, izoh, miqdor..."
            className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-gray-300"
          />
        </div>

        <select
          value={statusParam}
          onChange={(e) => setFilter("status", e.target.value)}
          className="py-2 px-3 text-sm border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-gray-300"
        >
          <option value="">Barcha holat</option>
          {PAYMENT_STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        <select
          value={monthParam}
          onChange={(e) => setFilter("month", e.target.value)}
          className="py-2 px-3 text-sm border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-gray-300"
        >
          <option value="">Barcha oy</option>
          {monthFilterOptions.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        {hasFilters && (
          <button
            onClick={resetFilters}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800 border border-gray-200 rounded-md px-2 py-2"
          >
            <X size={12} />
            Tozalash
          </button>
        )}
      </div>

      {/* Table */}
      <div className={`rounded-lg overflow-x-auto border border-border bg-white transition-opacity ${isFetching ? "opacity-60 pointer-events-none" : "opacity-100"}`}>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>O'quvchi</th>
              <th>Telefon</th>
              <th>Miqdor</th>
              <th>Holat</th>
              <th>Oy</th>
              <th>Sana</th>
              <th>Izoh</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-sm text-gray-400">
                  Yuklanmoqda...
                </td>
              </tr>
            ) : payments.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-2 text-gray-400">
                    <Receipt className="size-10 opacity-30" strokeWidth={1.5} />
                    <p className="text-sm">To'lovlar topilmadi</p>
                  </div>
                </td>
              </tr>
            ) : (
              payments.map((payment, idx) => {
                const s = payment.student;
                return (
                  <tr key={payment._id}>
                    <td className="text-center text-sm text-gray-400">
                      {(currentPage - 1) * 20 + idx + 1}
                    </td>
                    <td className="text-sm font-medium text-primary whitespace-nowrap">
                      {s ? `${s.firstName} ${s.lastName}` : "—"}
                    </td>
                    <td className="text-center text-sm text-gray-500 whitespace-nowrap">
                      {s?.phone ? `+${s.phone}` : "—"}
                    </td>
                    <td className="text-center text-sm font-medium text-gray-900 whitespace-nowrap">
                      {payment.amount?.toLocaleString()} so'm
                    </td>
                    <td className="text-center">
                      <PaymentStatusBadge status={payment.status} />
                    </td>
                    <td className="text-center text-sm text-gray-500 whitespace-nowrap">
                      {payment.month ?? "—"}
                    </td>
                    <td className="text-center text-sm text-gray-500 whitespace-nowrap">
                      {payment.paidAt ? formatUzDate(payment.paidAt) : "—"}
                    </td>
                    <td className="text-sm text-gray-400 max-w-[160px] truncate">
                      {payment.note ?? "—"}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {!isLoading && payments.length > 0 && (
        <>
          <Pagination
            maxPageButtons={5}
            showPageNumbers={true}
            onPageChange={goToPage}
            currentPage={currentPage}
            hasNextPage={data?.hasNextPage}
            hasPrevPage={data?.hasPrevPage}
            className="pt-5 max-md:hidden"
            totalPages={data?.totalPages || 1}
          />
          <div className="overflow-x-auto pb-1.5">
            <Pagination
              maxPageButtons={5}
              showPageNumbers={true}
              onPageChange={goToPage}
              currentPage={currentPage}
              hasNextPage={data?.hasNextPage}
              hasPrevPage={data?.hasPrevPage}
              className="pt-5 min-w-max md:hidden"
              totalPages={data?.totalPages || 1}
            />
          </div>
        </>
      )}
    </>
  );
};

// ─── Payment Status Badge ─────────────────────────────────────────────────────

const statusConfig = {
  paid:    { label: "To'langan",      className: "bg-green-100 text-green-700"   },
  pending: { label: "Kutilmoqda",     className: "bg-yellow-100 text-yellow-700" },
  overdue: { label: "Muddati o'tgan", className: "bg-red-100 text-red-600"       },
};

const PaymentStatusBadge = ({ status }) => {
  const cfg = statusConfig[status] ?? { label: status, className: "bg-gray-100 text-gray-600" };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${cfg.className}`}>
      {cfg.label}
    </span>
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
