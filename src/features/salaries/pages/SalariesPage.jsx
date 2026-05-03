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
import { formatUzDate } from "@/shared/utils/formatDate";
import { formatMoney } from "@/shared/utils/formatNumber";
import {
  Wallet, CheckCircle2, Clock,
  Banknote, User, X, Undo2, Trash2, TrendingUp, Minus,
} from "lucide-react";

const monthOpts      = monthOptions.filter((o) => o.value !== "all");
const allMonthOpts   = monthOptions;

// ─── Shared: teacher options ──────────────────────────────────────────────────
function useTeacherOptions() {
  const { data } = useAppQuery({
    queryKey: ["teachers-short"],
    queryFn: () => usersAPI.getTeachers({ limit: 200 }),
    staleTime: 5 * 60 * 1000,
  });
  const list = data?.users ?? data?.data ?? [];
  return list.map((t) => ({ value: t._id, label: `${t.firstName} ${t.lastName}` }));
}

// ─── Tab bar (matches PaymentsPage style) ─────────────────────────────────────
const TABS = [
  { key: "salaries",   label: "Oyliklar"        },
  { key: "deductions", label: "Ushlab qolishlar" },
  { key: "advances",   label: "Avanslar"         },
];

// ═══════════════════════════════════════════════════════════════════════════════
const SalariesPage = () => {
  const [activeTab, setActiveTab] = useState("salaries");

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="page-title">Oyliklar</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setActiveTab(t.key)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === t.key
                ? "border-gray-900 text-gray-900"
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === "salaries"   && <SalariesTab />}
      {activeTab === "deductions" && <DeductionsTab />}
      {activeTab === "advances"   && <AdvancesTab />}

      <SalaryDetailModal />
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 1 — Oyliklar
// ═══════════════════════════════════════════════════════════════════════════════
const SalariesTab = () => {
  const { openModal } = useModal();
  const [month,   setMonth]   = useState("all");
  const [status,  setStatus]  = useState("all");
  const [teacher, setTeacher] = useState("all");
  const [page,    setPage]    = useState(1);
  const [selectedIds, setSelectedIds] = useState(new Set());

  const teacherOptions = useTeacherOptions();
  const allTeacherOpts = [{ value: "all", label: "Barcha o'qituvchilar" }, ...teacherOptions];

  const params = {
    page, limit: 20,
    ...(month   !== "all" && { month   }),
    ...(status  !== "all" && { status  }),
    ...(teacher !== "all" && { teacher }),
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
    onError:   (err) => toast.error(err.response?.data?.message ?? "Xatolik"),
  });
  const unpayMutation = useAppMutation({
    mutationFn: (id) => salariesAPI.update(id, { status: "pending", paidAt: null }),
    invalidateKeys: [salariesKeys.all],
    onSuccess: () => toast.success("Oylik qaytarildi"),
    onError:   (err) => toast.error(err.response?.data?.message ?? "Xatolik"),
  });
  const bulkPayMutation = useAppMutation({
    mutationFn: (ids) => salariesAPI.bulkPay({ ids }),
    invalidateKeys: [salariesKeys.all],
    onSuccess: (res) => { toast.success(`${res?.paid ?? 0} ta oylik to'landi`); setSelectedIds(new Set()); },
    onError:   (err) => toast.error(err.response?.data?.message ?? "Xatolik"),
  });

  const toggleOne = (id) =>
    setSelectedIds((p) => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleAll = (ids) =>
    setSelectedIds((p) => ids.every((id) => p.has(id)) ? new Set() : new Set(ids));

  const paidCount    = salaries.filter((s) => s.status === "paid").length;
  const pendingCount = salaries.filter((s) => s.status === "pending").length;
  const totalNet     = salaries.reduce((sum, s) => sum + (s.netAmount ?? 0), 0);

  const setFilter = (setter) => (val) => { setter(val); setPage(1); setSelectedIds(new Set()); };

  return (
    <div className="space-y-4">

      {/* Filters row */}
      <div className="flex flex-wrap items-end gap-2">
        <div className="w-44">
          <Select size="md" value={month} onChange={setFilter(setMonth)}
            options={allMonthOpts} placeholder="Oy" />
        </div>
        <div className="w-52">
          <Select size="md" value={teacher} onChange={setFilter(setTeacher)}
            options={allTeacherOpts} placeholder="O'qituvchi" />
        </div>
        <div className="w-40">
          <Select size="md" value={status} onChange={setFilter(setStatus)}
            options={statusOptions} placeholder="Holat" />
        </div>
        {selectedIds.size > 0 && (
          <Button className="gap-1.5 h-10 text-sm" disabled={bulkPayMutation.isPending}
            onClick={() => bulkPayMutation.mutate([...selectedIds])}>
            <CheckCircle2 className="size-3.5" strokeWidth={2} />
            {selectedIds.size} ta to'landi
          </Button>
        )}
      </div>

      {/* Active teacher chip */}
      {teacher !== "all" && (
        <div className="inline-flex items-center gap-2 border border-border bg-white px-3 py-1.5">
          <User className="size-3.5 text-primary" strokeWidth={1.5} />
          <span className="text-sm font-medium">
            {allTeacherOpts.find((o) => o.value === teacher)?.label}
          </span>
          <button onClick={() => { setTeacher("all"); setPage(1); setSelectedIds(new Set()); }}
            className="text-muted-foreground hover:text-foreground">
            <X className="size-3.5" strokeWidth={1.5} />
          </button>
        </div>
      )}

      {/* Stats */}
      {salaries.length > 0 && (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard label="Jami"        value={total}                 icon={<Wallet       className="size-5" strokeWidth={1.5} />} color="blue"   />
          <StatCard label="To'langan"   value={paidCount}             icon={<CheckCircle2 className="size-5" strokeWidth={1.5} />} color="green"  />
          <StatCard label="Kutilmoqda"  value={pendingCount}          icon={<Clock        className="size-5" strokeWidth={1.5} />} color="orange" />
          <StatCard label="Jami to'lov" value={formatMoney(totalNet)} icon={<Banknote     className="size-5" strokeWidth={1.5} />} color="purple" small />
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
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th className="w-10">
                  <input type="checkbox" className="rounded"
                    checked={salaries.filter(s => s.status === "pending").length > 0 &&
                      salaries.filter(s => s.status === "pending").every(s => selectedIds.has(s._id))}
                    onChange={() => toggleAll(salaries.filter(s => s.status === "pending").map(s => s._id))} />
                </th>
                <th>O'qituvchi</th>
                <th>Oy</th>
                <th>Hisoblangan</th>
                <th>Bonus</th>
                <th>Jarima</th>
                <th>Avans</th>
                <th>Sof to'lov</th>
                <th>Holat</th>
                <th>Amal</th>
              </tr>
            </thead>
            <tbody>
              {salaries.map((s, idx) => {
                const isPaid = s.status === "paid";
                const name = typeof s.teacher === "object"
                  ? `${s.teacher.firstName} ${s.teacher.lastName}` : "—";
                return (
                  <tr key={s._id} className="cursor-pointer"
                    onClick={() => openModal("salaryDetail", { salary: s })}>
                    <td className="text-center" onClick={(e) => e.stopPropagation()}>
                      {!isPaid && (
                        <input type="checkbox" className="rounded"
                          checked={selectedIds.has(s._id)}
                          onChange={() => toggleOne(s._id)} />
                      )}
                    </td>
                    <td className="font-medium text-primary whitespace-nowrap">{name}</td>
                    <td className="whitespace-nowrap text-gray-600">{formatMonthLabel(s.month)}</td>
                    <td className="text-right whitespace-nowrap">{formatMoney(s.totalAmount)}</td>
                    <td className="text-right whitespace-nowrap">
                      {s.bonus > 0
                        ? <span className="text-green-600 font-medium">+{formatMoney(s.bonus)}</span>
                        : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="text-right whitespace-nowrap">
                      {s.deduction > 0
                        ? <span className="text-red-500 font-medium">-{formatMoney(s.deduction)}</span>
                        : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="text-right whitespace-nowrap">
                      {s.advanceDeducted > 0
                        ? <span className="text-orange-500 font-medium">-{formatMoney(s.advanceDeducted)}</span>
                        : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="text-right whitespace-nowrap font-semibold">{formatMoney(s.netAmount)}</td>
                    <td><SalaryStatusBadge status={s.status} /></td>
                    <td className="text-center" onClick={(e) => e.stopPropagation()}>
                      {!isPaid ? (
                        <Button size="sm" className="gap-1 px-2.5 text-xs h-7 whitespace-nowrap"
                          disabled={payMutation.isPending}
                          onClick={() => payMutation.mutate(s._id)}>
                          <CheckCircle2 className="size-3" strokeWidth={2} /> To'landi
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline"
                          className="gap-1 px-2.5 text-xs h-7 whitespace-nowrap"
                          disabled={unpayMutation.isPending}
                          onClick={() => unpayMutation.mutate(s._id)}>
                          <Undo2 className="size-3" strokeWidth={2} /> Qaytarish
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

      {totalPages > 1 && (
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 2 — Ushlab qolishlar
// ═══════════════════════════════════════════════════════════════════════════════
const DeductionsTab = () => {
  const teacherOptions = useTeacherOptions();

  // create form
  const [teacher, setTeacher] = useState("");
  const [amount,  setAmount]  = useState("");
  const [reason,  setReason]  = useState("");
  const [date,    setDate]    = useState(() => new Date().toISOString().slice(0, 10));
  const [month,   setMonth]   = useState(monthOpts[0]?.value ?? "");

  // filters
  const [fTeacher, setFTeacher] = useState("");
  const [fStatus,  setFStatus]  = useState("");

  const histParams = {
    limit: 50,
    ...(fTeacher && { teacher: fTeacher }),
    ...(fStatus  && { status:  fStatus  }),
  };
  const { data, refetch } = useAppQuery({
    queryKey: [...salariesKeys.all, "deductions", fTeacher, fStatus],
    queryFn: () => salariesAPI.deductions.getAll(histParams),
  });
  const deductions = data?.deductions ?? [];

  const createMutation = useAppMutation({
    mutationFn: (d) => salariesAPI.deductions.create(d),
    invalidateKeys: [salariesKeys.all],
    onSuccess: () => { toast.success("Yaratildi"); setAmount(""); setReason(""); refetch(); },
    onError:   (err) => toast.error(err.response?.data?.message ?? "Xatolik"),
  });
  const confirmMutation = useAppMutation({
    mutationFn: (id) => salariesAPI.deductions.confirm(id),
    invalidateKeys: [salariesKeys.all],
    onSuccess: () => { toast.success("Tasdiqlandi — oylikdan ayirildi"); refetch(); },
    onError:   (err) => toast.error(err.response?.data?.message ?? "Xatolik"),
  });
  const deleteMutation = useAppMutation({
    mutationFn: (id) => salariesAPI.deductions.delete(id),
    invalidateKeys: [salariesKeys.all],
    onSuccess: () => { toast.success("O'chirildi"); refetch(); },
    onError:   (err) => toast.error(err.response?.data?.message ?? "Xatolik"),
  });

  const handleCreate = () => {
    if (!teacher || !amount || !reason || !date || !month)
      return toast.error("Barcha maydonlarni to'ldiring");
    createMutation.mutate({ teacher, amount: Number(amount), reason, date, month });
  };

  const allTeacherOpts = [{ value: "", label: "Barcha o'qituvchilar" }, ...teacherOptions];
  const statusOpts = [
    { value: "",          label: "Barcha holat"  },
    { value: "pending",   label: "Kutilmoqda"    },
    { value: "confirmed", label: "Tasdiqlangan"  },
  ];

  return (
    <div className="space-y-4">
      {/* Create form */}
      <Card title="Yangi ushlab qolish" icon={<Minus className="size-4 text-red-500" strokeWidth={2} />}>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Select size="md" label="O'qituvchi *"
            value={teacher} onChange={setTeacher}
            options={teacherOptions} placeholder="Tanlang" />
          <Select size="md" label="Oy *"
            value={month} onChange={setMonth}
            options={monthOpts} placeholder="Oyni tanlang" />
          <InputField label="Summa (so'm) *" type="number" min={1}
            value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" />
          <div className="sm:col-span-2">
            <InputField label="Sabab / Izoh *" value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Masalan: kechikish uchun, jarima..." />
          </div>
          <InputField label="Sana *" type="date"
            value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="mt-4 flex items-center gap-3">
          <Button onClick={handleCreate} disabled={createMutation.isPending}>
            Yaratish
          </Button>
          <p className="text-xs text-muted-foreground">
            Yaratilgandan keyin ✓ bosib tasdiqlanadi — shundan keyingina oylikdan ayiriladi
          </p>
        </div>
      </Card>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="w-52">
          <Select size="md" value={fTeacher} onChange={setFTeacher}
            options={allTeacherOpts} placeholder="O'qituvchi" />
        </div>
        <div className="w-40">
          <Select size="md" value={fStatus} onChange={setFStatus}
            options={statusOpts} placeholder="Holat" />
        </div>
      </div>

      {/* Table */}
      {deductions.length === 0 ? (
        <EmptyState text="Ushlab qolishlar topilmadi" />
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>O'qituvchi</th>
                <th>Oy</th>
                <th>Summa</th>
                <th>Sabab</th>
                <th>Sana</th>
                <th>Holat</th>
                <th>Amal</th>
              </tr>
            </thead>
            <tbody>
              {deductions.map((d) => {
                const name = d.teacher && typeof d.teacher === "object"
                  ? `${d.teacher.firstName} ${d.teacher.lastName}` : "—";
                return (
                  <tr key={d._id}>
                    <td className="font-medium text-primary whitespace-nowrap">{name}</td>
                    <td className="whitespace-nowrap">{formatMonthLabel(d.month)}</td>
                    <td className="text-right font-semibold text-red-600 whitespace-nowrap">
                      -{formatMoney(d.amount)}
                    </td>
                    <td className="max-w-[200px]">
                      <p className="truncate text-gray-600">{d.reason}</p>
                    </td>
                    <td className="whitespace-nowrap text-gray-500">{formatUzDate(d.date)}</td>
                    <td><DeductBadge status={d.status} /></td>
                    <td className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        {d.status === "pending" && (
                          <button type="button" title="Tasdiqlash"
                            disabled={confirmMutation.isPending}
                            onClick={() => confirmMutation.mutate(d._id)}
                            className="p-1.5 text-green-600 hover:bg-green-50 disabled:opacity-40 transition-colors">
                            <CheckCircle2 className="size-4" strokeWidth={2} />
                          </button>
                        )}
                        <button type="button" title="O'chirish"
                          disabled={deleteMutation.isPending}
                          onClick={() => window.confirm("O'chirishni tasdiqlaysizmi?") && deleteMutation.mutate(d._id)}
                          className="p-1.5 text-red-400 hover:bg-red-50 disabled:opacity-40 transition-colors">
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
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 3 — Avanslar
// ═══════════════════════════════════════════════════════════════════════════════
const TYPE_OPTS = [
  { value: "advance", label: "Kelajak oy avans"         },
  { value: "partial", label: "Joriy oydan ertaroq olish" },
];
const MONTH_COUNT_OPTS = [
  { value: "1", label: "1 oy" },
  { value: "2", label: "2 oy" },
];

const AdvancesTab = () => {
  const teacherOptions = useTeacherOptions();

  // create form
  const [type,        setType]        = useState("advance");
  const [teacher,     setTeacher]     = useState("");
  const [months,      setMonths]      = useState("1");
  const [amount,      setAmount]      = useState("");
  const [note,        setNote]        = useState("");
  const [date,        setDate]        = useState(() => new Date().toISOString().slice(0, 10));
  const [salaryMonth, setSalaryMonth] = useState(monthOpts[0]?.value ?? "");

  // filters
  const [fTeacher, setFTeacher] = useState("");
  const [fType,    setFType]    = useState("");
  const [fStatus,  setFStatus]  = useState("");

  // amount hint
  const { data: calcData } = useAppQuery({
    queryKey: ["salary-calc-adv", teacher],
    queryFn: () => salariesAPI.calculate({ teacher }),
    enabled: !!teacher && type === "advance",
    staleTime: 60 * 1000,
  });
  const lastNet    = calcData?.preview?.netAmount ?? null;
  const hintAmount = lastNet ? Math.round(lastNet * Number(months)) : null;

  const histParams = {
    limit: 50,
    ...(fTeacher && { teacher: fTeacher }),
    ...(fType    && { type:    fType    }),
    ...(fStatus  && { status:  fStatus  }),
  };
  const { data, refetch } = useAppQuery({
    queryKey: [...salariesKeys.all, "advances", fTeacher, fType, fStatus],
    queryFn: () => salariesAPI.advances.getAll(histParams),
  });
  const advances = data?.advances ?? [];

  const createMutation = useAppMutation({
    mutationFn: (d) => salariesAPI.advances.create(d),
    invalidateKeys: [salariesKeys.all],
    onSuccess: () => { toast.success("Avans yaratildi"); setAmount(""); setNote(""); refetch(); },
    onError:   (err) => toast.error(err.response?.data?.message ?? "Xatolik"),
  });
  const confirmMutation = useAppMutation({
    mutationFn: (id) => salariesAPI.advances.confirm(id),
    invalidateKeys: [salariesKeys.all],
    onSuccess: () => { toast.success("Avans tasdiqlandi"); refetch(); },
    onError:   (err) => toast.error(err.response?.data?.message ?? "Xatolik"),
  });
  const deleteMutation = useAppMutation({
    mutationFn: (id) => salariesAPI.advances.delete(id),
    invalidateKeys: [salariesKeys.all],
    onSuccess: () => { toast.success("O'chirildi"); refetch(); },
    onError:   (err) => toast.error(err.response?.data?.message ?? "Xatolik"),
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
    { value: "",          label: "Barcha tur"         },
    { value: "advance",   label: "Avans"              },
    { value: "partial",   label: "Ertaroq olish"      },
  ];
  const statusFilterOpts = [
    { value: "",          label: "Barcha holat"  },
    { value: "pending",   label: "Kutilmoqda"    },
    { value: "confirmed", label: "Tasdiqlangan"  },
    { value: "settled",   label: "Yopilgan"      },
  ];

  return (
    <div className="space-y-4">
      {/* Create form */}
      <Card title="Yangi avans / ertaroq olish" icon={<TrendingUp className="size-4 text-blue-500" strokeWidth={1.5} />}>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Select size="md" label="Tur *"
            value={type} onChange={(v) => { setType(v); setAmount(""); }}
            options={TYPE_OPTS} />
          <Select size="md" label="O'qituvchi *"
            value={teacher} onChange={(v) => { setTeacher(v); setAmount(""); }}
            options={teacherOptions} placeholder="Tanlang" />

          {type === "advance" ? (
            <Select size="md" label="Necha oy"
              value={months} onChange={setMonths} options={MONTH_COUNT_OPTS} />
          ) : (
            <Select size="md" label="Oylik oyi *"
              value={salaryMonth} onChange={setSalaryMonth}
              options={monthOpts} placeholder="Oyni tanlang" />
          )}

          <InputField
            label="Summa (so'm) *"
            description={hintAmount ? `Tavsiya: ${formatMoney(hintAmount)}` : undefined}
            type="number" min={1} value={amount}
            onChange={(e) => setAmount(e.target.value)} placeholder="0" />

          <InputField label="Sana *" type="date"
            value={date} onChange={(e) => setDate(e.target.value)} />

          <InputField label="Izoh (ixtiyoriy)" value={note}
            onChange={(e) => setNote(e.target.value)} placeholder="Ixtiyoriy..." />
        </div>

        {type === "advance" && (
          <p className="mt-3 text-xs text-blue-600">
            Tasdiqlanganidan so'ng keyingi {months === "1" ? "1 oy" : "2 oy"} oyligidan avtomatik ayiriladi. Bir vaqtda faqat 1 ta faol avans.
          </p>
        )}

        <div className="mt-4">
          <Button onClick={handleCreate} disabled={createMutation.isPending}>
            Yaratish
          </Button>
        </div>
      </Card>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="w-52">
          <Select size="md" value={fTeacher} onChange={setFTeacher}
            options={allTeacherOpts} placeholder="O'qituvchi" />
        </div>
        <div className="w-40">
          <Select size="md" value={fType} onChange={setFType}
            options={typeFilterOpts} placeholder="Tur" />
        </div>
        <div className="w-40">
          <Select size="md" value={fStatus} onChange={setFStatus}
            options={statusFilterOpts} placeholder="Holat" />
        </div>
      </div>

      {/* Table */}
      {advances.length === 0 ? (
        <EmptyState text="Avanslar topilmadi" />
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>O'qituvchi</th>
                <th>Tur</th>
                <th>Summa</th>
                <th>Oylar</th>
                <th>Sana</th>
                <th>Izoh</th>
                <th>Holat</th>
                <th>Amal</th>
              </tr>
            </thead>
            <tbody>
              {advances.map((a) => {
                const name = a.teacher && typeof a.teacher === "object"
                  ? `${a.teacher.firstName} ${a.teacher.lastName}` : "—";
                const coveredLabel = a.type === "advance" && a.coveredMonths?.length
                  ? a.coveredMonths.map(formatMonthLabel).join(", ")
                  : a.salaryMonth ? formatMonthLabel(a.salaryMonth) : "—";
                return (
                  <tr key={a._id}>
                    <td className="font-medium text-primary whitespace-nowrap">{name}</td>
                    <td>
                      <span className={`inline-block text-xs px-2 py-0.5 font-medium ${
                        a.type === "advance"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-orange-100 text-orange-700"
                      }`}>
                        {a.type === "advance" ? "Avans" : "Ertaroq"}
                      </span>
                    </td>
                    <td className="text-right font-semibold whitespace-nowrap">
                      {formatMoney(a.amount)}
                    </td>
                    <td className="text-xs text-gray-500 max-w-[150px]">
                      <p className="truncate">{coveredLabel}</p>
                    </td>
                    <td className="whitespace-nowrap text-gray-500">{formatUzDate(a.date)}</td>
                    <td className="max-w-[140px]">
                      <p className="truncate text-gray-500 text-xs">{a.note || "—"}</p>
                    </td>
                    <td><AdvanceBadge status={a.status} /></td>
                    <td className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        {a.status === "pending" && (
                          <button type="button" title="Tasdiqlash"
                            disabled={confirmMutation.isPending}
                            onClick={() => confirmMutation.mutate(a._id)}
                            className="p-1.5 text-green-600 hover:bg-green-50 disabled:opacity-40 transition-colors">
                            <CheckCircle2 className="size-4" strokeWidth={2} />
                          </button>
                        )}
                        <button type="button" title="O'chirish"
                          disabled={deleteMutation.isPending}
                          onClick={() => window.confirm("O'chirishni tasdiqlaysizmi?") && deleteMutation.mutate(a._id)}
                          className="p-1.5 text-red-400 hover:bg-red-50 disabled:opacity-40 transition-colors">
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
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// Shared UI
// ═══════════════════════════════════════════════════════════════════════════════
const COLOR = {
  blue:   { bg: "bg-blue-50",   icon: "text-blue-500",   val: "text-blue-700"   },
  green:  { bg: "bg-green-50",  icon: "text-green-500",  val: "text-green-700"  },
  orange: { bg: "bg-orange-50", icon: "text-orange-500", val: "text-orange-700" },
  purple: { bg: "bg-purple-50", icon: "text-purple-500", val: "text-purple-700" },
};
const StatCard = ({ label, value, icon, color = "blue", small = false }) => {
  const c = COLOR[color];
  return (
    <Card className="flex items-center gap-3 p-4">
      <div className={`${c.bg} ${c.icon} p-2.5 shrink-0`}>{icon}</div>
      <div className="min-w-0">
        <p className="text-xs text-gray-400 truncate">{label}</p>
        <p className={`font-bold truncate ${small ? "text-sm" : "text-xl"} ${c.val}`}>{value}</p>
      </div>
    </Card>
  );
};

const EmptyState = ({ text }) => (
  <div className="flex flex-col items-center gap-2 py-16 text-gray-400">
    <Wallet className="size-10 opacity-30" strokeWidth={1.5} />
    <p className="text-sm">{text}</p>
  </div>
);

const SalaryStatusBadge = ({ status }) => {
  const paid = status === "paid";
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium ${
      paid ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
    }`}>
      {paid
        ? <CheckCircle2 className="size-3" strokeWidth={2} />
        : <Clock className="size-3" strokeWidth={2} />}
      {paid ? "To'langan" : "Kutilmoqda"}
    </span>
  );
};

const DeductBadge = ({ status }) => {
  const ok = status === "confirmed";
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium ${
      ok ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
    }`}>
      {ok ? <CheckCircle2 className="size-3" strokeWidth={2} /> : <Clock className="size-3" strokeWidth={2} />}
      {ok ? "Tasdiqlangan" : "Kutilmoqda"}
    </span>
  );
};

const AdvanceBadge = ({ status }) => {
  const map = {
    pending:   "bg-amber-100 text-amber-700",
    confirmed: "bg-green-100 text-green-700",
    settled:   "bg-gray-100 text-gray-500",
  };
  const labels = { pending: "Kutilmoqda", confirmed: "Tasdiqlangan", settled: "Yopilgan" };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium ${map[status] ?? map.pending}`}>
      <CheckCircle2 className="size-3" strokeWidth={2} />
      {labels[status] ?? "Kutilmoqda"}
    </span>
  );
};

export default SalariesPage;
