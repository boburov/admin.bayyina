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
import { genderOptions, roleOptions, sourceOptions } from "../data/users.data";

// Hooks
import useObjectState from "@/shared/hooks/useObjectState";

// React
import { useState } from "react";

// Icons
import { Search, School } from "lucide-react";

const CreateUserModal = () => (
  <ResponsiveModal
    name="createUser"
    title="Yangi foydalanuvchi"
    className="sm:max-w-lg"
  >
    <Content />
  </ResponsiveModal>
);

const Content = ({ close, isLoading, setIsLoading }) => {
  const queryClient = useQueryClient();
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [groupSearch, setGroupSearch] = useState("");

  const {
    phone, password, firstName, lastName,
    role, gender, source, age, setField,
  } = useObjectState({
    phone: "",
    password: "",
    firstName: "",
    lastName: "",
    role: "student",
    gender: "",
    source: "",
    age: "",
  });

  const { data: groupsData, isLoading: groupsLoading } = useQuery({
    queryKey: ["classes"],
    queryFn: () => classesAPI.getAll().then((res) => res.data),
  });

  const allGroups = groupsData?.groups ?? [];
  const filteredGroups = allGroups.filter((g) =>
    g.name.toLowerCase().includes(groupSearch.toLowerCase()),
  );

  const handleCreateUser = (e) => {
    e.preventDefault();

    if (role === "student" && selectedGroups.length === 0) {
      toast.error("Kamida bitta guruh tanlang");
      return;
    }

    setIsLoading(true);

    const data = {
      phone: Number(phone.replace(/\D/g, "")),
      password: password?.trim(),
      firstName: firstName?.trim(),
      lastName: lastName?.trim(),
      role,
      gender: gender || null,
      source: source || null,
      age: age ? Number(age) : null,
      groupIds: selectedGroups.map((g) => g._id),
    };

    usersAPI
      .create(data)
      .then(() => {
        close();
        queryClient.invalidateQueries({ queryKey: ["users"] });
        toast.success("Foydalanuvchi yaratildi");
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || "Xatolik yuz berdi");
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <form onSubmit={handleCreateUser} className="space-y-3.5">

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

      {/* Row 2 — Telefon */}
      <Input
        required
        type="tel"
        name="phone"
        label="Telefon raqam"
        value={phone}
        autoComplete="off"
        onChange={(v) => setField("phone", v?.trim())}
      />

      {/* Row 3 — Parol */}
      <Input
        required
        label="Parol"
        minLength={6}
        type="password"
        name="password"
        value={password}
        autoComplete="off"
        onChange={(v) => setField("password", v)}
      />

      {/* Row 4 — Rol / Yosh */}
      <div className="grid grid-cols-2 gap-3">
        <Select
          required
          label="Rol"
          value={role}
          onChange={(v) => {
            setField("role", v);
            setSelectedGroups([]);
          }}
          options={roleOptions}
        />
        <Input
          label="Yosh"
          name="age"
          type="number"
          value={age}
          autoComplete="off"
          onChange={(v) => setField("age", v)}
        />
      </div>

      {/* Row 5 — Jins / Manba */}
      <div className="grid grid-cols-2 gap-3">
        <Select
          label="Jins"
          value={gender}
          placeholder="Tanlang"
          onChange={(v) => setField("gender", v)}
          options={genderOptions}
        />
        <Select
          label="Qayerdan"
          value={source}
          placeholder="Tanlang"
          onChange={(v) => setField("source", v)}
          options={sourceOptions}
        />
      </div>

      {/* Row 6 — Guruhlar (student + teacher) */}
      <div className="flex flex-col gap-1.5">
        <div className="ml-1 flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">
            Guruhlar{role === "student" && <span className="text-blue-500"> *</span>}{role === "teacher" && <span className="text-gray-400 text-xs font-normal"> (ixtiyoriy)</span>}
          </label>
          {selectedGroups.length > 0 && (
            <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
              {selectedGroups.length} ta tanlandi
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
                const isSelected = selectedGroups.some((g) => g._id === group._id);
                return (
                  <button
                    key={group._id}
                    type="button"
                    onClick={() =>
                      setSelectedGroups((prev) =>
                        isSelected
                          ? prev.filter((g) => g._id !== group._id)
                          : [...prev, group],
                      )
                    }
                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                      isSelected ? "bg-blue-50" : "hover:bg-gray-50"
                    }`}
                  >
                    {/* Checkbox */}
                    <div
                      className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? "bg-blue-500 border-blue-500"
                          : "border-gray-300"
                      }`}
                    >
                      {isSelected && (
                        <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 10" fill="none">
                          <path d="M1.5 5L4 7.5L8.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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
          Yaratish{isLoading && "..."}
        </Button>
      </div>
    </form>
  );
};

export default CreateUserModal;
