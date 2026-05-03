import { toast } from "sonner";
import { useState, useEffect } from "react";
import { salariesAPI } from "@/features/salaries/api/salaries.api";
import { salariesKeys, formatMonthLabel, monthOptions } from "@/features/salaries/data/salaries.data";
import { useAppQuery, useAppMutation } from "@/shared/lib/query/query-hooks";
import useModal from "@/shared/hooks/useModal";
import { usersAPI } from "@/features/users/api/users.api";
import Button from "@/shared/components/ui/button/Button";
import InputField from "@/shared/components/ui/input/InputField";
import Select from "@/shared/components/form/select";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";
import { formatUzDate } from "@/shared/utils/formatDate";
import { formatMoney } from "@/shared/utils/formatNumber";
import { CheckCircle2, Clock, Trash2 } from "lucide-react";

const advanceMonthOptions = monthOptions.filter((o) => o.value !== "all");

const MONTH_OPTS = [
  { value: "1", label: "1 oy" },
  { value: "2", label: "2 oy" },
];

const TYPE_OPTS = [
  { value: "advance", label: "Kelajak oy(lar) avans" },
  { value: "partial", label: "Joriy oydan ertaroq olish" },
];

const SalaryAdvanceModal = () => (
  <ResponsiveModal
    name="salaryAdvance"
    title="Avans / Ertaroq olish"
    className="max-w-2xl"
  >
    <Content />
  </ResponsiveModal>
);

