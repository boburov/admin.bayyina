// Toast
import { toast } from "sonner";

// React
import { useState, useMemo } from "react";

// Query
import { useQueryClient } from "@tanstack/react-query";

// API
import { paymentsAPI } from "@/features/payments/api/payments.api";

// Data
import { formatMonthLabel } from "@/features/payments/data/payments.data";

// Utils
import { formatMoney } from "@/shared/utils/formatNumber";

// Components
import Button           from "@/shared/components/ui/button/Button";
import InputField       from "@/shared/components/ui/input/InputField";
import ResponsiveModal  from "@/shared/components/ui/ResponsiveModal";

// Icons
import { User, CalendarDays, AlertTriangle, CheckCircle } from "lucide-react";

const MarkPaymentPaidModal = () => (
  <ResponsiveModal name="markPaymentPaid" title="To'lovni tasdiqlash">
    <Content />
  </ResponsiveModal>
);

const Content = ({
  close,
  isLoading,
  setIsLoading,
  _id: paymentId,
  amount: requiredAmount,
  month,
  studentName,
  studentPhone,
  totalDebt,
  refetchKeys,
}) => {
  const qc = useQueryClient();
  const [amount, setAmount] = useState(String(requiredAmount ?? ""));
  const [note,   setNote]   = useState("");

  const paid     = Number(amount) || 0;
  const required = Number(requiredAmount) || 0;
  const shortage = paid > 0 && paid < required ? required - paid : 0;
  const overpaid = paid > required ? paid - required : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!paid || paid <= 0) { toast.error("Miqdor kiriting"); return; }

    setIsLoading(true);
    try {
      await paymentsAPI.update(paymentId, {
        status: "paid",
        amount: paid,
        ...(note.trim() && { note: note.trim() }),
      });

      // invalidate caller-supplied keys + generic payments
      const keys = Array.isArray(refetchKeys) ? refetchKeys : [];
      keys.forEach((k) => qc.invalidateQueries({ queryKey: k }));
      qc.invalidateQueries({ queryKey: ["payments"] });
      qc.invalidateQueries({ queryKey: ["enrollments"] });

      toast.success("To'lov amalga oshirildi");
      close();
    } catch (err) {
      toast.error(err.response?.data?.message || "Xatolik yuz berdi");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      {/* Info card */}
      <div className="rounded-lg bg-gray-50 border border-gray-200 px-4 py-3 space-y-1.5">
        {studentName && (
          <div className="flex items-center gap-2 text-sm text-gray-800">
            <User className="size-4 shrink-0 text-gray-400" strokeWidth={1.5} />
            <span className="font-medium">{studentName}</span>
            {studentPhone && <span className="text-gray-400 text-xs">· +{studentPhone}</span>}
          </div>
        )}
        {month && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <CalendarDays className="size-4 shrink-0 text-gray-400" strokeWidth={1.5} />
            <span>{formatMonthLabel(month)}</span>
            <span className="ml-auto text-xs text-gray-500 font-medium">
              Kerak: <strong className="text-gray-800">{formatMoney(required)}</strong>
            </span>
          </div>
        )}
        {totalDebt > 0 && (
          <p className="text-xs text-red-600 pt-0.5">
            Umumiy qarz: <strong>{formatMoney(totalDebt)}</strong>
          </p>
        )}
      </div>

      {/* Amount input */}
      <InputField
        required
        type="number"
        name="amount"
        label="To'lov summasi (so'm)"
        value={amount}
        placeholder={String(required)}
        min={1}
        onChange={(e) => setAmount(e.target.value)}
      />

      {/* Shortage warning */}
      {shortage > 0 && (
        <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800">
          <AlertTriangle className="size-3.5 shrink-0 mt-0.5 text-amber-500" strokeWidth={1.5} />
          <span>
            <strong>{formatMoney(shortage)}</strong> yetmaydi.
            Qolgan qarz {formatMoney(shortage)} sifatida qayd etiladi.
          </span>
        </div>
      )}

      {/* Overpaid info */}
      {overpaid > 0 && (
        <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-blue-50 border border-blue-200 text-xs text-blue-800">
          <CheckCircle className="size-3.5 shrink-0 mt-0.5 text-blue-500" strokeWidth={1.5} />
          <span>
            <strong>{formatMoney(overpaid)}</strong> ortiqcha — balansga o'tadi.
          </span>
        </div>
      )}

      {/* Note */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">Izoh (ixtiyoriy)</label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Naqd, karta orqali..."
          rows={2}
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white outline-none focus:border-blue-400 transition-colors resize-none"
        />
      </div>

      {/* Actions */}
      <div className="flex flex-col-reverse gap-3 xs:flex-row xs:justify-end pt-1">
        <Button type="button" variant="neutral" className="w-full xs:w-32" onClick={() => close()}>
          Bekor qilish
        </Button>
        <Button className="w-full xs:w-32" disabled={isLoading}>
          {isLoading ? "Saqlanmoqda..." : "Tasdiqlash"}
        </Button>
      </div>
    </form>
  );
};

export default MarkPaymentPaidModal;
