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

const ReviewTaskModal = () => (
  <ResponsiveModal name="reviewTask" title="Topshiriqni ko'rib chiqish">
    <Content />
  </ResponsiveModal>
);

const Content = ({ close, taskId, dueDate }) => {
  const queryClient = useQueryClient();
  const [action, setAction] = useState("approve");
  const [reason, setReason] = useState("");
  const [newDueDate, setNewDueDate] = useState("");

  const isOverdue = dueDate && new Date(dueDate) < new Date();

  const mutation = useMutation({
    mutationFn: (data) =>
      action === "approve"
        ? tasksAPI.approve(taskId, data)
        : tasksAPI.reject(taskId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", "detail", taskId] });
      queryClient.invalidateQueries({ queryKey: ["tasks", "list"] });
      close();
      toast.success(
        action === "approve" ? "Topshiriq tasdiqlandi" : "Topshiriq rad etildi",
      );
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
    if (action === "reject" && isOverdue && !newDueDate) {
      toast.error("Muddati o'tganligi sababli yangi ijro muddati majburiy");
      return;
    }

    const data = { reason };
    if (action === "reject" && newDueDate) data.newDueDate = newDueDate;
    mutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5">
      {/* Action toggle */}
      <div className="flex rounded-lg border border-gray-200 overflow-hidden">
        <button
          type="button"
          onClick={() => setAction("approve")}
          className={`flex-1 py-2 text-sm font-medium transition-colors ${
            action === "approve"
              ? "bg-green-500 text-white"
              : "bg-white text-gray-600 hover:bg-gray-50"
          }`}
        >
          Tasdiqlash
        </button>
        <button
          type="button"
          onClick={() => setAction("reject")}
          className={`flex-1 py-2 text-sm font-medium transition-colors ${
            action === "reject"
              ? "bg-red-500 text-white"
              : "bg-white text-gray-600 hover:bg-gray-50"
          }`}
        >
          Rad etish
        </button>
      </div>

      <InputField
        required
        label="Sabab"
        type="textarea"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Sababini kiriting..."
      />

      {action === "reject" && (
        <InputField
          required={isOverdue}
          label={
            isOverdue
              ? "Yangi ijro muddati (majburiy)"
              : "Yangi ijro muddati (ixtiyoriy)"
          }
          type="datetime-local"
          value={newDueDate}
          onChange={(e) => setNewDueDate(e.target.value)}
          description={
            isOverdue
              ? "Topshiriq muddati o'tganligi sababli yangi muddat belgilash majburiy"
              : undefined
          }
        />
      )}

      <Button
        className="w-full"
        disabled={mutation.isPending || !reason.trim()}
        variant={action === "approve" ? "default" : "danger"}
      >
        {mutation.isPending
          ? "Saqlanmoqda..."
          : action === "approve"
            ? "Tasdiqlash"
            : "Rad etish"}
      </Button>
    </form>
  );
};

export default ReviewTaskModal;