const Content = ({ close, isLoading, setIsLoading }) => {
  const [tab, setTab] = useState("create");
  const [type, setType] = useState("advance");
  const [teacher, setTeacher] = useState("");
  const [months, setMonths] = useState("1");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [salaryMonth, setSalaryMonth] = useState(advanceMonthOptions[0]?.value ?? "");
  const [histTeacher, setHistTeacher] = useState("");
  const [histType, setHistType] = useState("");

  const { data: teachersData } = useAppQuery({
    queryKey: ["teachers-short"],
    queryFn: () => usersAPI.getTeachers({ limit: 200 }),
    staleTime: 5 * 60 * 1000,
  });
  const teachers = teachersData?.users ?? teachersData?.data ?? [];
  const teacherOptions = teachers.map((t) => ({
    value: t._id,
    label: `${t.firstName} ${t.lastName}`,
  }));

  // Auto-fill amount hint from last salary
  const { data: calcData } = useAppQuery({
    queryKey: ["salary-calc-advance", teacher],
    queryFn: () =>
      salariesAPI.calculate({ teacher }),
    enabled: !!teacher && type === "advance",
    staleTime: 60 * 1000,
  });
  const lastNetAmount = calcData?.data?.preview?.netAmount ?? calcData?.preview?.netAmount ?? null;

  useEffect(() => {
    if (lastNetAmount && type === "advance" && !amount) {
      setAmount(String(Math.round(lastNetAmount * Number(months))));
    }
  }, [lastNetAmount, teacher]);

  useEffect(() => {
    if (lastNetAmount && type === "advance") {
      setAmount(String(Math.round(lastNetAmount * Number(months))));
    }
  }, [months, lastNetAmount]);

  const histParams = {
    ...(histTeacher && { teacher: histTeacher }),
    ...(histType && { type: histType }),
    limit: 50,
  };
  const { data: histData, refetch } = useAppQuery({
    queryKey: [...salariesKeys.all, "advances", histTeacher, histType],
    queryFn: () => salariesAPI.advances.getAll(histParams),
    enabled: tab === "history",
  });
  const advances = histData?.advances ?? [];

  const createMutation = useAppMutation({
    mutationFn: (data) => salariesAPI.advances.create(data),
    invalidateKeys: [salariesKeys.all],
    onSuccess: () => {
      toast.success("Avans yaratildi");
      setAmount("");
      setNote("");
      setTab("history");
      refetch();
    },
    onError: (err) => toast.error(err.response?.data?.message ?? "Xatolik"),
  });

  const confirmMutation = useAppMutation({
    mutationFn: (id) => salariesAPI.advances.confirm(id),
    invalidateKeys: [salariesKeys.all],
    onSuccess: () => {
      toast.success("Avans tasdiqlandi");
      refetch();
    },
    onError: (err) => toast.error(err.response?.data?.message ?? "Xatolik"),
  });

  const deleteMutation = useAppMutation({
    mutationFn: (id) => salariesAPI.advances.delete(id),
    invalidateKeys: [salariesKeys.all],
    onSuccess: () => {
      toast.success("O'chirildi");
      refetch();
    },
    onError: (err) => toast.error(err.response?.data?.message ?? "Xatolik"),
  });

  const handleCreate = () => {
    if (!teacher || !amount || !date) {
      return toast.error("Barcha majburiy maydonlarni to'ldiring");
    }
    const payload = {
      teacher,
      type,
      amount: Number(amount),
      note: note.trim() || undefined,
      date,
      ...(type === "advance" ? { months: Number(months) } : { salaryMonth }),
    };
    createMutation.mutate(payload);
  };

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex border-b border-border">
        {[
          { key: "create", label: "Yangi avans" },
          { key: "history", label: "Tarix" },
        ].map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === t.key
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "create" && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {/* Type */}
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-gray-600">Avans turi</label>
              <Select
                size="md"
                value={type}
                onChange={(v) => { setType(v); setAmount(""); }}
                options={TYPE_OPTS}
              />
            </div>

            {/* Teacher */}
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-gray-600">O'qituvchi</label>
              <Select
                size="md"
                value={teacher}
                onChange={(v) => { setTeacher(v); setAmount(""); }}
                options={teacherOptions}
                placeholder="O'qituvchini tanlang"
              />
            </div>

            {/* Advance-specific fields */}
            {type === "advance" && (
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">Necha oy</label>
                <Select
                  size="md"
                  value={months}
                  onChange={setMonths}
                  options={MONTH_OPTS}
                />
              </div>
            )}

            {/* Partial-specific fields */}
            {type === "partial" && (
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">Oylik oyi</label>
                <Select
                  size="md"
                  value={salaryMonth}
                  onChange={setSalaryMonth}
                  options={advanceMonthOptions}
                  placeholder="Oyni tanlang"
                />
              </div>
            )}

            <div>
              <InputField
                label={
                  type === "advance" && lastNetAmount
                    ? `Summa (so'm) — tavsiya: ${formatMoney(Math.round(lastNetAmount * Number(months)))}`
                    : "Summa (so'm)"
                }
                type="number"
                min={1}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
              />
            </div>

            <InputField
              label="Sana"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />

            <div className="sm:col-span-2">
              <InputField
                label="Izoh (ixtiyoriy)"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ixtiyoriy izoh..."
              />
            </div>
          </div>

          {type === "advance" && (
            <div className="rounded-md bg-blue-50 border border-blue-200 px-3 py-2 text-xs text-blue-700">
              Avans tasdiqlanganidan so'ng keyingi {months} oy oyligidan avtomatik ayiriladi.
              Bir o'qituvchiga bir vaqtda faqat 1 ta faol avans bo'lishi mumkin.
            </div>
          )}
          {type === "partial" && (
            <div className="rounded-md bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-700">
              Tasdiqlangandan so'ng tanlangan oylik hisobidan ayiriladi.
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <Button
              className="flex-1"
              onClick={handleCreate}
              disabled={createMutation.isPending || isLoading}
            >
              Yaratish
            </Button>
            <Button variant="outline" onClick={close} disabled={isLoading}>
              Yopish
            </Button>
          </div>
        </div>
      )}

      {tab === "history" && (
        <div className="space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="w-full sm:w-52">
              <Select
                size="md"
                value={histTeacher}
                onChange={setHistTeacher}
                options={[{ value: "", label: "Barcha o'qituvchilar" }, ...teacherOptions]}
                placeholder="O'qituvchi"
              />
            </div>
            <div className="w-full sm:w-44">
              <Select
                size="md"
                value={histType}
                onChange={setHistType}
                options={[
                  { value: "", label: "Barcha tur" },
                  { value: "advance", label: "Avans" },
                  { value: "partial", label: "Ertaroq olish" },
                ]}
              />
            </div>
          </div>

          {advances.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">Yozuvlar topilmadi</p>
          ) : (
            <div className="border border-border rounded-md divide-y divide-border overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-xs text-muted-foreground">
                    <th className="px-3 py-2 text-left font-medium">O'qituvchi</th>
                    <th className="px-3 py-2 text-left font-medium">Tur</th>
                    <th className="px-3 py-2 text-right font-medium">Summa</th>
                    <th className="px-3 py-2 text-left font-medium">Oylar</th>
                    <th className="px-3 py-2 text-left font-medium">Sana</th>
                    <th className="px-3 py-2 text-left font-medium">Holat</th>
                    <th className="px-3 py-2 text-center font-medium">Amal</th>
                  </tr>
                </thead>
                <tbody>
                  {advances.map((a) => {
                    const teacherName =
                      typeof a.teacher === "object"
                        ? `${a.teacher.firstName} ${a.teacher.lastName}`
                        : "—";
                    const coveredLabel =
                      a.type === "advance" && a.coveredMonths?.length
                        ? a.coveredMonths.map(formatMonthLabel).join(", ")
                        : a.salaryMonth
                        ? formatMonthLabel(a.salaryMonth)
                        : "—";
                    return (
                      <tr key={a._id} className="hover:bg-gray-50">
                        <td className="px-3 py-2 font-medium text-primary whitespace-nowrap">{teacherName}</td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          <span className={`text-xs px-1.5 py-0.5 rounded ${a.type === "advance" ? "bg-blue-100 text-blue-700" : "bg-orange-100 text-orange-700"}`}>
                            {a.type === "advance" ? "Avans" : "Ertaroq"}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-right font-semibold text-foreground whitespace-nowrap">
                          {formatMoney(a.amount)}
                        </td>
                        <td className="px-3 py-2 text-xs text-gray-500 max-w-[150px] truncate">{coveredLabel}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-gray-500">{formatUzDate(a.date)}</td>
                        <td className="px-3 py-2">
                          <AdvanceStatusBadge status={a.status} />
                        </td>
                        <td className="px-3 py-2 text-center">
                          <div className="flex items-center justify-center gap-1">
                            {a.status === "pending" && (
                              <button
                                type="button"
                                title="Tasdiqlash"
                                disabled={confirmMutation.isPending}
                                onClick={() => confirmMutation.mutate(a._id)}
                                className="p-1 text-green-600 hover:text-green-700 disabled:opacity-40"
                              >
                                <CheckCircle2 className="size-4" strokeWidth={2} />
                              </button>
                            )}
                            <button
                              type="button"
                              title="O'chirish"
                              disabled={deleteMutation.isPending}
                              onClick={() => {
                                if (!window.confirm("O'chirishni tasdiqlaysizmi?")) return;
                                deleteMutation.mutate(a._id);
                              }}
                              className="p-1 text-red-400 hover:text-red-600 disabled:opacity-40"
                            >
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
      )}
    </div>
  );
};

const AdvanceStatusBadge = ({ status }) => {
  const map = {
    pending:   { cls: "bg-amber-100 text-amber-700", label: "Kutilmoqda", Icon: Clock },
    confirmed: { cls: "bg-green-100 text-green-700", label: "Tasdiqlangan", Icon: CheckCircle2 },
    settled:   { cls: "bg-gray-100 text-gray-600", label: "Yopilgan", Icon: CheckCircle2 },
  };
  const { cls, label, Icon } = map[status] ?? map.pending;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${cls}`}>
      <Icon className="size-3" strokeWidth={2} />
      {label}
    </span>
  );
};

export default SalaryAdvanceModal;
