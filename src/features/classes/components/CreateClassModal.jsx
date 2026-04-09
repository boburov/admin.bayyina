// Toast
import { toast } from "sonner";
// API
import { classesAPI } from "@/features/classes/api/classes.api";
import { usersAPI } from "@/features/users/api/users.api";
// Hooks
import { useEffect, useRef, useState } from "react";
import useArrayStore from "@/shared/hooks/useArrayStore";
import useObjectState from "@/shared/hooks/useObjectState";
// Components
import Button from "@/shared/components/ui/button/Button";
import InputField from "@/shared/components/ui/input/InputField";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

const CreateGroupModal = () => (
  <ResponsiveModal name="createGroup" title="Yangi guruh">
    <Content />
  </ResponsiveModal>
);

const Content = ({ close, isLoading, setIsLoading }) => {
  const { invalidateCache } = useArrayStore("classes");
  const { name, price, setField } = useObjectState({ name: "", price: "" });

  // Teacher state
  const [teachers, setTeachers] = useState([]);
  const [teachersLoading, setTeachersLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Fetch teachers once on mount
  useEffect(() => {
    usersAPI
      .getTeachers({ limit: 100 })
      .then((res) => setTeachers(res.data?.users || []))
      .catch(() => toast.error("O'qituvchilar yuklanmadi"))
      .finally(() => setTeachersLoading(false));
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = teachers.filter((t) =>
    `${t.firstName} ${t.lastName}`.toLowerCase().includes(search.toLowerCase()),
  );

  const handleCreateGroup = (e) => {
    e.preventDefault();
    if (!selectedTeacher) {
      toast.error("O'qituvchini tanlang");
      return;
    }
    setIsLoading(true);
    classesAPI
      .create({ name, price: Number(price), teacher: selectedTeacher._id })
      .then(() => {
        close();
        invalidateCache();
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

      {/* Teacher selector */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-secondary">
          O'qituvchi <span className="text-danger">*</span>
        </label>
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen((v) => !v)}
            className="w-full flex items-center justify-between px-3 py-2 border border-border-secondary rounded-lg text-sm bg-background-secondary"
          >
            {selectedTeacher ? (
              <span className="text-primary">
                {selectedTeacher.firstName} {selectedTeacher.lastName}
              </span>
            ) : (
              <span className="text-secondary">O'qituvchi tanlang</span>
            )}
            <svg
              className={`w-4 h-4 text-secondary transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
              viewBox="0 0 14 14"
              fill="none"
            >
              <path
                d="M3 5L7 9L11 5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {dropdownOpen && (
            <div className="absolute z-20 w-full mt-1 border border-border-secondary rounded-lg bg-background-primary shadow-sm overflow-hidden">
              {/* Search */}
              <div className="p-2 border-b border-border-tertiary">
                <input
                  autoFocus
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Qidirish..."
                  className="w-full px-2.5 py-1.5 text-sm border border-border-tertiary rounded-md bg-background-primary outline-none"
                />
              </div>

              {/* List */}
              <div className="max-h-48 overflow-y-auto">
                {teachersLoading ? (
                  <div className="flex justify-center py-4">
                    <div className="w-5 h-5 border-2 border-border-secondary border-t-secondary rounded-full animate-spin" />
                  </div>
                ) : filtered.length === 0 ? (
                  <p className="text-sm text-secondary text-center py-3">
                    Topilmadi
                  </p>
                ) : (
                  filtered.map((teacher) => (
                    <button
                      key={teacher._id}
                      type="button"
                      onClick={() => {
                        setSelectedTeacher(teacher);
                        setDropdownOpen(false);
                        setSearch("");
                      }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-background-secondary transition-colors ${
                        selectedTeacher?._id === teacher._id
                          ? "bg-background-info"
                          : ""
                      }`}
                    >
                      {/* Avatar */}
                      <div className="w-8 h-8 rounded-full bg-background-tertiary flex items-center justify-center text-xs font-medium text-secondary flex-shrink-0">
                        {teacher.firstName[0]}
                        {teacher.lastName[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-primary truncate">
                          {teacher.firstName} {teacher.lastName}
                        </p>
                        <p className="text-xs text-secondary">
                          +{teacher.phone}
                        </p>
                      </div>
                      {selectedTeacher?._id === teacher._id && (
                        <svg
                          className="w-4 h-4 text-info flex-shrink-0"
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
                  ))
                )}
              </div>
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
