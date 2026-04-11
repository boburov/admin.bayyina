// Toast
import { toast } from "sonner";

// API
import { classesAPI } from "@/features/classes/api/classes.api";

// TanStack Query
import { useQueryClient } from "@tanstack/react-query";
// Hooks
import useObjectState from "@/shared/hooks/useObjectState";

// Components
import Button from "@/shared/components/ui/button/Button";
import InputField from "@/shared/components/ui/input/InputField";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

const EditClassModal = () => (
  <ResponsiveModal name="editClass" title="Sinfni tahrirlash">
    <Content />
  </ResponsiveModal>
);

const Content = ({ close, isLoading, setIsLoading, ...classData }) => {
  const queryClient = useQueryClient();

  const { name, setField } = useObjectState({
    name: classData.name || "",
  });

  const handleEditClass = (e) => {
    e.preventDefault();
    setIsLoading(true);

    classesAPI
      .update(classData._id, { name })
      .then(() => {
        close();
        queryClient.invalidateQueries({ queryKey: ["classes"] });
        toast.success("Guruh tahrirlandi");
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || "Xatolik yuz berdi");
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <form onSubmit={handleEditClass} className="space-y-3.5">
      <InputField
        required
        name="name"
        value={name}
        maxLength={32}
        label="Sinf nomi"
        placeholder="1-A, 3-C, ..."
        onChange={(e) => setField("name", e.target.value)}
      />

      <div className="flex flex-col-reverse gap-3.5 w-full mt-5 xs:m-0 xs:flex-row xs:justify-end">
        <Button
          type="button"
          className="w-full xs:w-32"
          variant="secondary"
          onClick={close}
        >
          Bekor qilish
        </Button>

        <Button autoFocus className="w-full xs:w-32" disabled={isLoading}>
          Yangilash
          {isLoading && "..."}
        </Button>
      </div>
    </form>
  );
};

export default EditClassModal;
