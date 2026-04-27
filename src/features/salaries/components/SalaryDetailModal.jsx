// Toast
import { toast } from "sonner";

// React
import { useState, useEffect } from "react";

// API
import { salariesAPI } from "@/features/salaries/api/salaries.api";

// Data
import {
  salariesKeys,
  formatMonthLabel,
} from "@/features/salaries/data/salaries.data";

// Hooks
import useModal from "@/shared/hooks/useModal";

// Query
import { useQueryClient } from "@tanstack/react-query";

// Components
import Button from "@/shared/components/ui/button/Button";
import InputField from "@/shared/components/ui/input/InputField";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

// Utils
import { formatUzDate } from "@/shared/utils/formatDate";

const SalaryDetailModal = () => (
  <ResponsiveModal
    name="salaryDetail"
    title="Oylik tafsiloti"
    className="max-w-lg"
  >
    <Content />
  </ResponsiveModal>
);

const Content = ({ close, isLoading, setIsLoading, salary }) => {
  const qc = useQueryClient();

  const [bonus, setBonus] = useState(salary?.bonus ?? 0);
  const [deduction, setDeduction] = useState(salary?.deduction ?? 0);
  const [note, setNote] = useState(salary?.note ?? "");

  useEffect(() => {
    if (salary) {
      setBonus(salary.bonus ?? 0);
      setDeduction(salary.deduction ?? 0);
      setNote(salary.note ?? "");
    }
  }, [salary?._id]);

  if (!salary) return null;

  const handleDelete = () => {
    if (!window.confirm("Bu oylikni o'chirishni tasdiqlaysizmi?")) return;
    setIsLoading(true);
    salariesAPI
      .delete(salary._id)
      .then(() => {
        toast.success("Oylik o'chirildi");
        qc.invalidateQueries({ queryKey: salariesKeys.all });
        close();
      })
      .catch((err) => toast.error(err.response?.data?.message ?? "Xatolik"))
      .finally(() => setIsLoading(false));
  };

  const handleSave = () => {
    setIsLoading(true);
    salariesAPI
      .update(salary._id, {
        bonus: Number(bonus),
        deduction: Number(deduction),
        note: note.trim() || undefined,
      })
      .then(() => {
        toast.success("Oylik yangilandi");
        qc.invalidateQueries({ queryKey: salariesKeys.all });
        close();
      })
      .catch((err) => toast.error(err.response?.data?.message ?? "Xatolik"))
      .finally(() => setIsLoading(false));
  };

  const handlePay = () => {
    setIsLoading(true);
    salariesAPI
      .pay(salary._id)
      .then(() => {
        toast.success("Oylik to'landi");
        qc.invalidateQueries({ queryKey: salariesKeys.all });
        close();
      })
      .catch((err) => toast.error(err.response?.data?.message ?? "Xatolik"))
      .finally(() => setIsLoading(false));
  };

  const teacherName =
    typeof salary.teacher === "object"
      ? `${salary.teacher.firstName} ${salary.teacher.lastName}`
      : "O'qituvchi";

  const isPaid = salary.status === "paid";

  return (
    <div className="space-y-5">
      {/* Meta */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-900">{teacherName}</p>
          <p className="text-xs text-gray-400 mt-0.5">
            {formatMonthLabel(salary.month)}
          </p>
        </div>
        <StatusBadge status={salary.status} />
      </div>
      {/* Groups breakdown */}
      {salary.groups?.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">
            Guruhlar bo'yicha
          </p>
          <div className="border border-gray-200 divide-y divide-gray-100 rounded-md">
            {salary.groups.map((g, i) => (
              <div
                key={i}
                className="flex items-start justify-between px-3 py-2.5 gap-2"
              >
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {g.groupName}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {g.salaryType === "percentage"
                      ? `${g.salaryValue}%`
                      : g.salaryType === "fixed"
                        ? `Belgilangan: ${g.salaryValue?.toLocaleString()} so'm`
                        : `${g.salaryValue?.toLocaleString()} so'm/talaba`}
                    {" · "}
                    {g.paidStudentsCount}/{g.studentCount} to'lagan
                  </p>
                </div>
                <p className="text-sm font-semibold text-gray-900 whitespace-nowrap">
                  {g.amount?.toLocaleString()} so'm
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Totals summary */}
      <div className="bg-gray-50 border border-gray-200 rounded-md px-4 py-3 space-y-1.5 text-sm">
        <Row
          label="Hisoblangan"
          value={`${salary.totalAmount?.toLocaleString()} so'm`}
        />
        {salary.bonus > 0 && (
          <Row
            label="Bonus"
            value={`+${salary.bonus?.toLocaleString()} so'm`}
            green
          />
        )}
        {salary.deduction > 0 && (
          <Row
            label="Jarima"
            value={`-${salary.deduction?.toLocaleString()} so'm`}
            red
          />
        )}
        <div className="border-t border-gray-200 pt-1.5">
          <Row
            label="Sof to'lov"
            value={`${salary.netAmount?.toLocaleString()} so'm`}
            bold
          />
        </div>
        {isPaid && salary.paidAt && (
          <Row label="To'langan sana" value={formatUzDate(salary.paidAt)} />
        )}
        {salary.note && (
          <p className="text-xs text-gray-500 mt-1 italic">"{salary.note}"</p>
        )}
      </div>
      {/* Edit fields — only if pending */}
      {!isPaid && (
        <div className="grid grid-cols-2 gap-3">
          <InputField
            label="Bonus (so'm)"
            type="number"
            min={0}
            value={bonus}
            onChange={(e) => setBonus(e.target.value)}
          />
          <InputField
            label="Jarima (so'm)"
            type="number"
            min={0}
            value={deduction}
            onChange={(e) => setDeduction(e.target.value)}
          />
          <div className="col-span-2">
            <InputField
              label="Izoh"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ixtiyoriy"
            />
          </div>
        </div>
      )}
      {/* Actions */}
      <div className="flex gap-2 pt-1">
        {!isPaid && (
          <>
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleSave}
              disabled={isLoading}
            >
              Saqlash
            </Button>
            <Button className="flex-1" onClick={handlePay} disabled={isLoading}>
              To'landi
            </Button>
          </>
        )}
        <Button
          variant="danger"
          className="shrink-0 px-3"
          onClick={handleDelete}
          disabled={isLoading}
        >
          O'chirish
        </Button>
      </div>
      )
    </div>
  );
};

const Row = ({ label, value, bold, green, red }) => (
  <div
    className={`flex justify-between ${bold ? "font-semibold text-gray-900" : "text-gray-600"}`}
  >
    <span>{label}</span>
    <span className={green ? "text-green-600" : red ? "text-red-500" : ""}>
      {value}
    </span>
  </div>
);

const StatusBadge = ({ status }) => {
  const paid = status === "paid";
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full ${
        paid ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
      }`}
    >
      {paid ? "To'langan" : "Kutilmoqda"}
    </span>
  );
};

export default SalaryDetailModal;
