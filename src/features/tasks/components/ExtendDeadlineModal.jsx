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

const ExtendDeadlineModal = () => (
  <ResponsiveModal name="extendDeadline" title="Muddatni uzaytirish">
    <Content />
  </ResponsiveModal>
);

const Content = ({ close, taskId, currentDueDate }) => {
  const queryClient = useQueryClient();
  const [newDueDate, setNewDueDate] = useState("");
  const [reason, setReason] = useState("");
  const [withPenalty, setWithPenalty] = useState(false);
  const [penaltyPoints, setPenaltyPoints] = useState("1");

  // Minimum yangi muddat: joriy muddatdan 1 daqiqa keyin
  const minDate = currentDueDate
    ? new Date(new Date(currentDueDate).getTime() + 60000)
        .toISOString()
        .slice(0, 16)
    : undefined;

  const mutation = useMutation({
    mutationFn: (data) => tasksAPI.extend(taskId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", "detail", taskId] });
      queryClient.invalidateQueries({ queryKey: ["tasks", "list"] });
      close();
      toast.success("Ijro muddati uzaytirildi");
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newDueDate) {
      toast.error("Yangi ijro muddati majburiy");
      return;
    }
    if (!reason.trim()) {
      toast.error("Sabab majburiy");
      return;
    }
    if (withPenalty && (!penaltyPoints || Number(penaltyPoints) < 1)) {
      toast.error("Jarima bali kamida 1 bo'lishi kerak");
      return;
    }

    const data = { newDueDate, reason, withPenalty };
    if (withPenalty) data.penaltyPoints = Number(penaltyPoints);
    mutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5">
      <InputField
        required
        label="Yangi ijro muddati"
        type="datetime-local"
        value={newDueDate}
        min={minDate}
        onChange={(e) => setNewDueDate(e.target.value)}
      />

      <InputField
        required
        label="Sabab"
        type="textarea"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Muddatni uzaytirish sababini kiriting..."
      />

      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input
          type="checkbox"
          checked={withPenalty}
          onChange={(e) => setWithPenalty(e.target.checked)}
          className="rounded border-gray-300 text-indigo-500 focus:ring-indigo-500"
        />
        Jarima bilan uzaytirish
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
        disabled={mutation.isPending || !newDueDate || !reason.trim()}
        className="w-full"
      >
        O'zgartirish{mutation.isPending && "..."}
      </Button>
    </form>
  );
};

export default ExtendDeadlineModal;
