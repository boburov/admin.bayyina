import { toast } from "sonner";
import { useQueryClient, useMutation } from "@tanstack/react-query";

import { marketAPI } from "@/features/market/api/market.api";
import Button from "@/shared/components/ui/button/Button";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

/**
 * Delete product confirmation modal.
 * @returns {JSX.Element} Delete product modal.
 */
const DeleteProductModal = () => (
  <ResponsiveModal
    name="deleteMarketProduct"
    title="Mahsulotni o'chirish"
    description="Haqiqatdan ham ushbu mahsulotni o'chirmoqchimisiz?"
  >
    <Content />
  </ResponsiveModal>
);

const Content = ({ _id, close }) => {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: () => marketAPI.deleteProduct(_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["market", "admin", "products"] });
      toast.success("Mahsulot o'chirildi");
      close();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Xatolik yuz berdi");
    },
  });

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        deleteMutation.mutate();
      }}
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

      <Button
        autoFocus
        variant="danger"
        disabled={deleteMutation.isPending}
        className="w-full xs:w-32"
      >
        O'chirish
        {deleteMutation.isPending && "..."}
      </Button>
    </form>
  );
};

export default DeleteProductModal;
