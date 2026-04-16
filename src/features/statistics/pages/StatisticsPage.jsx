// Toast
import { toast } from "sonner";

// React
import { useState, useEffect, useCallback, useRef, useMemo } from "react";

// Router
import { useSearchParams } from "react-router-dom";

// TanStack Query
import { useQuery } from "@tanstack/react-query";
import { useAppQuery } from "@/shared/lib/query/query-hooks";

// API
import { statisticsAPI } from "@/features/statistics/api/statistics.api";
import { classesAPI } from "@/features/classes/api/classes.api";
import { usersAPI } from "@/features/users/api/users.api";

// Utils
import { cn } from "@/shared/utils/cn";
import { formatUzDate } from "@/shared/utils/formatDate";

// Data
import { monthOptions, formatMonthLabel } from "@/features/payments/data/payments.data";

// Hooks
import useModal from "@/shared/hooks/useModal";

// Components
import Card from "@/shared/components/ui/Card";
import Select from "@/shared/components/form/select";
import Button from "@/shared/components/ui/button/Button";
import Pagination from "@/shared/components/ui/Pagination";

// Icons
import {
  Users,
  GraduationCap,
  Eye,
  School,
  Download,
  CheckCircle2,
  XCircle,
  TrendingDown,
  Wallet,
  User,
  Clock,
} from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const isPaidForMonth = (enrollment, selectedMonth) => {
  if (!enrollment.nextPaymentDate) return false;
  const sel  = new Date(selectedMonth);
  const next = new Date(enrollment.nextPaymentDate);
  return (
    next.getFullYear() > sel.getFullYear() ||
    (next.getFullYear() === sel.getFullYear() && next.getMonth() > sel.getMonth())
  );
};

const daysMap = {
  monday:    "Du",
  tuesday:   "Se",
  wednesday: "Cho",
  thursday:  "Pa",
  friday:    "Ju",
  saturday:  "Sha",
  sunday:    "Ya",
};

// ─── Stat card ────────────────────────────────────────────────────────────────
const colorMap = {
  blue:   { bg: "bg-blue-50",   icon: "text-blue-500",   val: "text-blue-700"   },
  green:  { bg: "bg-green-50",  icon: "text-green-500",  val: "text-green-700"  },
  red:    { bg: "bg-red-50",    icon: "text-red-500",    val: "text-red-700"    },
  orange: { bg: "bg-orange-50", icon: "text-orange-500", val: "text-orange-700" },
  purple: { bg: "bg-purple-50", icon: "text-purple-500", val: "text-purple-700" },
  brown:  { bg: "bg-[#fdf8f5]", icon: "text-[#7c5c3e]",  val: "text-[#7c5c3e]"  },
};

const StatCard = ({ label, value, icon, color = "blue", small = false }) => {
  const c = colorMap[color];
  return (
    <Card className="flex items-center gap-3">
      <div className={`${c.bg} ${c.icon} p-2.5 shrink-0`}>{icon}</div>
      <div className="min-w-0">
        <p className="text-xs text-gray-400 truncate">{label}</p>
        <p className={`font-bold truncate ${small ? "text-sm" : "text-xl"} ${c.val}`}>{value}</p>
      </div>
    </Card>
  );
};

// ─── Tab bar ──────────────────────────────────────────────────────────────────
const tabs = [
  { value: "davomat",    label: "Davomat"     },
  { value: "tolov",      label: "To'lovlar"   },
  { value: "oquvchilar", label: "O'quvchilar" },
];

const TabBar = ({ active, onChange }) => (
  <div className="flex border-b border-border mb-5">
    {tabs.map((t) => (
      <button
        key={t.value}
        onClick={() => onChange(t.value)}
        className={cn(
          "px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px",
          active === t.value
            ? "border-[#7c5c3e] text-[#7c5c3e]"
            : "border-transparent text-gray-500 hover:text-gray-900",
        )}
      >
        {t.label}
      </button>
    ))}
  </div>
);

