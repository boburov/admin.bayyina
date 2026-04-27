// Toast
import { toast } from "sonner";

// React
import { useState, useEffect } from "react";

// API
import { enrollmentsAPI } from "@/features/enrollments/api/enrollments.api";

// Query
import { useQueryClient } from "@tanstack/react-query";

// Components
import Button       from "@/shared/components/ui/button/Button";
import InputField   from "@/shared/components/ui/input/InputField";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

// Icons
import { User, Tag } from "lucide-react";

const SetDiscountModal = () => (
  <ResponsiveModal name="setEnrollmentDiscount" title="Chegirma o'rnatish">
    <Content />
  </ResponsiveModal>
);

const Content = ({
  close,
  isLoading,
  setIsLoading,
  enrollmentId,
  studentName,
  groupName,
  currentDiscount,
  currentDiscountReason,
}) => {
  const qc = useQueryClient();

  const [discount, setDiscount]             = useState(String(currentDiscount ?? 0));
  const [discountReason, setDiscountReason] = useState(currentDiscountReason ?? "");

  useEffect(() => {
    setDiscount(String(currentDiscount ?? 0));
    setDiscountReason(currentDiscountReason ?? "");
  }, [enrollmentId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const discountNum = Math.max(0, Number(discount) || 0);

    setIsLoading(true);
    enrollmentsAPI
      .update(enrollmentId, {
        discount: discountNum,
        discountReason: discountReason.trim() || undefined,
      })
      .then(() => {
        toast.success("Chegirma o'rnatildi");
        qc.invalidateQueries({ queryKey: ["group-detail"] });
        close();
      })
      .catch((err) => toast.error(err.response?.data?.message ?? "Xatolik"))
      .finally(() => setIsLoading(false));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Student + group info */}
      <div className="rounded-lg bg-background-secondary border border-border-secondary px-4 py-3 space-y-1.5">
        <div className="flex items-center gap-2 text-sm text-primary">
          <User className="size-4 shrink-0 text-secondary" strokeWidth={1.5} />
          <span className="font-medium">{studentName}</span>
        </div>
        {groupName && (
          <div className="flex items-center gap-2 text-sm text-secondary">
            <Tag className="size-4 shrink-0" strokeWidth={1.5} />
            <span>{groupName}</span>
          </div>
        )}
      </div>

      {/* Discount amount */}
      <InputField
        type="number"
        min={0}
        label="Chegirma miqdori (so'm)"
        placeholder="50000"
        value={discount}
        onChange={(e) => setDiscount(e.target.value)}
        helperText="0 kiritilsa chegirma bekor qilinadi"
      />

      {/* Reason */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium">Sabab (ixtiyoriy)</label>
        <input
          type="text"
          value={discountReason}
          onChange={(e) => setDiscountReason(e.target.value)}
          placeholder="Imtiyozli o'quvchi, chegirma aksiyasi..."
          className="w-full px-3 py-2 text-sm border border-border-secondary rounded-lg bg-background-secondary outline-none focus:border-border-primary transition-colors text-primary"
        />
      </div>

      <div className="flex flex-col-reverse gap-3 xs:flex-row xs:justify-end pt-1">
        <Button type="button" variant="secondary" className="w-full xs:w-32" onClick={close}>
          Bekor qilish
        </Button>
        <Button className="w-full xs:w-32" disabled={isLoading}>
          {isLoading ? "Saqlanmoqda..." : "Saqlash"}
        </Button>
      </div>
    </form>
  );
};

export default SetDiscountModal;
