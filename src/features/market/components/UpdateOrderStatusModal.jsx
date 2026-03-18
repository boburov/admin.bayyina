// Sonner
import { toast } from "sonner";

// React
import { useState } from "react";

// Hooks
import useModal from "@/shared/hooks/useModal";

// API
import { marketAPI } from "@/features/market/api/market.api";

// Tanstack Query
import { useMutation, useQueryClient } from "@tanstack/react-query";

// Components
import Button from "@/shared/components/ui/button/Button";
import InputField from "@/shared/components/ui/input/InputField";
import SelectField from "@/shared/components/ui/select/SelectField";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

// Data
import { marketOrderUpdateStatusOptions } from "@/features/market/data/market.data";

/**
 * Modal for updating market order status by owner.
 * @returns {JSX.Element} Update order status modal.
 */
const UpdateOrderStatusModal = () => {
  const { data } = useModal("updateMarketOrderStatus");

  return (
    <ResponsiveModal
      name="updateMarketOrderStatus"
      title="Buyurtma holatini o'zgartirish"
      description="Holatni tanlab buyurtmani yakunlang"
    >
      <Content key={data?.sessionId || data?.orderId || "order-status-modal"} />
    </ResponsiveModal>
  );
};

const Content = ({ close, orderId }) => {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState("approved");
  const [rejectReason, setRejectReason] = useState("");

  const updateStatusMutation = useMutation({
    mutationFn: () =>
      marketAPI.updateOrderStatus(orderId, {
        status,
        ...(status === "rejected" ? { rejectReason: rejectReason.trim() } : {}),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["market", "admin", "orders"],
      });
      toast.success("Buyurtma holati yangilandi");
      close();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Xatolik yuz berdi");
    },
  });

  const handleSubmit = (event) => {
    event.preventDefault();

    if (status === "rejected" && rejectReason.trim().length < 3) {
      toast.error("Rad etish sababi majburiy");
      return;
    }

    updateStatusMutation.mutate();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <SelectField
        required
        label="Holat"
        value={status}
        onChange={setStatus}
        triggerClassName="w-full"
        options={marketOrderUpdateStatusOptions}
      />

      {status === "rejected" && (
        <InputField
          required
          label="Sabab"
          name="reason"
          type="textarea"
          value={rejectReason}
          placeholder="Rad etish sababini yozing"
          onChange={(e) => setRejectReason(e.target.value)}
        />
      )}

      <div className="flex flex-col-reverse gap-3.5 w-full xs:m-0 xs:flex-row xs:justify-end">
        <Button
          type="button"
          onClick={close}
          variant="secondary"
          className="w-full xs:w-32"
        >
          Bekor qilish
        </Button>

        <Button
          className="w-full xs:w-32"
          disabled={updateStatusMutation.isPending}
          variant={status === "approved" ? "default" : "danger"}
        >
          Saqlash
        </Button>
      </div>
    </form>
  );
};

export default UpdateOrderStatusModal;
