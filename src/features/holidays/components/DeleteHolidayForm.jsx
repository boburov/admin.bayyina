// Toast
import { toast } from "sonner";

// API
import { holidaysAPI } from "@/shared/api/holidays.api";

// Components
import Button from "@/shared/components/ui/button/Button";

const DeleteHolidayForm = ({
  onSuccess,
  close,
  isLoading,
  setIsLoading,
  ...holiday
}) => {
  const handleDelete = async () => {
    setIsLoading(true);

    try {
      onSuccess();
      await holidaysAPI.delete(holiday._id);
      toast.success("Dam olish kuni o'chirildi");
      close();
    } catch (error) {
      toast.error("O'chirishda xatolik");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-end gap-4">
      <Button variant="secondary" onClick={close}>
        Bekor qilish
      </Button>

      <Button variant="danger" onClick={handleDelete} disabled={isLoading}>
        O'chirish{isLoading && "..."}
      </Button>
    </div>
  );
};

export default DeleteHolidayForm;
