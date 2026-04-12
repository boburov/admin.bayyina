// Toast
import { toast } from "sonner";
// API
import { classesAPI } from "@/features/classes/api/classes.api";
import { usersAPI } from "@/features/users/api/users.api";
// TanStack Query
import { useQuery } from "@tanstack/react-query";
// TanStack Query
import { useQueryClient } from "@tanstack/react-query";
// Hooks
import { useRef, useState } from "react";
import useObjectState from "@/shared/hooks/useObjectState";
// Components
import Button from "@/shared/components/ui/button/Button";
import InputField from "@/shared/components/ui/input/InputField";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";
// Data
import { daysOptions } from "../data/classes.data";
// Icons
import { ChevronLeft, ChevronRight, Search } from "lucide-react";

const CreateGroupModal = () => (
  <ResponsiveModal
    name="createClass"
    title="Yangi guruh"
    className="sm:min-h-[520px]"
  >
    <Content />
  </ResponsiveModal>
);

const Content = ({ close, isLoading, setIsLoading }) => {
  const queryClient = useQueryClient();
  const { name, price, setField } = useObjectState({ name: "", price: "" });

  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [selectedDays, setSelectedDays] = useState([]);
  const [time, setTime] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const debounceRef = useRef(null);

  const toggleDay = (value) => {
    setSelectedDays((prev) =>
      prev.includes(value) ? prev.filter((d) => d !== value) : [...prev, value],
    );
  };

  const handleSearchChange = (value) => {
    setSearchInput(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearch(value.trim());
      setPage(1);
    }, 500);
  };

  const { data, isLoading: teachersLoading } = useQuery({
    queryKey: ["teachers", { page, search }],
    queryFn: () =>
      usersAPI
        .getTeachers({ page, limit: 5, search: search || undefined })
        .then((res) => res.data),
    keepPreviousData: true,
  });

  const teachers = data?.users ?? [];
  const totalPages = data?.totalPages ?? 1;

  const handleCreateGroup = (e) => {
    e.preventDefault();
    if (!selectedTeacher) {
      toast.error("O'qituvchini tanlang");
      return;
    }
    if (selectedDays.length === 0) {
      toast.error("Kamida bitta kun tanlang");
      return;
    }
    if (!time) {
      toast.error("Dars boshlanish vaqtini kiriting");
      return;
    }
    setIsLoading(true);
    classesAPI
      .create({
        name,
        price: Number(price),
        teacher: selectedTeacher._id,
        schedule: { days: selectedDays, time },
      })
      .then(() => {
        close();
        queryClient.invalidateQueries({ queryKey: ["classes"] });
        toast.success("Guruh yaratildi");
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || "Xatolik yuz berdi");
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <form onSubmit={handleCreateGroup} className="space-y-3.5">
      <InputField
        required
        name="name"
        value={name}
        maxLength={32}
        label="Guruh nomi"
        placeholder="Matematika 1, Ingliz tili B2, ..."
        onChange={(e) => setField("name", e.target.value)}
      />
      <InputField
        required
        type="number"
        name="price"
        value={price}
        label="Oylik to'lov"
        placeholder="500000"
        onChange={(e) => setField("price", e.target.value)}
      />

      {/* Schedule days */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium">
          Dars kunlari <span className="text-danger">*</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {daysOptions.map((day) => {
            const isActive = selectedDays.includes(day.value);
            return (
              <button
                key={day.value}
                type="button"
                onClick={() => toggleDay(day.value)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                  isActive
                    ? "bg-background-info border-info text-info"
                    : "bg-background-secondary border-border-secondary text-secondary-text hover:border-border-primary"
                }`}
              >
                {day.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Start time */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium">
          Boshlanish vaqti <span className="text-danger">*</span>
        </label>
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-border-secondary rounded-lg bg-background-secondary outline-none focus:border-border-primary transition-colors text-primary"
        />
      </div>

      {/* Teacher selector */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium">
          O'qituvchi <span className="text-danger">*</span>
        </label>

        <div className="border border-border-secondary rounded-lg overflow-hidden bg-background-primary">
          {/* Search */}
          <div className="flex items-center gap-2 px-3 py-2 border-b border-border-secondary">
            <Search
              className="size-4 text-secondary-text shrink-0"
              strokeWidth={1.5}
            />
            <input
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="O'qituvchi qidirish..."
              className="flex-1 text-sm bg-transparent outline-none text-primary placeholder:text-secondary-text"
            />
          </div>

          {/* List */}
          <div className="divide-y divide-border-tertiary">
            {teachersLoading ? (
              <div className="flex justify-center py-6">
                <div className="w-5 h-5 border-2 border-border-secondary border-t-secondary rounded-full animate-spin" />
              </div>
            ) : teachers.length === 0 ? (
              <p className="text-sm text-secondary-text text-center py-6">
                O'qituvchi topilmadi
              </p>
            ) : (
              teachers.map((teacher) => {
                const isSelected = selectedTeacher?._id === teacher._id;
                return (
                  <button
                    key={teacher._id}
                    type="button"
                    onClick={() =>
                      setSelectedTeacher(isSelected ? null : teacher)
                    }
                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                      isSelected
                        ? "bg-background-info"
                        : "hover:bg-background-secondary"
                    }`}
                  >
                    {/* Avatar */}
                    <div className="w-8 h-8 rounded-full bg-background-tertiary flex items-center justify-center text-xs font-semibold text-secondary-text shrink-0">
                      {teacher.firstName[0]}
                      {teacher.lastName[0]}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-primary truncate">
                        {teacher.firstName} {teacher.lastName}
                      </p>
                      <p className="text-xs text-secondary-text">
                        +{teacher.phone}
                      </p>
                    </div>

                    {isSelected && (
                      <svg
                        className="w-4 h-4 text-info shrink-0"
                        viewBox="0 0 16 16"
                        fill="none"
                      >
                        <path
                          d="M3 8L6.5 11.5L13 5"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-3 py-2 border-t border-border-secondary">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1 rounded text-secondary-text hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="size-4" strokeWidth={1.5} />
              </button>

              <span className="text-xs text-secondary-text">
                {page} / {totalPages}
              </span>

              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1 rounded text-secondary-text hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="size-4" strokeWidth={1.5} />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col-reverse gap-3.5 w-full mt-5 xs:m-0 xs:flex-row xs:justify-end">
        <Button
          type="button"
          className="w-full xs:w-32"
          variant="secondary"
          onClick={close}
        >
          Bekor qilish
        </Button>
        <Button
          autoFocus
          className="w-full xs:w-32"
          disabled={isLoading || !selectedTeacher}
        >
          Yaratish{isLoading && "..."}
        </Button>
      </div>
    </form>
  );
};

export default CreateGroupModal;
