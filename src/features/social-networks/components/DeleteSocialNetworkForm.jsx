// Toast
import { toast } from "sonner";

// Components
import Button from "@/shared/components/ui/button/Button";

// API
import { socialNetworksAPI } from "@/features/social-networks/api/social-networks.api";

const DeleteSocialNetworkForm = ({
  onSuccess,
  close,
  isLoading,
  setIsLoading,
  ...socialNetwork
}) => {
  const handleDelete = async () => {
    setIsLoading(true);

    try {
      onSuccess();
      await socialNetworksAPI.delete(socialNetwork._id);
      toast.success("Ijtimoiy tarmoq o'chirildi");
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

export default DeleteSocialNetworkForm;
