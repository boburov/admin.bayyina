// Toast
import { toast } from "sonner";

// Tanstack Query
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// API
import { penaltiesAPI } from "@/shared/api/penalties.api";
import { usersAPI } from "@/shared/api/users.api";

// Components
import Input from "@/shared/components/form/input";
import Combobox from "@/shared/components/form/combobox";
import Button from "@/shared/components/form/button";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

// Hooks
import useObjectState from "@/shared/hooks/useObjectState";

const ReducePenaltyModal = () => (
  <ResponsiveModal
    name="reducePenalty"
    title="Jarima ballini kamaytirish"
    className="max-w-lg"
  >
    <Content />
  </ResponsiveModal>
);

const Content = ({ close }) => {
  const queryClient = useQueryClient();

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ["users", "all"],
    queryFn: () => usersAPI.getAll({ limit: 500 }).then((res) => res.data.data || []),
  });

  const users = (usersData || [])
    .filter((u) => u.role !== "owner" && u.penaltyPoints > 0)
    .map((u) => ({
      label: `${u.firstName}${u.lastName ? ` ${u.lastName}` : ""} (${u.username}) — ${u.penaltyPoints} ball`,
      value: u._id,
      penaltyPoints: u.penaltyPoints,
    }));

  const { userId, points, reason, setField } = useObjectState({
    userId: "",
    points: "",
    reason: "",
  });

  const selectedUser = users.find((u) => u.value === userId) || null;

  const reduceMutation = useMutation({
    mutationFn: (data) => penaltiesAPI.reduce(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["penalties", "list"] });
      close();
      toast.success("Kamaytirish so'rovi yuborildi.");
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    reduceMutation.mutate({ userId, points: Number(points), reason });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5">
      <Combobox
        required
        label="Foydalanuvchi"
        value={userId}
        isLoading={usersLoading}
        placeholder="Foydalanuvchini tanlang..."
        searchPlaceholder="Ism, username bo'yicha qidirish..."
        onChange={(v) => setField("userId", v)}
        options={users}
      />

      {selectedUser && (
        <p className="text-sm text-gray-500">
          Joriy jarima bali:{" "}
          <span className="font-semibold text-red-600">
            {selectedUser.penaltyPoints}
          </span>
        </p>
      )}

      <Input
        required
        label="Kamaytirilayotgan ball"
        type="number"
        min={1}
        max={selectedUser?.penaltyPoints || 999}
        value={points}
        onChange={(v) => setField("points", v)}
      />

      <Input
        required
        label="Sabab"
        type="textarea"
        value={reason}
        onChange={(v) => setField("reason", v)}
      />

      <Button
        type="submit"
        variant="primary"
        disabled={reduceMutation.isPending || !userId || !points || !reason}
        className="w-full px-4 text-sm font-medium"
      >
        {reduceMutation.isPending ? "Kamaytirilmoqda..." : "Kamaytirish"}
      </Button>
    </form>
  );
};

export default ReducePenaltyModal;
