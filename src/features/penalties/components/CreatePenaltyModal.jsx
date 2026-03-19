// Toast
import { toast } from "sonner";

// React
import { useState, useEffect } from "react";

// Hooks
import useObjectState from "@/shared/hooks/useObjectState";

// API
import { usersAPI } from "@/features/users/api/users.api";
import { penaltiesAPI } from "@/features/penalties/api/penalties.api";

// Components
import Combobox from "@/shared/components/form/combobox";
import Button from "@/shared/components/ui/button/Button";
import InputField from "@/shared/components/ui/input/InputField";
import SelectField from "@/shared/components/ui/select/SelectField";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

// Tanstack Query
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const CreatePenaltyModal = () => (
  <ResponsiveModal name="createPenalty" title="Jarima yozish">
    <Content />
  </ResponsiveModal>
);

const Content = ({ close }) => {
  const queryClient = useQueryClient();

  const {
    userId,
    categoryId,
    title,
    description,
    points,
    isCustom,
    state,
    setField,
  } = useObjectState({
    userId: "",
    categoryId: "",
    title: "",
    description: "",
    points: "",
    isCustom: false,
  });

  const [files, setFiles] = useState(null);

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ["users", "all"],
    queryFn: () =>
      usersAPI.getAll({ limit: 500 }).then((res) => res.data.data || []),
  });

  const users = (usersData || [])
    .filter((u) => u.role !== "owner")
    .map((u) => ({
      label: `${u.firstName}${u.lastName ? ` ${u.lastName}` : ""} (${u.username}) — ${u.role === "teacher" ? "O'qituvchi" : "O'quvchi"}`,
      value: u._id,
      role: u.role,
    }));

  const selectedUserRole = users.find((u) => u.value === userId)?.role;

  const { data: categoriesData } = useQuery({
    queryKey: ["penalties", "categories", selectedUserRole],
    queryFn: () =>
      penaltiesAPI
        .getCategories({ targetRole: selectedUserRole })
        .then((res) => res.data.data || []),
    enabled: !!selectedUserRole,
  });

  const categories = (categoriesData || []).map((c) => ({
    label: `${c.title} (${c.points} ball)`,
    value: c._id,
    points: c.points,
    title: c.title,
    description: c.description,
  }));

  // Kategoriya tanlanganda points va title ni avtomatik to'ldirish
  useEffect(() => {
    if (!isCustom && categoryId) {
      const cat = categories.find((c) => c.value === categoryId);
      if (cat) {
        setField("points", cat.points);
        setField("title", cat.title);
      }
    }
  }, [categoryId]);

  const createMutation = useMutation({
    mutationFn: (formData) => penaltiesAPI.create(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["penalties", "list"] });
      close();
      toast.success("Jarima yozildi");
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("userId", userId);
    formData.append("isCustom", isCustom);
    if (isCustom) {
      formData.append("title", title);
      formData.append("points", points);
    } else {
      formData.append("categoryId", categoryId);
    }
    if (description) formData.append("description", description);
    if (files) {
      for (const file of files) formData.append("files", file);
    }
    createMutation.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5">
      <Combobox
        required
        value={userId}
        options={users}
        label="Foydalanuvchi"
        isLoading={usersLoading}
        placeholder="Foydalanuvchini tanlang..."
        onChange={(value) => setField("userId", value)}
        searchPlaceholder="Ism, username bo'yicha qidirish..."
      />

      {userId && (
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={isCustom}
              onChange={(e) => setField("isCustom", e.target.checked)}
              className="rounded border-gray-300 text-indigo-500 focus:ring-indigo-500"
            />
            Maxsus jarima
          </label>
        </div>
      )}

      {userId && !isCustom && (
        <SelectField
          required
          label="Kategoriya"
          value={categoryId}
          options={categories}
          placeholder="Tanlang..."
          onChange={(v) => setField("categoryId", v)}
        />
      )}

      {userId && isCustom && (
        <>
          <InputField
            required
            label="Sarlavha"
            value={title}
            onChange={(e) => setField("title", e.target.value)}
          />

          <InputField
            required
            label="Ball"
            type="number"
            min={1}
            value={points}
            onChange={(e) => setField("points", e.target.value)}
          />

          <InputField
            label="Izoh"
            type="textarea"
            value={description}
            onChange={(e) => setField("description", e.target.value)}
          />
        </>
      )}

      {userId && (
        <InputField
          multiple
          type="file"
          label="Fayllar (rasm/video)"
          accept="image/*,video/mp4,video/webm"
          onChange={(e) => setFiles(e.target.files)}
        />
      )}

      <Button variant="danger" disabled={createMutation.isPending || !userId}>
        Yozish{createMutation.isPending && "..."}
      </Button>
    </form>
  );
};

export default CreatePenaltyModal;
