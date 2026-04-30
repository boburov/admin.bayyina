// Toast
import { toast } from "sonner";

// API
import { usersAPI }       from "@/features/users/api/users.api";
import { classesAPI }     from "@/features/classes/api/classes.api";
import { salariesAPI }    from "@/features/salaries/api/salaries.api";
import { enrollmentsAPI } from "@/features/enrollments/api/enrollments.api";

// TanStack Query
import { useQuery, useQueryClient } from "@tanstack/react-query";

// Components
import Input           from "@/shared/components/form/input";
import Select          from "@/shared/components/form/select";
import Button          from "@/shared/components/form/button";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

// Data
import { genderOptions, roleOptions } from "../data/users.data";
import { monthOptions, salariesKeys } from "@/features/salaries/data/salaries.data";

// Settings hooks
import { useLeadSources } from "@/features/settings/hooks/useLeadSources";

// Hooks
import useObjectState from "@/shared/hooks/useObjectState";

// React
import { useState } from "react";

// Icons
import { Search, School, ChevronDown, ChevronUp } from "lucide-react";

const CreateUserModal = () => (
  <ResponsiveModal
    name="createUser"
    title="Yangi foydalanuvchi"
    className="sm:max-w-lg"
  >
    <Content />
  </ResponsiveModal>
);

const Content = ({ close, isLoading, setIsLoading, defaultRole }) => {
  const queryClient = useQueryClient();
  const [selectedGroups,  setSelectedGroups]  = useState([]);
  const [groupSearch,     setGroupSearch]     = useState("");
  const [discount,        setDiscount]        = useState("");
  const [discountReason,  setDiscountReason]  = useState("");

  // Salary section state
  const [salaryOpen,      setSalaryOpen]      = useState(false);
  const [salaryMonth,     setSalaryMonth]      = useState(monthOptions[1]?.value ?? "");
  const [salaryAmount,    setSalaryAmount]     = useState("");
  const [salaryBonus,     setSalaryBonus]      = useState("");
  const [salaryDeduction, setSalaryDeduction]  = useState("");
  const [salaryNote,      setSalaryNote]       = useState("");

  const {
    phone, password, firstName, lastName,
    role, gender, source, age, setField,
  } = useObjectState({
    phone: "",
    password: "",
    firstName: "",
    lastName: "",
    role: defaultRole ?? "student",
    gender: "",
    source: "",
    age: "",
  });

  const { sources } = useLeadSources();

  const { data: groupsData, isLoading: groupsLoading } = useQuery({
    queryKey: ["classes"],
    queryFn: () => classesAPI.getAll({ limit: 200 }).then((res) => res.data),
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
      .then((res) => {
        const newUserId = res.data?.user?._id ?? res.data?._id;
        queryClient.invalidateQueries({ queryKey: ["users"] });

        // Salary creation — only for teachers when section is open
        if (role === "teacher" && salaryOpen && newUserId && salaryMonth) {
          return salariesAPI
            .create({
              teacher:   newUserId,
              month:     salaryMonth,
              amount:    salaryAmount    ? Number(salaryAmount)    : undefined,
              bonus:     salaryBonus     ? Number(salaryBonus)     : 0,
              deduction: salaryDeduction ? Number(salaryDeduction) : 0,
              note:      salaryNote.trim() || undefined,
            })
            .then(() => {
              queryClient.invalidateQueries({ queryKey: salariesKeys.all });
              toast.success("O'qituvchi va oylik yaratildi");
            })
            .catch(() => {
              toast.success("O'qituvchi yaratildi");
              toast.error("Oylik yaratishda xatolik");
            });
        }

        toast.success("Foydalanuvchi yaratildi");
      })
      .then(() => close())
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
        {!defaultRole ? (
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
        ) : (
          <Input
            label="Rol"
            value={defaultRole === "teacher" ? "O'qituvchi" : defaultRole === "student" ? "O'quvchi" : defaultRole}
            disabled
          />
        )}
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
          options={sources.map((s) => ({ value: s.name, label: s.name }))}
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

      {/* Salary section — only for teachers */}
      {role === "teacher" && (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <button
            type="button"
            onClick={() => setSalaryOpen((o) => !o)}
            className="w-full flex items-center justify-between px-3.5 py-2.5 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <span>Oylik ham yaratish</span>
            {salaryOpen
              ? <ChevronUp className="size-4 text-gray-400" strokeWidth={1.5} />
              : <ChevronDown className="size-4 text-gray-400" strokeWidth={1.5} />}
          </button>

          {salaryOpen && (
            <div className="px-3.5 py-3 space-y-3">
              <Select
                size="md"
                label="Oy"
                value={salaryMonth}
                onChange={setSalaryMonth}
                options={monthOptions}
                placeholder="Oy tanlang"
              />
              <Input
                label="Oylik miqdori (so'm)"
                name="salaryAmount"
                type="number"
                min={0}
                value={salaryAmount}
                onChange={(v) => setSalaryAmount(v)}
                placeholder="Guruhdan avtomatik hisoblanadi"
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Bonus (so'm)"
                  name="salaryBonus"
                  type="number"
                  min={0}
                  value={salaryBonus}
                  onChange={(v) => setSalaryBonus(v)}
                  placeholder="0"
                />
                <Input
                  label="Jarima (so'm)"
                  name="salaryDeduction"
                  type="number"
                  min={0}
                  value={salaryDeduction}
                  onChange={(v) => setSalaryDeduction(v)}
                  placeholder="0"
                />
              </div>
              <Input
                label="Izoh"
                name="salaryNote"
                value={salaryNote}
                onChange={(v) => setSalaryNote(v)}
                placeholder="Ixtiyoriy"
              />
              <p className="text-xs text-gray-400">
                Oylik miqdorini kiritmesangiz, guruhlar bo'yicha avtomatik hisoblanadi.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col-reverse gap-3 w-full pt-1 xs:flex-row xs:justify-end">
        <Button
          type="button"
          className="w-full xs:w-32"
          variant="neutral"
          onClick={() => close()}
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
