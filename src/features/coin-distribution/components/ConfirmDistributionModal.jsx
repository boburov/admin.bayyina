// Toast
import { toast } from "sonner";

// Components
import Button from "@/shared/components/ui/button/Button";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

// API
import { coinDistributionAPI } from "@/features/coin-distribution/api/coin-distribution.api";

const ConfirmDistributionModal = () => (
  <ResponsiveModal
    title="Tanga tarqatish"
    name="confirmDistribution"
    description="Haqiqatdan ham amalani bajarmoqchimisiz?"
  >
    <Content />
  </ResponsiveModal>
);

const Content = ({
  close,
  action,
  amount,
  reason,
  onSuccess,
  isLoading,
  filterType,
  filterValue,
  setIsLoading,
}) => {
  const actionLabel = action === "give" ? "beriladi" : "olinadi";

  const handleConfirm = (e) => {
    e.preventDefault();
    setIsLoading(true);

    coinDistributionAPI
      .distribute({ action, amount, reason, filterType, filterValue })
      .then((res) => {
        const { data } = res.data;
        let message = `${data.successCount} ta foydalanuvchiga tanga ${actionLabel}`;
        if (data.skippedCount > 0) {
          message += `. ${data.skippedCount} ta o'tkazib yuborildi (balans yetarli emas)`;
        }
        toast.success(message);
        close();
        onSuccess?.();
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || "Xatolik yuz berdi");
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <form
      onSubmit={handleConfirm}
      className="flex flex-col-reverse gap-3.5 w-full xs:m-0 xs:flex-row xs:justify-end"
    >
      <Button
        type="button"
        onClick={close}
        variant="secondary"
        className="w-full xs:w-32"
      >
        Bekor qilish
      </Button>

      <Button autoFocus disabled={isLoading} className="w-full xs:w-32">
        Tasdiqlash
        {isLoading && "..."}
      </Button>
    </form>
  );
};

export default ConfirmDistributionModal;
