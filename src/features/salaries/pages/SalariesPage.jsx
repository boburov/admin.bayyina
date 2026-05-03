import { toast } from "sonner";
import { useState } from "react";
import { salariesAPI } from "@/features/salaries/api/salaries.api";
import { usersAPI } from "@/features/users/api/users.api";
import {
  salariesKeys,
  monthOptions,
  statusOptions,
  formatMonthLabel,
} from "@/features/salaries/data/salaries.data";
import { useAppQuery, useAppMutation } from "@/shared/lib/query/query-hooks";
import { useQueryClient } from "@tanstack/react-query";
import useModal from "@/shared/hooks/useModal";
import Card from "@/shared/components/ui/Card";
import Button from "@/shared/components/ui/button/Button";
import Select from "@/shared/components/form/select";
import Pagination from "@/shared/components/ui/Pagination";
import InputField from "@/shared/components/ui/input/InputField";
import SalaryDetailModal from "@/features/salaries/components/SalaryDetailModal";
import GenerateSalariesModal from "@/features/salaries/components/GenerateSalariesModal";
import { formatUzDate } from "@/shared/utils/formatDate";
import { formatMoney } from "@/shared/utils/formatNumber";
import {
  Wallet, RefreshCw, CheckCircle2, Clock, Banknote,
  User, X, Undo2, Trash2, TrendingUp, Minus,
} from "lucide-react";

const deductionMonthOptions = monthOptions.filter((o) => o.value !== "all");

const TABS = [
  { key: "salaries",   label: "Oyliklar"         },
  { key: "deductions", label: "Ushlab qolishlar"  },
  { key: "advances",   label: "Avanslar"          },
];

// ─── Shared teacher options hook ──────────────────────────────────────────────
function useTeacherOptions() {
  const { data } = useAppQuery({
    queryKey: ["teachers-short"],
    queryFn: () => usersAPI.getTeachers({ limit: 200 }),
    staleTime: 5 * 60 * 1000,
  });
  const teachers = data?.users ?? data?.data ?? [];
  return teachers.map((t) => ({ value: t._id, label: `${t.firstName} ${t.lastName}` }));
}

