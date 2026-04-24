// Toast
import { toast } from "sonner";

// React
import { useEffect, useState } from "react";

// TanStack Query
import { useQueryClient } from "@tanstack/react-query";

// API
import { classesAPI } from "@/features/classes/api/classes.api";
import { notificationsAPI } from "@/features/notifications/api/notifications.api";

// Hooks
import useObjectState from "@/shared/hooks/useObjectState";

// Components
import Button from "@/shared/components/ui/button/Button";
import InputGroup from "@/shared/components/ui/input/InputGroup";
import SelectField from "@/shared/components/ui/select/SelectField";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

// Data
import { typeOptions } from "@/features/notifications/data/notifications.data";

const SendNotificationModal = () => (
  <ResponsiveModal name="sendNotification" title="Xabarnoma yuborish">
    <Content />
  </ResponsiveModal>
);

const Content = ({ close, isLoading, setIsLoading }) => {
  const queryClient = useQueryClient();
  const [groups, setGroups] = useState([]);

  const { title, message, group, type, setField, resetState } = useObjectState({
    title:   "",
    message: "",
    group:   "",
    type:    "complaint",
  });

  // Load groups
  useEffect(() => {
    classesAPI
      .getAll()
      .then((res) => setGroups(res.data.groups ?? []))
      .catch(() => toast.error("Guruhlarni yuklashda xato"));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!title.trim())   return toast.warning("Sarlavha kiritilishi kerak");
    if (!message.trim()) return toast.warning("Xabar matni kiritilishi kerak");
    if (!group)          return toast.warning("Guruh tanlanishi kerak");

    setIsLoading(true);

    notificationsAPI
      .send({ group, title: title.trim(), message: message.trim(), type })
      .then(() => {
        toast.success("Xabarnoma yuborildi");
        queryClient.invalidateQueries({ queryKey: ["notifications"] });
        resetState();
        close();
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || "Xatolik yuz berdi");
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <InputGroup as="form" onSubmit={handleSubmit}>
      {/* Title */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-gray-700">
          Sarlavha <span className="text-brown-800">*</span>
        </label>
        <input
          required
          value={title}
          maxLength={120}
          placeholder="Xabarnoma sarlavhasi"
          onChange={(e) => setField("title", e.target.value)}
          className="w-full h-10 px-3 rounded-sm border border-gray-300 bg-white text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-brown-800 transition-colors"
        />
      </div>

      {/* Message */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-gray-700">
          Xabar matni <span className="text-brown-800">*</span>
        </label>
        <textarea
          required
          rows={4}
          value={message}
          maxLength={1000}
          placeholder="Xabar matnini kiriting..."
          onChange={(e) => setField("message", e.target.value)}
          className="w-full px-3 py-2 rounded-sm border border-gray-300 bg-white text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-brown-800 transition-colors resize-none"
        />
        <div className="text-xs text-gray-400 text-right">{message.length}/1000</div>
      </div>

      {/* Group */}
      <SelectField
        required
        label="Guruh"
        value={group}
        placeholder="Guruh tanlang"
        onChange={(v) => setField("group", v)}
        options={groups.map((g) => ({ value: g._id, label: g.name }))}
      />

      {/* Type */}
      <SelectField
        required
        label="Turi"
        value={type}
        onChange={(v) => setField("type", v)}
        options={typeOptions}
      />

      {/* Actions */}
      <div className="flex flex-col-reverse gap-3 w-full mt-2 xs:flex-row xs:justify-end">
        <Button
          type="button"
          variant="secondary"
          onClick={close}
          className="w-full xs:w-32"
        >
          Bekor qilish
        </Button>
        <Button
          type="submit"
          className="w-full xs:w-32"
          disabled={isLoading}
        >
          {isLoading ? "Yuklanmoqda..." : "Yuborish"}
        </Button>
      </div>
    </InputGroup>
  );
};

export default SendNotificationModal;
