// Toast
import { toast } from "sonner";

// API
import { paymentsAPI } from "@/features/payments/api/payments.api";

// Data
import { formatMonthLabel } from "@/features/payments/data/payments.data";

// Hooks
import { useState } from "react";

// Query
import { useQueryClient } from "@tanstack/react-query";

// Components
import Button from "@/shared/components/ui/button/Button";
import InputField from "@/shared/components/ui/input/InputField";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

// Icons
import { User, CalendarDays } from "lucide-react";

const CreatePaymentModal = () => (
  <ResponsiveModal name="createPayment" title="To'lov qo'shish">
    <Content />
  </ResponsiveModal>
);

const Content = ({
  close,
  isLoading,
  setIsLoading,
  enrollmentId,
  studentId,
  studentName,
  studentPhone,
  month,
  defaultAmount,
}) => {
  const qc = useQueryClient();
  const [amount, setAmount] = useState(defaultAmount ? String(defaultAmount) : "");
  const [note, setNote] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!amount || Number(amount) <= 0) {
      toast.error("To'lov summasini kiriting");
      return;
    }

    setIsLoading(true);
    paymentsAPI
      .create({
        enrollment: enrollmentId,
        student: studentId,
        amount: Number(amount),
        month: month?.split("T")[0] ?? month,
        note: note.trim() || undefined,
      })
      .then(() => {
        toast.success("To'lov muvaffaqiyatli qo'shildi");
        qc.invalidateQueries({ queryKey: ["payments"] });
        qc.invalidateQueries({ queryKey: ["group-detail"] });
        close();
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || "Xatolik yuz berdi");
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Student info */}
      <div className="rounded-lg bg-background-secondary border border-border-secondary px-4 py-3 space-y-1.5">
        <div className="flex items-center gap-2 text-sm text-primary">
          <User className="size-4 shrink-0 text-secondary" strokeWidth={1.5} />
          <span className="font-medium">{studentName}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-secondary">
          <CalendarDays className="size-4 shrink-0" strokeWidth={1.5} />
          <span>{formatMonthLabel(month)}</span>
        </div>
        {studentPhone && (
          <p className="text-xs text-secondary pl-6">+{studentPhone}</p>
        )}
      </div>

      {/* Amount */}
      <InputField
        required
        type="number"
        name="amount"
        value={amount}
        label="To'lov summasi (so'm)"
        placeholder="450000"
        min={1}
        onChange={(e) => setAmount(e.target.value)}
      />

      {/* Note */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium">Izoh (ixtiyoriy)</label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Naqd to'landi, karta orqali..."
          rows={2}
          className="w-full px-3 py-2 text-sm border border-border-secondary rounded-lg bg-background-secondary outline-none focus:border-border-primary transition-colors text-primary resize-none"
        />
      </div>

      <div className="flex flex-col-reverse gap-3 xs:flex-row xs:justify-end pt-1">
        <Button type="button" variant="secondary" className="w-full xs:w-32" onClick={() => close()}>
          Bekor qilish
        </Button>
        <Button className="w-full xs:w-32" disabled={isLoading}>
          {isLoading ? "Saqlanmoqda..." : "Saqlash"}
        </Button>
      </div>
    </form>
  );
};

export default CreatePaymentModal;
