// Toast
import { toast } from "sonner";

// React
import { useState } from "react";

// Query
import { useQuery, useQueryClient } from "@tanstack/react-query";

// API
import { enrollmentsAPI } from "@/features/enrollments/api/enrollments.api";
import { classesAPI }     from "@/features/classes/api/classes.api";

// Components
import Button         from "@/shared/components/ui/button/Button";
import SelectField    from "@/shared/components/ui/select/SelectField";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

// Icons
import { User } from "lucide-react";

const TransferEnrollmentModal = () => (
  <ResponsiveModal name="transferEnrollment" title="O'quvchini guruhga o'tkazish">
    <Content />
  </ResponsiveModal>
);

const Content = ({
  close,
  isLoading,
  setIsLoading,
  enrollmentId,
  studentName,
  currentGroupId,
  studentId,
  discount,
  discountReason,
  paymentDay,
  debt,
  balance,
}) => {
  const qc = useQueryClient();
  const [targetGroupId, setTargetGroupId] = useState("");

  const { data: groupsData, isLoading: groupsLoading } = useQuery({
    queryKey: ["all-groups-for-transfer"],
    queryFn: () => classesAPI.getAll({ limit: 200 }).then((res) => res.data),
    enabled: true,
  });

  const allGroups = (groupsData?.groups ?? [])
    .filter((g) => g._id !== currentGroupId)
    .map((g) => ({ value: g._id, label: g.name }));

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!targetGroupId) {
      toast.error("Guruh tanlang");
      return;
    }

    setIsLoading(true);
    enrollmentsAPI
      .delete(enrollmentId)
      .then(() =>
        enrollmentsAPI.create({
          student: studentId,
          group:   targetGroupId,
          ...(discount      != null && { discount }),
          ...(discountReason        && { discountReason }),
          ...(paymentDay    != null && { paymentDay }),
          ...(debt          != null && { debt }),
          ...(balance       != null && { balance }),
        })
      )
      .then(() => {
        toast.success("O'quvchi muvaffaqiyatli o'tkazildi");
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
      <div className="rounded-lg bg-background-secondary border border-border-secondary px-4 py-3">
        <div className="flex items-center gap-2 text-sm text-primary">
          <User className="size-4 shrink-0 text-secondary" strokeWidth={1.5} />
          <span className="font-medium">{studentName}</span>
        </div>
      </div>

      <SelectField
        label="Yangi guruh"
        required
        value={targetGroupId}
        options={allGroups}
        onChange={setTargetGroupId}
        placeholder={groupsLoading ? "Yuklanmoqda..." : "Guruh tanlang"}
        disabled={groupsLoading}
        searchable
      />

      <div className="flex flex-col-reverse gap-3 xs:flex-row xs:justify-end pt-1">
        <Button type="button" variant="secondary" className="w-full xs:w-32" onClick={close}>
          Bekor qilish
        </Button>
        <Button className="w-full xs:w-32" disabled={isLoading || !targetGroupId}>
          {isLoading ? "O'tkazilmoqda..." : "O'tkazish"}
        </Button>
      </div>
    </form>
  );
};

export default TransferEnrollmentModal;
