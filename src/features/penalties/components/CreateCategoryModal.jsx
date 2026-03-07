// Toast
import { toast } from "sonner";

// Tanstack Query
import { useMutation, useQueryClient } from "@tanstack/react-query";

// API
import { penaltiesAPI } from "@/shared/api/penalties.api";

// Data
import { targetRoleOptions } from "../data/penalties.data";

// Components
import Input from "@/shared/components/form/input";
import Select from "@/shared/components/form/select";
import Button from "@/shared/components/form/button";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

// Hooks
import useObjectState from "@/shared/hooks/useObjectState";

const CreateCategoryModal = () => (
  <ResponsiveModal name="createPenaltyCategory" title="Yangi kategoriya">
    <Content />
  </ResponsiveModal>
);

const Content = ({ close }) => {
  const queryClient = useQueryClient();
  const { title, description, points, targetRole, setField } = useObjectState({
    title: "",
    description: "",
    points: "",
    targetRole: "student",
  });

  const createMutation = useMutation({
    mutationFn: (data) => penaltiesAPI.createPenaltyCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["penalties", "categories"] });
      close();
      toast.success("Kategoriya yaratildi");
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!targetRole) return toast.error("Rol tanlanmagan");
    createMutation.mutate({
      title,
      description,
      points: Number(points),
      targetRole,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5">
      <Select
        required
        label="Rol"
        value={targetRole}
        options={targetRoleOptions}
        onChange={(v) => setField("targetRole", v)}
      />

      <Input
        required
        label="Sarlavha"
        value={title}
        onChange={(v) => setField("title", v)}
      />

      <Input
        label="Izoh"
        type="textarea"
        value={description}
        onChange={(v) => setField("description", v)}
      />

      <Input
        required
        label="Ball"
        type="number"
        min={1}
        value={points}
        onChange={(v) => setField("points", v)}
      />

      <Button
        type="submit"
        variant="primary"
        disabled={createMutation.isPending}
        className="w-full px-4 text-sm font-medium"
      >
        {createMutation.isPending ? "Yaratilmoqda..." : "Yaratish"}
      </Button>
    </form>
  );
};

export default CreateCategoryModal;