// ─── Page ─────────────────────────────────────────────────────────────────────
const Statistics = () => {
  const [activeTab, setActiveTab] = useState("davomat");

  return (
    <div>
      <div className="mb-5 pb-4 border-b border-border">
        <h1 className="page-title">Statistika</h1>
      </div>

      <TabBar active={activeTab} onChange={setActiveTab} />

      {activeTab === "davomat"    && <DavomatTab />}
      {activeTab === "tolov"      && <TolovTab />}
      {activeTab === "oquvchilar" && <OquvchilarTab />}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 1 — DAVOMAT (mavjud kontent)
// ═══════════════════════════════════════════════════════════════════════════════
const DavomatTab = () => {
  const { openModal } = useModal();
  const contentRef = useRef(null);

  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get("page") || "1", 10);

  const [classes,       setClasses]       = useState([]);
  const [rankings,      setRankings]      = useState([]);
  const [isLoading,     setIsLoading]     = useState(false);
  const [viewMode,      setViewMode]      = useState("school");
  const [selectedClass, setSelectedClass] = useState(null);
  const [hasNextPage,   setHasNextPage]   = useState(false);
  const [hasPrevPage,   setHasPrevPage]   = useState(false);
  const [totalPages,    setTotalPages]    = useState(1);

  useEffect(() => {
    classesAPI
      .getAll()
      .then((res) => {
        const groups = res.data.groups || [];
        setClasses(groups);
        if (groups.length > 0) setSelectedClass(groups[0]._id);
      })
      .catch(() => toast.error("Guruhlarni yuklashda xatolik"));
  }, []);

  const fetchRankings = useCallback(() => {
    setIsLoading(true);
    const params  = { page: currentPage, limit: 50 };
    const apiCall =
      viewMode === "school"
        ? statisticsAPI.getSchoolRankings(params)
        : statisticsAPI.getClassRankings(selectedClass, params);

    apiCall
      .then((res) => {
        if (!res.data.success) return;
        setRankings(res.data.data.rankings || []);
        if (res.data.pagination) {
          setHasNextPage(res.data.pagination.hasNextPage);
          setHasPrevPage(res.data.pagination.hasPrevPage);
          setTotalPages(res.data.pagination.totalPages);
        }
      })
      .catch((err) =>
        toast.error(err.response?.data?.message || "Reytinglarni yuklashda xatolik"),
      )
      .finally(() => setIsLoading(false));
  }, [viewMode, selectedClass, currentPage]);

  const goToPage = useCallback(
    (page) => {
      if (page < 1) return;
      const params = new URLSearchParams(searchParams);
      params.set("page", page.toString());
      setSearchParams(params);
    },
    [searchParams, setSearchParams],
  );

  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    params.set("page", "1");
    setSearchParams(params);
  }, [viewMode, selectedClass]);

  useEffect(() => {
    if (viewMode === "school" || (viewMode === "class" && selectedClass)) {
      fetchRankings();
    }
  }, [viewMode, selectedClass, fetchRankings]);

  const classOptions = classes.map((c) => ({ value: c._id, label: c.name }));

  const handleExport = async () => {
    try {
      const params =
        viewMode === "class"
          ? { type: "class", classId: selectedClass }
          : { type: "school" };
      const response = await statisticsAPI.export(params);
      const url  = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href  = url;
      link.setAttribute(
        "download",
        viewMode === "class"
          ? `haftalik_reyting_sinf_${new Date().toISOString().split("T")[0]}.xlsx`
          : `haftalik_reyting_maktab_${new Date().toISOString().split("T")[0]}.xlsx`,
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error("Excel yuklab olishda xatolik");
    }
  };

  const getRankColor = (rank) => {
    if (rank === 1) return "bg-yellow-100 text-yellow-800 border-yellow-300";
    if (rank === 2) return "bg-gray-100 text-gray-800 border-gray-300";
    if (rank === 3) return "bg-orange-100 text-orange-800 border-orange-300";
    return "bg-blue-50 text-blue-700 border-blue-200";
  };

  return (
    <div>
      {/* Controls */}
      <Card className="mb-5">
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-2">Ko'rinish</label>
            <div className="flex gap-4">
              <Button className="w-full" onClick={() => setViewMode("school")}
                variant={viewMode === "school" ? "default" : "secondary"}>
                <School /> Maktab bo'yicha
              </Button>
              <Button className="w-full" onClick={() => setViewMode("class")}
                variant={viewMode === "class" ? "default" : "secondary"}>
                <Users /> Sinf bo'yicha
              </Button>
            </div>
          </div>
          {viewMode === "class" && (
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-2">Sinf tanlang</label>
              <Select value={selectedClass} onChange={setSelectedClass}
                options={classOptions} placeholder="Sinfni tanlang" />
            </div>
          )}
        </div>
      </Card>

      {/* Table */}
      <div ref={contentRef}>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7c5c3e]" />
          </div>
        ) : rankings.length === 0 ? (
          <div className="text-center py-12">
            <GraduationCap className="w-16 h-16 text-gray-300 mx-auto mb-4" strokeWidth={1} />
            <p className="text-gray-500">Joriy haftada hech qanday natija topilmadi</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>O'rin</th>
                  <th>O'quvchi</th>
                  {viewMode === "school" && <th>Guruhlar</th>}
                  <th>Umumiy ball</th>
                  <th>Baholar soni</th>
                  <th>Batafsil</th>
                </tr>
              </thead>
              <tbody>
                {rankings.map((item) => (
                  <tr key={item.student._id}>
                    <td className="text-center">
                      <div className={cn(
                        "inline-flex items-center justify-center min-h-7 min-w-7 px-1.5 rounded-full border text-sm font-semibold",
                        getRankColor(item.rank),
                      )}>
                        {item.rank}
                      </div>
                    </td>
                    <td className="text-sm font-medium whitespace-nowrap">
                      {item.student.fullName}
                    </td>
                    {viewMode === "school" && (
                      <td className="text-sm text-gray-500">
                        {item.classes?.map((c) => c.name).join(", ") || "—"}
                      </td>
                    )}
                    <td className="text-center">
                      <span className={`font-semibold text-sm ${
                        item.totalSum >= 45 ? "text-green-600" :
                        item.totalSum >= 35 ? "text-blue-600"  : "text-orange-500"
                      }`}>
                        {item.totalSum}
                      </span>
                    </td>
                    <td className="text-center text-sm text-gray-600">{item.totalGrades}</td>
                    <td className="text-center">
                      <button
                        onClick={() => openModal("studentStats", { studentId: item.student._id })}
                        className="text-gray-400 hover:text-[#7c5c3e] transition-colors"
                      >
                        <Eye className="size-4" strokeWidth={1.5} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!isLoading && rankings.length > 0 && (
          <Pagination contentRef={contentRef} maxPageButtons={5} showPageNumbers
            onPageChange={goToPage} currentPage={currentPage}
            hasNextPage={hasNextPage} hasPrevPage={hasPrevPage}
            totalPages={totalPages} className="pt-5" />
        )}
      </div>

      {/* Legend + export */}
      <Card className="flex flex-wrap items-center gap-5 text-sm mt-5">
        <LegendDot color="bg-green-500"  label="45+" desc="A'lo" />
        <LegendDot color="bg-blue-500"   label="35–44" desc="Yaxshi" />
        <LegendDot color="bg-orange-500" label="35 dan past" desc="Qoniqarli" />
        <Button className="ml-auto" onClick={handleExport}
          disabled={isLoading || (viewMode === "class" && !selectedClass)}>
          <Download /> Yuklab olish
        </Button>
      </Card>
    </div>
  );
};

const LegendDot = ({ color, label, desc }) => (
  <div className="flex items-center gap-2">
    <div className={`w-3 h-3 rounded-full ${color}`} />
    <span className="text-gray-700"><strong>{label}</strong> — {desc}</span>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 2 — TO'LOVLAR
// ═══════════════════════════════════════════════════════════════════════════════
const TolovTab = () => {
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(monthOptions[0].value);

  const { data: groupsData, isLoading: groupsLoading } = useQuery({
    queryKey: ["admin-groups"],
    queryFn:  () => classesAPI.getAll().then((res) => res.data),
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
  const groupOptions = groups.map((g) => ({ value: g._id, label: g.name }));

  const rows = useMemo(() => {
    return enrollments.map((e) => ({
      enrollment: e,
      paid: isPaidForMonth(e, selectedMonth),
    }));
  }, [enrollments, selectedMonth]);

  const stats = useMemo(() => {
    const paid         = rows.filter((r) =>  r.paid);
    const unpaid       = rows.filter((r) => !r.paid);
    const totalDebt    = enrollments.reduce((s, e) => s + (e.debt    ?? 0), 0);
    const totalBalance = enrollments.reduce((s, e) => s + (e.balance ?? 0), 0);
    return { total: rows.length, paid: paid.length, unpaid: unpaid.length, totalDebt, totalBalance };
  }, [rows, enrollments]);

  const isLoading = enrollmentsLoading && !!selectedGroup;

  return (
    <div className="space-y-5">
      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="w-full sm:w-60">
          <Select size="md" value={selectedGroup}
            onChange={(v) => setSelectedGroup(v)}
            options={groupOptions} isLoading={groupsLoading}
            placeholder="Guruh tanlang" />
        </div>
        <div className="w-full sm:w-48">
          <Select size="md" value={selectedMonth}
            onChange={setSelectedMonth}
            options={monthOptions} placeholder="Oy tanlang" />
        </div>
      </div>

      {/* Stats cards */}
      {selectedGroup && !isLoading && (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 xl:grid-cols-5">
          <StatCard label="Jami o'quvchi" value={stats.total} color="blue"
            icon={<Users className="size-5" strokeWidth={1.5} />} />
          <StatCard label="To'lagan" value={stats.paid} color="green"
            icon={<CheckCircle2 className="size-5" strokeWidth={1.5} />} />
          <StatCard label="To'lamagan" value={stats.unpaid} color="red"
            icon={<XCircle className="size-5" strokeWidth={1.5} />} />
          <StatCard label="Jami qarz"
            value={stats.totalDebt > 0 ? `${stats.totalDebt.toLocaleString()} so'm` : "0"}
            color="orange" small
            icon={<TrendingDown className="size-5" strokeWidth={1.5} />} />
          <StatCard label="Jami balans"
            value={stats.totalBalance > 0 ? `${stats.totalBalance.toLocaleString()} so'm` : "0"}
            color="purple" small
            icon={<Wallet className="size-5" strokeWidth={1.5} />} />
        </div>
      )}

      {/* Content */}
      {!selectedGroup ? (
        <EmptyState icon={<Users className="size-10 opacity-30" strokeWidth={1.5} />}
          text="Guruhni tanlang" />
      ) : isLoading ? (
        <div className="text-center py-12 text-sm text-gray-400">Yuklanmoqda...</div>
      ) : enrollments.length === 0 ? (
        <EmptyState icon={<Users className="size-10 opacity-30" strokeWidth={1.5} />}
          text="Bu guruhda o'quvchilar yo'q" />
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

          <div className="table-wrapper">
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
                </tr>
              </thead>
              <tbody>
                {rows.map(({ enrollment, paid }, idx) => {
                  const s = enrollment.student;
                  return (
                    <tr key={enrollment._id} className={paid ? "" : "bg-red-50/40"}>
                      <td className="text-center text-sm text-gray-400">{idx + 1}</td>
                      <td className="text-sm font-medium text-gray-900 whitespace-nowrap">
                        {s.firstName} {s.lastName}
                      </td>
                      <td className="text-center text-sm text-gray-400 whitespace-nowrap">
                        +{s.phone}
                      </td>
                      <td className="text-center">
                        {paid ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-700">
                            <CheckCircle2 className="size-3" strokeWidth={2} /> To'lagan
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-600">
                            <XCircle className="size-3" strokeWidth={2} /> To'lanmagan
                          </span>
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
                        ) : <span className="text-gray-300">—</span>}
                      </td>
                      <td className="text-center text-sm whitespace-nowrap">
                        {enrollment.balance > 0 ? (
                          <span className="text-blue-600 font-medium">
                            {enrollment.balance.toLocaleString()} so'm
                          </span>
                        ) : <span className="text-gray-300">—</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Footer summary */}
          <div className="flex flex-wrap gap-4 mt-3 px-1 text-xs text-gray-400">
            <span>Jami: <strong className="text-gray-700">{stats.total}</strong> o'quvchi</span>
            <span className="text-green-600">To'lagan: <strong>{stats.paid}</strong></span>
            <span className="text-red-500">To'lamagan: <strong>{stats.unpaid}</strong></span>
            {stats.totalDebt > 0 && (
              <span className="text-orange-500">
                Jami qarz: <strong>{stats.totalDebt.toLocaleString()} so'm</strong>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 3 — O'QUVCHILAR
// ═══════════════════════════════════════════════════════════════════════════════
const OquvchilarTab = () => {
  const { data: studentsData, isLoading: studentsLoading } = useQuery({
    queryKey: ["users", "stats", "students"],
    queryFn:  () => usersAPI.getStudents({ limit: 1 }).then((res) => res.data),
  });

  const { data: teachersData, isLoading: teachersLoading } = useQuery({
    queryKey: ["users", "stats", "teachers"],
    queryFn:  () => usersAPI.getTeachers({ limit: 1 }).then((res) => res.data),
  });

  const { data: groupsData, isLoading: groupsLoading } = useQuery({
    queryKey: ["admin-groups"],
    queryFn:  () => classesAPI.getAll().then((res) => res.data),
  });

  const groups = groupsData?.groups ?? [];

  const isLoading = studentsLoading || teachersLoading || groupsLoading;

  return (
    <div className="space-y-5">
      {/* Top stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatCard label="Jami o'quvchilar"
          value={studentsLoading ? "..." : (studentsData?.total ?? 0)}
          color="brown"
          icon={<GraduationCap className="size-5" strokeWidth={1.5} />} />
        <StatCard label="Jami o'qituvchilar"
          value={teachersLoading ? "..." : (teachersData?.total ?? 0)}
          color="blue"
          icon={<User className="size-5" strokeWidth={1.5} />} />
        <StatCard label="Jami guruhlar"
          value={groupsLoading ? "..." : groups.length}
          color="green"
          icon={<School className="size-5" strokeWidth={1.5} />} />
      </div>

      {/* Groups table */}
      {isLoading ? (
        <div className="text-center py-12 text-sm text-gray-400">Yuklanmoqda...</div>
      ) : groups.length === 0 ? (
        <EmptyState icon={<School className="size-10 opacity-30" strokeWidth={1.5} />}
          text="Guruhlar topilmadi" />
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Guruh nomi</th>
                <th>O'qituvchi</th>
                <th>Dars kuni</th>
                <th>Vaqt</th>
                <th>Oylik to'lov</th>
              </tr>
            </thead>
            <tbody>
              {groups.map((group, idx) => (
                <tr key={group._id}>
                  <td className="text-center text-sm text-gray-400">{idx + 1}</td>
                  <td className="text-sm font-medium text-gray-900">{group.name}</td>
                  <td className="text-sm text-gray-500 whitespace-nowrap">
                    {group.teacher
                      ? `${group.teacher.firstName} ${group.teacher.lastName ?? ""}`.trim()
                      : "—"}
                  </td>
                  <td className="text-center">
                    {group.schedule?.days?.length > 0 ? (
                      <div className="flex flex-wrap gap-1 justify-center">
                        {group.schedule.days.map((d) => (
                          <span key={d}
                            className="px-1.5 py-0.5 text-xs border border-stone-200 text-stone-500 bg-stone-50">
                            {daysMap[d] ?? d}
                          </span>
                        ))}
                      </div>
                    ) : "—"}
                  </td>
                  <td className="text-center text-sm text-gray-500">
                    <div className="flex items-center justify-center gap-1">
                      <Clock className="size-3.5 text-gray-400" strokeWidth={1.5} />
                      {group.schedule?.time ?? "—"}
                    </div>
                  </td>
                  <td className="text-center text-sm font-semibold text-gray-800 whitespace-nowrap">
                    {group.price > 0
                      ? `${Number(group.price).toLocaleString()} so'm`
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// ─── Shared ───────────────────────────────────────────────────────────────────
const EmptyState = ({ icon, text }) => (
  <div className="flex flex-col items-center gap-2 py-16 text-gray-400">
    {icon}
    <p className="text-sm">{text}</p>
  </div>
);

export default Statistics;
