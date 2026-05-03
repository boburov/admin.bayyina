import { toast } from "sonner";
import { useState } from "react";
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

const deductionMonthOptions = monthOptions.filter((o) => o.value !== "all");

const SalaryDeductionModal = () => (
  <ResponsiveModal
    name="salaryDeduction"
    title="Oylikdan ushlab qolish"
    className="max-w-2xl"
  >
    <Content />
  </ResponsiveModal>
);

const Content = ({ close, isLoading, setIsLoading }) => {
  const [tab, setTab] = useState("create"); // 'create' | 'history'
  const [teacher, setTeacher] = useState("");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [month, setMonth] = useState(deductionMonthOptions[0]?.value ?? "");
  const [histTeacher, setHistTeacher] = useState("");

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

  const histParams = { ...(histTeacher && { teacher: histTeacher }), limit: 50 };
  const { data: histData, refetch } = useAppQuery({
    queryKey: [...salariesKeys.all, "deductions", histTeacher],
    queryFn: () => salariesAPI.deductions.getAll(histParams),
    enabled: tab === "history",
  });
  const deductions = histData?.deductions ?? [];

  const createMutation = useAppMutation({
    mutationFn: (data) => salariesAPI.deductions.create(data),
    invalidateKeys: [salariesKeys.all],
    onSuccess: () => {
      toast.success("Ushlab qolish yaratildi");
      setAmount("");
      setReason("");
      setTab("history");
      refetch();
    },
    onError: (err) => toast.error(err.response?.data?.message ?? "Xatolik"),
  });

  const confirmMutation = useAppMutation({
    mutationFn: (id) => salariesAPI.deductions.confirm(id),
    invalidateKeys: [salariesKeys.all],
    onSuccess: () => {
      toast.success("Ushlab qolish tasdiqlandi");
      refetch();
    },
    onError: (err) => toast.error(err.response?.data?.message ?? "Xatolik"),
  });

  const deleteMutation = useAppMutation({
    mutationFn: (id) => salariesAPI.deductions.delete(id),
    invalidateKeys: [salariesKeys.all],
    onSuccess: () => {
      toast.success("O'chirildi");
      refetch();
    },
    onError: (err) => toast.error(err.response?.data?.message ?? "Xatolik"),
  });

  const handleCreate = () => {
    if (!teacher || !amount || !reason || !date || !month) {
      return toast.error("Barcha maydonlarni to'ldiring");
    }
    createMutation.mutate({ teacher, amount: Number(amount), reason, date, month });
  };

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex border-b border-border">
        {[
          { key: "create", label: "Yangi ushlab qolish" },
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
            <div className="sm:col-span-2">
              <label className="field-label mb-1 block text-xs font-medium text-gray-600">O'qituvchi</label>
              <Select
                size="md"
                value={teacher}
                onChange={setTeacher}
                options={teacherOptions}
                placeholder="O'qituvchini tanlang"
              />
            </div>
            <div>
              <label className="field-label mb-1 block text-xs font-medium text-gray-600">Oy</label>
              <Select
                size="md"
                value={month}
                onChange={setMonth}
                options={deductionMonthOptions}
                placeholder="Oyni tanlang"
              />
            </div>
            <InputField
              label="Summa (so'm)"
              type="number"
              min={1}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
            />
            <div className="sm:col-span-2">
              <InputField
                label="Sabab / Izoh"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Masalan: kechikish uchun, jarima..."
              />
            </div>
            <InputField
              label="Sana"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
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
          <p className="text-xs text-muted-foreground">
            Yaratilgandan so'ng admin tasdiqlashi kerak — shundan keyingina oylikdan ayiriladi.
          </p>
        </div>
      )}

      {tab === "history" && (
        <div className="space-y-3">
          <div className="w-full sm:w-56">
            <Select
              size="md"
              value={histTeacher}
              onChange={setHistTeacher}
              options={[{ value: "", label: "Barcha o'qituvchilar" }, ...teacherOptions]}
              placeholder="O'qituvchi"
            />
          </div>
          {deductions.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">Yozuvlar topilmadi</p>
          ) : (
            <div className="border border-border rounded-md divide-y divide-border overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-xs text-muted-foreground">
                    <th className="px-3 py-2 text-left font-medium">O'qituvchi</th>
                    <th className="px-3 py-2 text-left font-medium">Oy</th>
                    <th className="px-3 py-2 text-right font-medium">Summa</th>
                    <th className="px-3 py-2 text-left font-medium">Sabab</th>
                    <th className="px-3 py-2 text-left font-medium">Sana</th>
                    <th className="px-3 py-2 text-left font-medium">Holat</th>
                    <th className="px-3 py-2 text-center font-medium">Amal</th>
                  </tr>
                </thead>
                <tbody>
                  {deductions.map((d) => {
                    const teacherName =
                      typeof d.teacher === "object"
                        ? `${d.teacher.firstName} ${d.teacher.lastName}`
                        : "—";
                    return (
                      <tr key={d._id} className="hover:bg-gray-50">
                        <td className="px-3 py-2 font-medium text-primary whitespace-nowrap">{teacherName}</td>
                        <td className="px-3 py-2 whitespace-nowrap">{formatMonthLabel(d.month)}</td>
                        <td className="px-3 py-2 text-right font-semibold text-red-600 whitespace-nowrap">
                          -{formatMoney(d.amount)}
                        </td>
                        <td className="px-3 py-2 max-w-[160px] truncate text-gray-600">{d.reason}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-gray-500">{formatUzDate(d.date)}</td>
                        <td className="px-3 py-2">
                          <StatusBadge status={d.status} />
                        </td>
                        <td className="px-3 py-2 text-center">
                          <div className="flex items-center justify-center gap-1">
                            {d.status === "pending" && (
                              <button
                                type="button"
                                title="Tasdiqlash"
                                disabled={confirmMutation.isPending}
                                onClick={() => confirmMutation.mutate(d._id)}
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
                                deleteMutation.mutate(d._id);
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

const StatusBadge = ({ status }) => {
  const confirmed = status === "confirmed";
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${
        confirmed ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
      }`}
    >
      {confirmed ? (
        <CheckCircle2 className="size-3" strokeWidth={2} />
      ) : (
        <Clock className="size-3" strokeWidth={2} />
      )}
      {confirmed ? "Tasdiqlangan" : "Kutilmoqda"}
    </span>
  );
};

export default SalaryDeductionModal;
