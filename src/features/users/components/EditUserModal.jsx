// Toast
import { toast } from "sonner";

// API
import { usersAPI } from "@/features/users/api/users.api";
import { classesAPI } from "@/features/classes/api/classes.api";

// TanStack Query
import { useQuery, useQueryClient } from "@tanstack/react-query";

// Components
import Input from "@/shared/components/form/input";
import Select from "@/shared/components/form/select";
import Button from "@/shared/components/form/button";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

// Data
import { genderOptions, sourceOptions } from "../data/users.data";

// Hooks
import useObjectState from "@/shared/hooks/useObjectState";

// React
import { useState } from "react";

// Icons
import { Search, School } from "lucide-react";

const EditUserModal = () => (
  <ResponsiveModal
    name="editUser"
    title="Foydalanuvchini tahrirlash"
    className="sm:max-w-lg"
  >
    <Content />
  </ResponsiveModal>
);

const Content = ({ close, isLoading, setIsLoading, ...user }) => {
  const queryClient = useQueryClient();

  const { firstName, lastName, gender, age, source, telegramId, setField } =
    useObjectState({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      gender: user.gender || "",
      age: user.age || "",
      source: user.source || "",
      telegramId: user.telegramId || "",
    });

  // Pre-populate groups from user data
  const initialGroupIds = user.groupIds ?? user.groups?.map((g) => g._id) ?? [];
  const [selectedGroupIds, setSelectedGroupIds] = useState(initialGroupIds);
  const [groupSearch, setGroupSearch] = useState("");

  const { data: groupsData, isLoading: groupsLoading } = useQuery({
    queryKey: ["classes"],
    queryFn: () => classesAPI.getAll({ limit: 200 }).then((res) => res.data),
  });

  const allGroups = groupsData?.groups ?? [];
  const filteredGroups = allGroups.filter((g) =>
    g.name.toLowerCase().includes(groupSearch.toLowerCase()),
  );

  const toggleGroup = (id) =>
    setSelectedGroupIds((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id],
    );

  const handleEdit = (e) => {
    e.preventDefault();

    if (selectedGroupIds.length === 0) {
      toast.warning("Kamida bitta guruh tanlanishi kerak");
      return;
    }

    setIsLoading(true);

    usersAPI
      .update(user._id, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        gender: gender || null,
        age: age ? Number(age) : null,
        source: source || null,
        telegramId: telegramId.trim() || null,
        groupIds: selectedGroupIds,
      })
      .then(() => {
        close();
        queryClient.invalidateQueries({ queryKey: ["users"] });
        toast.success("Foydalanuvchi tahrirlandi");
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || "Xatolik yuz berdi");
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <form onSubmit={handleEdit} className="space-y-3.5">

      {/* Row 1 — Ism / Familiya */}
      <div className="grid grid-cols-2 gap-3">
        <Input
          required
          label="Ism"
          name="firstName"
          value={firstName}
          autoComplete="off"
          onChange={(v) => setField("firstName", v)}
        />
        <Input
          required
          label="Familiya"
          name="lastName"
          value={lastName}
          autoComplete="off"
          onChange={(v) => setField("lastName", v)}
        />
      </div>

      {/* Row 2 — Yosh / Jins */}
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Yosh"
          name="age"
          type="number"
          value={age}
          autoComplete="off"
          onChange={(v) => setField("age", v)}
        />
        <Select
          label="Jins"
          value={gender}
          placeholder="Tanlang"
          onChange={(v) => setField("gender", v || null)}
          options={genderOptions}
        />
      </div>

      {/* Row 3 — Manba / Telegram ID */}
      <div className="grid grid-cols-2 gap-3">
        <Select
          label="Qayerdan"
          value={source}
          placeholder="Tanlang"
          onChange={(v) => setField("source", v || null)}
          options={sourceOptions}
        />
        <Input
          label="Telegram ID"
          name="telegramId"
          value={telegramId}
          autoComplete="off"
          placeholder="123456789"
          onChange={(v) => setField("telegramId", v)}
        />
      </div>

      {/* Row 4 — Guruhlar */}
      <div className="flex flex-col gap-1.5">
        <div className="ml-1 flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">
            Guruhlar <span className="text-blue-500">*</span>
          </label>
          {selectedGroupIds.length > 0 && (
            <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
              {selectedGroupIds.length} ta tanlandi
            </span>
          )}
        </div>

        <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
          {/* Search */}
          <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-200">
            <Search className="size-4 text-gray-400 shrink-0" strokeWidth={1.5} />
            <input
              value={groupSearch}
              onChange={(e) => setGroupSearch(e.target.value)}
              placeholder="Guruh qidirish..."
              className="flex-1 text-sm bg-transparent outline-none text-gray-800 placeholder:text-gray-400"
            />
          </div>

          {/* List */}
          <div className="max-h-44 overflow-y-auto divide-y divide-gray-100">
            {groupsLoading ? (
              <div className="flex justify-center py-5">
                <div className="w-5 h-5 border-2 border-gray-200 border-t-gray-500 rounded-full animate-spin" />
              </div>
            ) : filteredGroups.length === 0 ? (
              <div className="flex flex-col items-center gap-1.5 py-5 text-gray-400">
                <School className="size-6 opacity-40" strokeWidth={1.5} />
                <p className="text-xs">Guruh topilmadi</p>
              </div>
            ) : (
              filteredGroups.map((group) => {
                const isSelected = selectedGroupIds.includes(group._id);
                return (
                  <button
                    key={group._id}
                    type="button"
                    onClick={() => toggleGroup(group._id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                      isSelected ? "bg-blue-50" : "hover:bg-gray-50"
                    }`}
                  >
                    {/* Checkbox */}
                    <div
                      className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                        isSelected ? "bg-blue-500 border-blue-500" : "border-gray-300"
                      }`}
                    >
                      {isSelected && (
                        <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 10" fill="none">
                          <path
                            d="M1.5 5L4 7.5L8.5 2.5"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {group.name}
                      </p>
                      {group.teacher && (
                        <p className="text-xs text-gray-500 truncate">
                          {group.teacher.firstName} {group.teacher.lastName}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col-reverse gap-3 w-full pt-1 xs:flex-row xs:justify-end">
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
          Yangilash{isLoading && "..."}
        </Button>
      </div>
    </form>
  );
};

export default EditUserModal;
