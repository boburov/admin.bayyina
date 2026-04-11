// Toast
import { toast } from "sonner";

// API
import { usersAPI } from "@/features/users/api/users.api";

// TanStack Query
import { useQueryClient } from "@tanstack/react-query";

// Components
import Button from "@/shared/components/form/button";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

const DeleteUserModal = () => (
  <ResponsiveModal
    name="deleteUser"
    title="Foydalanuvchini o'chirish"
    description="Haqiqatdan ham foydalanuvchini o'chirmoqchimisiz?"
  >
    <Content />
  </ResponsiveModal>
);

const Content = ({ close, isLoading, setIsLoading, ...user }) => {
  const queryClient = useQueryClient();

  const handleDeleteUser = (e) => {
    e.preventDefault();
    setIsLoading(true);

    usersAPI
      .delete(user._id)
      .then(() => {
        close();
        queryClient.invalidateQueries({ queryKey: ["users"] });
        toast.success("Foydalanuvchi o'chirildi");
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || "Xatolik yuz berdi");
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <form
      onSubmit={handleDeleteUser}
      className="flex flex-col-reverse gap-3.5 w-full xs:m-0 xs:flex-row xs:justify-end"
    >
      <Button
        type="button"
        onClick={close}
        variant="neutral"
        className="w-full xs:w-32"
      >
        Bekor qilish
      </Button>

      <Button
        autoFocus
        variant="danger"
        disabled={isLoading}
        className="w-full xs:w-32"
      >
        O'chirish
        {isLoading && "..."}
      </Button>
    </form>
  );
};

export default DeleteUserModal;