// ═══════════════════════════════════════════════════════════════════════════════
const SalariesPage = () => {
  const { openModal } = useModal();
  const [activeTab, setActiveTab] = useState("salaries");

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="page-title">Oyliklar</h1>
        <Button
          variant="outline"
          className="gap-1.5 text-sm h-9 self-start sm:self-auto"
          onClick={() => openModal("generateSalaries")}
        >
          <RefreshCw className="size-3.5" strokeWidth={1.5} />
          Hisoblash
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setActiveTab(t.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === t.key
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === "salaries"   && <SalariesTab openModal={openModal} />}
      {activeTab === "deductions" && <DeductionsTab />}
      {activeTab === "advances"   && <AdvancesTab />}

      <SalaryDetailModal />
      <GenerateSalariesModal />
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 1 — Oyliklar
// ═══════════════════════════════════════════════════════════════════════════════
const SalariesTab = ({ openModal }) => {
  const [month, setMonth] = useState("all");
  const [status, setStatus] = useState("all");
  const [teacher, setTeacher] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const teacherOptions = useTeacherOptions();

  const allTeacherOptions = [{ value: "all", label: "Barcha o'qituvchilar" }, ...teacherOptions];

  const activeMonth   = month   === "all" ? undefined : month;
  const activeStatus  = status  === "all" ? undefined : status;
  const activeTeacher = teacher === "all" ? undefined : teacher;

  const params = {
    page, limit: 20,
    ...(activeMonth   && { month:   activeMonth   }),
    ...(activeStatus  && { status:  activeStatus  }),
    ...(activeTeacher && { teacher: activeTeacher }),
  };

  const { data, isLoading, isError } = useAppQuery({
    queryKey: salariesKeys.list(params),
    queryFn: () => salariesAPI.getAll(params),
  });

  const salaries   = data?.salaries   ?? [];
  const total      = data?.total      ?? 0;
  const totalPages = data?.totalPages ?? 1;

  const payMutation = useAppMutation({
    mutationFn: (id) => salariesAPI.pay(id),
    invalidateKeys: [salariesKeys.all],
    onSuccess: () => toast.success("Oylik to'landi"),
    onError: (err) => toast.error(err.response?.data?.message ?? "Xatolik"),
  });
  const unpayMutation = useAppMutation({
    mutationFn: (id) => salariesAPI.update(id, { status: "pending", paidAt: null }),
    invalidateKeys: [salariesKeys.all],
    onSuccess: () => toast.success("Oylik qaytarildi"),
    onError: (err) => toast.error(err.response?.data?.message ?? "Xatolik"),
  });
  const bulkPayMutation = useAppMutation({
    mutationFn: (ids) => salariesAPI.bulkPay({ ids }),
    invalidateKeys: [salariesKeys.all],
    onSuccess: (res) => { toast.success(`${res?.paid ?? 0} ta oylik to'landi`); setSelectedIds(new Set()); },
    onError: (err) => toast.error(err.response?.data?.message ?? "Xatolik"),
  });

  const toggleSelect = (id) =>
    setSelectedIds((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleAll = (ids) =>
    setSelectedIds((prev) => ids.every((id) => prev.has(id)) ? new Set() : new Set(ids));

  const paidCount    = salaries.filter((s) => s.status === "paid").length;
  const pendingCount = salaries.filter((s) => s.status === "pending").length;
  const totalNet     = salaries.reduce((sum, s) => sum + (s.netAmount ?? 0), 0);

  const handleFilter = (setter) => (val) => { setter(val); setPage(1); setSelectedIds(new Set()); };
  const teacherSelected = teacher !== "all";
  const selectedTeacherName = teacherSelected
    ? (allTeacherOptions.find((o) => o.value === teacher)?.label ?? "O'qituvchi")
    : null;

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="w-full sm:w-44">
          <Select size="md" value={month} onChange={handleFilter(setMonth)} options={monthOptions} placeholder="Oy" />
        </div>
        <div className="w-full sm:w-52">
          <Select size="md" value={teacher} onChange={handleFilter(setTeacher)} options={allTeacherOptions} placeholder="O'qituvchi" />
        </div>
        <div className="w-full sm:w-40">
          <Select size="md" value={status} onChange={handleFilter(setStatus)} options={statusOptions} placeholder="Holat" />
        </div>
        {selectedIds.size > 0 && (
          <Button className="gap-1.5 text-sm h-10" disabled={bulkPayMutation.isPending}
            onClick={() => bulkPayMutation.mutate([...selectedIds])}>
            <CheckCircle2 className="size-3.5" strokeWidth={2} />
            {selectedIds.size} ta to'landi
          </Button>
        )}
      </div>

      {teacherSelected && (
        <div className="flex items-center justify-between border border-border bg-white px-4 py-2.5 rounded-lg">
          <div className="flex items-center gap-2">
            <User className="size-4 text-primary" strokeWidth={1.5} />
            <span className="text-sm font-medium">{selectedTeacherName}</span>
          </div>
          <button onClick={() => { setTeacher("all"); setPage(1); setSelectedIds(new Set()); }}
            className="p-1 text-muted-foreground hover:text-foreground">
            <X className="size-4" strokeWidth={1.5} />
          </button>
        </div>
      )}

      {/* Stats */}
      {salaries.length > 0 && (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard label="Jami"        value={total}                   icon={<Wallet className="size-5" strokeWidth={1.5} />} color="blue" />
          <StatCard label="To'langan"   value={paidCount}               icon={<CheckCircle2 className="size-5" strokeWidth={1.5} />} color="green" />
          <StatCard label="Kutilmoqda"  value={pendingCount}            icon={<Clock className="size-5" strokeWidth={1.5} />} color="orange" />
          <StatCard label="Jami to'lov" value={formatMoney(totalNet)}   icon={<Banknote className="size-5" strokeWidth={1.5} />} color="purple" small />
        </div>
      )}

      {/* Table */}
      {isLoading ? (
        <EmptyState text="Yuklanmoqda..." />
      ) : isError ? (
        <EmptyState text="Ma'lumot yuklanmadi" />
      ) : salaries.length === 0 ? (
        <EmptyState text="Oyliklar topilmadi" />
      ) : (
        <div className="rounded-lg overflow-x-auto border border-border bg-white">
          <table>
            <thead>
              <tr>
                <th className="w-8">
                  <input type="checkbox" className="rounded"
                    checked={salaries.filter(s => s.status === "pending").every(s => selectedIds.has(s._id))}
                    onChange={() => toggleAll(salaries.filter(s => s.status === "pending").map(s => s._id))} />
                </th>
                <th>#</th>
                <th>O'qituvchi</th>
                <th>Oy</th>
                <th>Hisoblangan</th>
                <th>Bonus</th>
                <th>Jarima</th>
                <th>Avans</th>
                <th>Sof to'lov</th>
                <th>Holat</th>
                <th>Sana</th>
                <th>Amal</th>
              </tr>
            </thead>
            <tbody>
              {salaries.map((salary, idx) => {
                const isPaid = salary.status === "paid";
                const teacherName = typeof salary.teacher === "object"
                  ? `${salary.teacher.firstName} ${salary.teacher.lastName}` : "—";
                return (
                  <tr key={salary._id} className="cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => openModal("salaryDetail", { salary })}>
                    <td className="text-center" onClick={(e) => e.stopPropagation()}>
                      {!isPaid && (
                        <input type="checkbox" className="rounded"
                          checked={selectedIds.has(salary._id)}
                          onChange={() => toggleSelect(salary._id)} />
                      )}
                    </td>
                    <td className="text-center text-sm text-gray-400">{(page - 1) * 20 + idx + 1}</td>
                    <td className="text-sm font-medium text-primary whitespace-nowrap">{teacherName}</td>
                    <td className="text-sm text-gray-600 whitespace-nowrap">{formatMonthLabel(salary.month)}</td>
                    <td className="text-sm text-gray-600 whitespace-nowrap text-right">{formatMoney(salary.totalAmount)}</td>
                    <td className="text-sm whitespace-nowrap text-right">
                      {salary.bonus > 0 ? <span className="text-green-600">+{formatMoney(salary.bonus)}</span> : <span className="text-gray-400">—</span>}
                    </td>
                    <td className="text-sm whitespace-nowrap text-right">
                      {salary.deduction > 0 ? <span className="text-red-500">-{formatMoney(salary.deduction)}</span> : <span className="text-gray-400">—</span>}
                    </td>
                    <td className="text-sm whitespace-nowrap text-right">
                      {salary.advanceDeducted > 0 ? <span className="text-orange-500">-{formatMoney(salary.advanceDeducted)}</span> : <span className="text-gray-400">—</span>}
                    </td>
                    <td className="text-sm font-semibold whitespace-nowrap text-right">{formatMoney(salary.netAmount)}</td>
                    <td><StatusBadge status={salary.status} /></td>
                    <td className="text-sm text-gray-400 whitespace-nowrap text-center">{salary.paidAt ? formatUzDate(salary.paidAt) : "—"}</td>
                    <td className="text-center" onClick={(e) => e.stopPropagation()}>
                      {!isPaid ? (
                        <Button size="sm" className="gap-1 px-2.5 text-xs h-7 whitespace-nowrap"
                          disabled={payMutation.isPending} onClick={() => payMutation.mutate(salary._id)}>
                          <CheckCircle2 className="size-3.5" strokeWidth={2} /> To'landi
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" className="gap-1 px-2.5 text-xs h-7 whitespace-nowrap"
                          disabled={unpayMutation.isPending} onClick={() => unpayMutation.mutate(salary._id)}>
                          <Undo2 className="size-3.5" strokeWidth={2} /> Qaytarish
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
      {totalPages > 1 && <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 2 — Ushlab qolishlar
// ═══════════════════════════════════════════════════════════════════════════════
const DeductionsTab = () => {
  const qc = useQueryClient();
  const teacherOptions = useTeacherOptions();

  // Create form state
  const [teacher, setTeacher] = useState("");
  const [amount, setAmount]   = useState("");
  const [reason, setReason]   = useState("");
  const [date, setDate]       = useState(() => new Date().toISOString().slice(0, 10));
  const [month, setMonth]     = useState(deductionMonthOptions[0]?.value ?? "");

  // Filter state
  const [filterTeacher, setFilterTeacher] = useState("");
  const [filterStatus, setFilterStatus]   = useState("");

  const histParams = {
    limit: 50,
    ...(filterTeacher && { teacher: filterTeacher }),
    ...(filterStatus  && { status:  filterStatus  }),
  };

  const { data: histData, refetch } = useAppQuery({
    queryKey: [...salariesKeys.all, "deductions", filterTeacher, filterStatus],
    queryFn: () => salariesAPI.deductions.getAll(histParams),
  });
  const deductions = histData?.deductions ?? [];

  const createMutation = useAppMutation({
    mutationFn: (data) => salariesAPI.deductions.create(data),
    invalidateKeys: [salariesKeys.all],
    onSuccess: () => {
      toast.success("Ushlab qolish yaratildi");
      setAmount(""); setReason("");
      refetch();
    },
    onError: (err) => toast.error(err.response?.data?.message ?? "Xatolik"),
  });

  const confirmMutation = useAppMutation({
    mutationFn: (id) => salariesAPI.deductions.confirm(id),
    invalidateKeys: [salariesKeys.all],
    onSuccess: () => { toast.success("Tasdiqlandi — oylikdan ayirildi"); refetch(); },
    onError: (err) => toast.error(err.response?.data?.message ?? "Xatolik"),
  });

  const deleteMutation = useAppMutation({
    mutationFn: (id) => salariesAPI.deductions.delete(id),
    invalidateKeys: [salariesKeys.all],
    onSuccess: () => { toast.success("O'chirildi"); refetch(); },
    onError: (err) => toast.error(err.response?.data?.message ?? "Xatolik"),
  });

  const handleCreate = () => {
    if (!teacher || !amount || !reason || !date || !month)
      return toast.error("Barcha maydonlarni to'ldiring");
    createMutation.mutate({ teacher, amount: Number(amount), reason, date, month });
  };

  const allTeacherOpts = [{ value: "", label: "Barcha o'qituvchilar" }, ...teacherOptions];
  const statusOpts = [
    { value: "",           label: "Barcha holat"  },
    { value: "pending",    label: "Kutilmoqda"    },
    { value: "confirmed",  label: "Tasdiqlangan"  },
  ];

  return (
    <div className="space-y-5">
      {/* Create form */}
      <div className="border border-border rounded-lg bg-white p-4">
        <p className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <Minus className="size-4 text-red-500" strokeWidth={2} />
          Yangi ushlab qolish
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">O'qituvchi *</label>
            <Select size="md" value={teacher} onChange={setTeacher}
              options={teacherOptions} placeholder="Tanlang" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Oy *</label>
            <Select size="md" value={month} onChange={setMonth}
              options={deductionMonthOptions} placeholder="Oyni tanlang" />
          </div>
          <InputField label="Summa (so'm) *" type="number" min={1}
            value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" />
          <div className="sm:col-span-2 lg:col-span-2">
            <InputField label="Sabab / Izoh *" value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Masalan: kechikish uchun, jarima..." />
          </div>
          <InputField label="Sana *" type="date"
            value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="mt-3 flex items-center gap-2">
          <Button onClick={handleCreate} disabled={createMutation.isPending} className="gap-1.5">
            Yaratish
          </Button>
          <p className="text-xs text-muted-foreground">
            Yaratilgandan so'ng "Tasdiqlash" bosilganda oylikdan ayiriladi
          </p>
        </div>
      </div>

      {/* Filter + list */}
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <div className="w-full sm:w-52">
            <Select size="md" value={filterTeacher} onChange={setFilterTeacher}
              options={allTeacherOpts} placeholder="O'qituvchi" />
          </div>
          <div className="w-full sm:w-40">
            <Select size="md" value={filterStatus} onChange={setFilterStatus}
              options={statusOpts} placeholder="Holat" />
          </div>
        </div>

        {deductions.length === 0 ? (
          <EmptyState text="Ushlab qolishlar topilmadi" />
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border bg-white">
            <table>
              <thead>
                <tr>
                  <th>O'qituvchi</th>
                  <th>Oy</th>
                  <th className="text-right">Summa</th>
                  <th>Sabab</th>
                  <th>Sana</th>
                  <th>Holat</th>
                  <th className="text-center">Amal</th>
                </tr>
              </thead>
              <tbody>
                {deductions.map((d) => {
                  const tName = typeof d.teacher === "object"
                    ? `${d.teacher.firstName} ${d.teacher.lastName}` : "—";
                  return (
                    <tr key={d._id} className="hover:bg-gray-50">
                      <td className="font-medium text-primary whitespace-nowrap text-sm">{tName}</td>
                      <td className="text-sm text-gray-600 whitespace-nowrap">{formatMonthLabel(d.month)}</td>
                      <td className="text-sm font-semibold text-red-600 text-right whitespace-nowrap">
                        -{formatMoney(d.amount)}
                      </td>
                      <td className="text-sm text-gray-600 max-w-[180px] truncate">{d.reason}</td>
                      <td className="text-sm text-gray-500 whitespace-nowrap">{formatUzDate(d.date)}</td>
                      <td><DeductionStatusBadge status={d.status} /></td>
                      <td className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          {d.status === "pending" && (
                            <button type="button" title="Tasdiqlash"
                              disabled={confirmMutation.isPending}
                              onClick={() => confirmMutation.mutate(d._id)}
                              className="p-1 text-green-600 hover:text-green-700 disabled:opacity-40">
                              <CheckCircle2 className="size-4" strokeWidth={2} />
                            </button>
                          )}
                          <button type="button" title="O'chirish"
                            disabled={deleteMutation.isPending}
                            onClick={() => window.confirm("O'chirishni tasdiqlaysizmi?") && deleteMutation.mutate(d._id)}
                            className="p-1 text-red-400 hover:text-red-600 disabled:opacity-40">
                            <Trash2 className="size-4" strokeWidth={1.5} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 3 — Avanslar
// ═══════════════════════════════════════════════════════════════════════════════
const ADVANCE_TYPE_OPTS = [
  { value: "advance", label: "Kelajak oy avans"       },
  { value: "partial", label: "Joriy oydan ertaroq olish" },
];
const MONTHS_OPTS = [{ value: "1", label: "1 oy" }, { value: "2", label: "2 oy" }];

const AdvancesTab = () => {
  const teacherOptions = useTeacherOptions();

  // Create form
  const [type, setType]       = useState("advance");
  const [teacher, setTeacher] = useState("");
  const [months, setMonths]   = useState("1");
  const [amount, setAmount]   = useState("");
  const [note, setNote]       = useState("");
  const [date, setDate]       = useState(() => new Date().toISOString().slice(0, 10));
  const [salaryMonth, setSalaryMonth] = useState(deductionMonthOptions[0]?.value ?? "");

  // Filter
  const [filterTeacher, setFilterTeacher] = useState("");
  const [filterType, setFilterType]       = useState("");
  const [filterStatus, setFilterStatus]   = useState("");

  // Salary calc for amount hint
  const { data: calcData } = useAppQuery({
    queryKey: ["salary-calc-adv", teacher],
    queryFn: () => salariesAPI.calculate({ teacher }),
    enabled: !!teacher && type === "advance",
    staleTime: 60 * 1000,
  });
  const lastNet = calcData?.preview?.netAmount ?? null;
  const hintAmount = lastNet ? Math.round(lastNet * Number(months)) : null;

  const histParams = {
    limit: 50,
    ...(filterTeacher && { teacher: filterTeacher }),
    ...(filterType    && { type:    filterType    }),
    ...(filterStatus  && { status:  filterStatus  }),
  };
  const { data: histData, refetch } = useAppQuery({
    queryKey: [...salariesKeys.all, "advances", filterTeacher, filterType, filterStatus],
    queryFn: () => salariesAPI.advances.getAll(histParams),
  });
  const advances = histData?.advances ?? [];

  const createMutation = useAppMutation({
    mutationFn: (data) => salariesAPI.advances.create(data),
    invalidateKeys: [salariesKeys.all],
    onSuccess: () => {
      toast.success("Avans yaratildi");
      setAmount(""); setNote("");
      refetch();
    },
    onError: (err) => toast.error(err.response?.data?.message ?? "Xatolik"),
  });

  const confirmMutation = useAppMutation({
    mutationFn: (id) => salariesAPI.advances.confirm(id),
    invalidateKeys: [salariesKeys.all],
    onSuccess: () => { toast.success("Avans tasdiqlandi"); refetch(); },
    onError: (err) => toast.error(err.response?.data?.message ?? "Xatolik"),
  });

  const deleteMutation = useAppMutation({
    mutationFn: (id) => salariesAPI.advances.delete(id),
    invalidateKeys: [salariesKeys.all],
    onSuccess: () => { toast.success("O'chirildi"); refetch(); },
    onError: (err) => toast.error(err.response?.data?.message ?? "Xatolik"),
  });

  const handleCreate = () => {
    if (!teacher || !amount || !date)
      return toast.error("O'qituvchi, summa va sanani kiriting");
    createMutation.mutate({
      teacher, type, amount: Number(amount),
      note: note.trim() || undefined, date,
      ...(type === "advance" ? { months: Number(months) } : { salaryMonth }),
    });
  };

  const allTeacherOpts = [{ value: "", label: "Barcha o'qituvchilar" }, ...teacherOptions];
  const typeFilterOpts = [
    { value: "", label: "Barcha tur" },
    { value: "advance", label: "Avans" },
    { value: "partial", label: "Ertaroq olish" },
  ];
  const statusFilterOpts = [
    { value: "",           label: "Barcha holat"  },
    { value: "pending",    label: "Kutilmoqda"    },
    { value: "confirmed",  label: "Tasdiqlangan"  },
    { value: "settled",    label: "Yopilgan"      },
  ];

  return (
    <div className="space-y-5">
      {/* Create form */}
      <div className="border border-border rounded-lg bg-white p-4">
        <p className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <TrendingUp className="size-4 text-blue-500" strokeWidth={1.5} />
          Yangi avans / ertaroq olish
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Tur *</label>
            <Select size="md" value={type} onChange={(v) => { setType(v); setAmount(""); }}
              options={ADVANCE_TYPE_OPTS} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">O'qituvchi *</label>
            <Select size="md" value={teacher} onChange={(v) => { setTeacher(v); setAmount(""); }}
              options={teacherOptions} placeholder="Tanlang" />
          </div>

          {type === "advance" ? (
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Necha oy</label>
              <Select size="md" value={months} onChange={setMonths} options={MONTHS_OPTS} />
            </div>
          ) : (
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Oylik oyi *</label>
              <Select size="md" value={salaryMonth} onChange={setSalaryMonth}
                options={deductionMonthOptions} placeholder="Oyni tanlang" />
            </div>
          )}

          <InputField
            label={hintAmount ? `Summa (so'm) — tavsiya: ${formatMoney(hintAmount)}` : "Summa (so'm) *"}
            type="number" min={1} value={amount}
            onChange={(e) => setAmount(e.target.value)} placeholder="0" />

          <InputField label="Sana *" type="date"
            value={date} onChange={(e) => setDate(e.target.value)} />

          <div className="sm:col-span-2 lg:col-span-1">
            <InputField label="Izoh (ixtiyoriy)" value={note}
              onChange={(e) => setNote(e.target.value)} placeholder="Ixtiyoriy..." />
          </div>
        </div>

        {type === "advance" && (
          <p className="mt-2 text-xs text-blue-600">
            Tasdiqlangandan so'ng keyingi {months} oy oyligidan avtomatik ayiriladi. Bir o'qituvchiga bir vaqtda 1 ta faol avans.
          </p>
        )}

        <div className="mt-3">
          <Button onClick={handleCreate} disabled={createMutation.isPending} className="gap-1.5">
            Yaratish
          </Button>
        </div>
      </div>

      {/* Filter + list */}
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <div className="w-full sm:w-52">
            <Select size="md" value={filterTeacher} onChange={setFilterTeacher}
              options={allTeacherOpts} placeholder="O'qituvchi" />
          </div>
          <div className="w-full sm:w-40">
            <Select size="md" value={filterType} onChange={setFilterType}
              options={typeFilterOpts} placeholder="Tur" />
          </div>
          <div className="w-full sm:w-40">
            <Select size="md" value={filterStatus} onChange={setFilterStatus}
              options={statusFilterOpts} placeholder="Holat" />
          </div>
        </div>

        {advances.length === 0 ? (
          <EmptyState text="Avanslar topilmadi" />
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border bg-white">
            <table>
              <thead>
                <tr>
                  <th>O'qituvchi</th>
                  <th>Tur</th>
                  <th className="text-right">Summa</th>
                  <th>Oylar</th>
                  <th>Sana</th>
                  <th>Holat</th>
                  <th className="text-center">Amal</th>
                </tr>
              </thead>
              <tbody>
                {advances.map((a) => {
                  const tName = typeof a.teacher === "object"
                    ? `${a.teacher.firstName} ${a.teacher.lastName}` : "—";
                  const coveredLabel = a.type === "advance" && a.coveredMonths?.length
                    ? a.coveredMonths.map(formatMonthLabel).join(", ")
                    : a.salaryMonth ? formatMonthLabel(a.salaryMonth) : "—";
                  return (
                    <tr key={a._id} className="hover:bg-gray-50">
                      <td className="font-medium text-primary whitespace-nowrap text-sm">{tName}</td>
                      <td>
                        <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                          a.type === "advance" ? "bg-blue-100 text-blue-700" : "bg-orange-100 text-orange-700"
                        }`}>
                          {a.type === "advance" ? "Avans" : "Ertaroq"}
                        </span>
                      </td>
                      <td className="text-sm font-semibold text-right whitespace-nowrap">
                        {formatMoney(a.amount)}
                      </td>
                      <td className="text-xs text-gray-500 max-w-[160px] truncate">{coveredLabel}</td>
                      <td className="text-sm text-gray-500 whitespace-nowrap">{formatUzDate(a.date)}</td>
                      <td><AdvanceStatusBadge status={a.status} /></td>
                      <td className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          {a.status === "pending" && (
                            <button type="button" title="Tasdiqlash"
                              disabled={confirmMutation.isPending}
                              onClick={() => confirmMutation.mutate(a._id)}
                              className="p-1 text-green-600 hover:text-green-700 disabled:opacity-40">
                              <CheckCircle2 className="size-4" strokeWidth={2} />
                            </button>
                          )}
                          <button type="button" title="O'chirish"
                            disabled={deleteMutation.isPending}
                            onClick={() => window.confirm("O'chirishni tasdiqlaysizmi?") && deleteMutation.mutate(a._id)}
                            className="p-1 text-red-400 hover:text-red-600 disabled:opacity-40">
                            <Trash2 className="size-4" strokeWidth={1.5} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// Shared sub-components
// ═══════════════════════════════════════════════════════════════════════════════
const colorMap = {
  blue:   { bg: "bg-blue-50",   icon: "text-blue-500",   value: "text-blue-700"   },
  green:  { bg: "bg-green-50",  icon: "text-green-500",  value: "text-green-700"  },
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

const EmptyState = ({ text }) => (
  <div className="flex flex-col items-center gap-2 py-14 text-gray-400">
    <Wallet className="size-10 opacity-30" strokeWidth={1.5} />
    <p className="text-sm">{text}</p>
  </div>
);

const StatusBadge = ({ status }) => {
  const paid = status === "paid";
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${
      paid ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
    }`}>
      {paid ? <CheckCircle2 className="size-3" strokeWidth={2} /> : <Clock className="size-3" strokeWidth={2} />}
      {paid ? "To'langan" : "Kutilmoqda"}
    </span>
  );
};

const DeductionStatusBadge = ({ status }) => {
  const confirmed = status === "confirmed";
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${
      confirmed ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
    }`}>
      {confirmed ? <CheckCircle2 className="size-3" strokeWidth={2} /> : <Clock className="size-3" strokeWidth={2} />}
      {confirmed ? "Tasdiqlangan" : "Kutilmoqda"}
    </span>
  );
};

const AdvanceStatusBadge = ({ status }) => {
  const map = {
    pending:   { cls: "bg-amber-100 text-amber-700", label: "Kutilmoqda"   },
    confirmed: { cls: "bg-green-100 text-green-700",  label: "Tasdiqlangan" },
    settled:   { cls: "bg-gray-100 text-gray-600",    label: "Yopilgan"     },
  };
  const { cls, label } = map[status] ?? map.pending;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${cls}`}>
      <CheckCircle2 className="size-3" strokeWidth={2} />
      {label}
    </span>
  );
};

export default SalariesPage;
