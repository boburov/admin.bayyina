// Toast
import { toast } from "sonner";

// React
import { useState } from "react";

// Tanstack Query
import { useMutation, useQueryClient } from "@tanstack/react-query";

// API
import { tasksAPI } from "@/features/tasks/api/tasks.api";

// Components
import Button from "@/shared/components/ui/button/Button";
import InputField from "@/shared/components/ui/input/InputField";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

const StopTaskModal = () => (
  <ResponsiveModal name="stopTask" title="Topshiriqni to'xtatish">
    <Content />
  </ResponsiveModal>
);

const Content = ({ close, taskId, defaultPenaltyPoints }) => {
  const queryClient = useQueryClient();
  const [reason, setReason] = useState("");
  const [withPenalty, setWithPenalty] = useState(false);
  const [penaltyPoints, setPenaltyPoints] = useState(
    String(defaultPenaltyPoints || 1),
  );

  const mutation = useMutation({
    mutationFn: (data) => tasksAPI.stop(taskId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", "detail", taskId] });
      queryClient.invalidateQueries({ queryKey: ["tasks", "list"] });
      close();
      toast.success("Topshiriq to'xtatildi");
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      toast.error("Sabab majburiy");
      return;
    }
    if (withPenalty && (!penaltyPoints || Number(penaltyPoints) < 1)) {
      toast.error("Jarima bali kamida 1 bo'lishi kerak");
      return;
    }

    const data = { reason, withPenalty };
    if (withPenalty) data.penaltyPoints = Number(penaltyPoints);
    mutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5">
      <InputField
        required
        label="To'xtatish sababi"
        type="textarea"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Sababini kiriting..."
      />

      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input
          type="checkbox"
          checked={withPenalty}
          onChange={(e) => setWithPenalty(e.target.checked)}
          className="rounded border-gray-300 text-indigo-500 focus:ring-indigo-500"
        />
        Jarima bilan to'xtatish
      </label>

      {withPenalty && (
        <InputField
          required
          label="Jarima bali"
          type="number"
          min={1}
          value={penaltyPoints}
          onChange={(e) => setPenaltyPoints(e.target.value)}
        />
      )}

      <Button
        type="submit"
        variant="danger"
        disabled={mutation.isPending || !reason.trim()}
        className="w-full"
      >
        {mutation.isPending ? "Saqlanmoqda..." : "To'xtatish"}
      </Button>
    </form>
  );
};

export default StopTaskModal;
