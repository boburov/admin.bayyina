// Toast
import { toast } from "sonner";

// TanStack Query
import { useQueryClient } from "@tanstack/react-query";

// API
import { enrollmentsAPI } from "@/features/enrollments/api/enrollments.api";

// Components
import Button          from "@/shared/components/ui/button/Button";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

// Icons
import { GraduationCap } from "lucide-react";

const CompleteEnrollmentModal = () => (
  <ResponsiveModal name="completeEnrollment" title="Kursni tugatish">
    <Content />
  </ResponsiveModal>
);

const Content = ({ close, isLoading, setIsLoading, enrollmentId, studentName, groupName }) => {
  const qc = useQueryClient();

  const handleConfirm = () => {
    setIsLoading(true);
    enrollmentsAPI
      .update(enrollmentId, { status: "completed" })
      .then(() => {
        toast.success(`${studentName} kursi tugallandi`);
        qc.invalidateQueries({ queryKey: ["group-detail"] });
        close();
      })
      .catch((err) => toast.error(err.response?.data?.message || "Xatolik yuz berdi"))
      .finally(() => setIsLoading(false));
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 flex items-start gap-3">
        <GraduationCap className="size-5 text-green-600 shrink-0 mt-0.5" strokeWidth={1.5} />
        <div>
          <p className="text-sm font-medium text-green-900">{studentName}</p>
          <p className="text-xs text-green-700 mt-0.5">{groupName} guruhidan kursni tugatadi</p>
        </div>
      </div>

      <p className="text-sm text-gray-600">
        Ushbu o'quvchini kurs tugatgan deb belgilaysizmi? Bu amalni qaytarib bo'lmaydi.
      </p>

      <div className="flex flex-col-reverse gap-3 xs:flex-row xs:justify-end pt-1">
        <Button type="button" variant="secondary" className="w-full xs:w-32" onClick={() => close()}>
          Bekor qilish
        </Button>
        <Button
          className="w-full xs:w-auto xs:px-[10px] bg-green-700 hover:bg-green-600"
          disabled={isLoading}
          onClick={handleConfirm}
        >
          {isLoading ? "Saqlanmoqda..." : "Tugatildi deb belgilash"}
        </Button>
      </div>
    </div>
  );
};

export default CompleteEnrollmentModal;
