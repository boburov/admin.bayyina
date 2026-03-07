// Toast
import { toast } from "sonner";

// React
import { useEffect } from "react";

// Tanstack Query
import { useMutation, useQueryClient } from "@tanstack/react-query";

// API
import { penaltiesAPI } from "@/shared/api/penalties.api";

// Components
import Input from "@/shared/components/form/input";
import Button from "@/shared/components/form/button";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

// Hooks
import useObjectState from "@/shared/hooks/useObjectState";

const EditCategoryModal = () => (
  <ResponsiveModal name="editPenaltyCategory" title="Kategoriyani tahrirlash">
    <Content />
  </ResponsiveModal>
);

const Content = ({ close, _id, ...data }) => {
  const queryClient = useQueryClient();
  const { title, description, points, setField, setFields } = useObjectState({
    title: "",
    description: "",
    points: "",
  });

  useEffect(() => {
    if (data.title) {
      setFields({
        title: data.title || "",
        description: data.description || "",
        points: data.points || "",
      });
    }
  }, [_id]);

  const updateMutation = useMutation({
    mutationFn: (payload) => penaltiesAPI.updateCategory(_id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["penalties", "categories"] });
      close();
      toast.success("Kategoriya yangilandi");
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate({ title, description, points: Number(points) });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5">
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
        disabled={updateMutation.isPending}
        className="w-full px-4 text-sm font-medium"
      >
        {updateMutation.isPending ? "Saqlanmoqda..." : "Saqlash"}
      </Button>
    </form>
  );
};

export default EditCategoryModal;
