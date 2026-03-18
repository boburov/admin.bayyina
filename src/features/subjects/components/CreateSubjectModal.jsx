// Toast
import { toast } from "sonner";

// API
import { subjectsAPI } from "@/features/subjects/api/subjects.api";

// Components
import Input from "@/shared/components/form/input";
import Button from "@/shared/components/form/button";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

// Hooks
import useArrayStore from "@/shared/hooks/useArrayStore";
import useObjectState from "@/shared/hooks/useObjectState";

const CreateSubjectModal = () => (
  <ResponsiveModal name="createSubject" title="Yangi fan">
    <Content />
  </ResponsiveModal>
);

const Content = ({ close, isLoading, setIsLoading }) => {
  const { invalidateCache } = useArrayStore("subjects");

  const { name, description, state, setField } = useObjectState({
    name: "",
    description: "",
  });

  const handleCreateSubject = (e) => {
    e.preventDefault();
    setIsLoading(true);

    subjectsAPI
      .create(state)
      .then(() => {
        close();
        invalidateCache();
        toast.success("Fan yaratildi");
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || "Xatolik yuz berdi");
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <form onSubmit={handleCreateSubject} className="space-y-3.5">
      <Input
        required
        name="name"
        value={name}
        label="Fan nomi"
        onChange={(v) => setField("name", v)}
      />

      <Input
        type="textarea"
        name="description"
        value={description}
        label="Tavsif (ixtiyoriy)"
        onChange={(v) => setField("description", v)}
      />

      <div className="flex flex-col-reverse gap-3.5 w-full mt-5 xs:m-0 xs:flex-row xs:justify-end">
        <Button
          type="button"
          className="w-full xs:w-32"
          variant="neutral"
          onClick={close}
        >
          Bekor qilish
        </Button>

        <Button
          autoFocus
          className="w-full xs:w-32"
          variant="primary"
          disabled={isLoading}
        >
          Yaratish
          {isLoading && "..."}
        </Button>
      </div>
    </form>
  );
};

export default CreateSubjectModal;
