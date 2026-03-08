// Toast
import { toast } from "sonner";

// API
import { usersAPI } from "@/shared/api/users.api";

// Components
import Input from "@/shared/components/form/input";
import Select from "@/shared/components/form/select";
import Button from "@/shared/components/form/button";
import MultiSelect from "@/shared/components/form/multi-select";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

// Data
import { genderOptions } from "../data/users.data";

// Hooks
import useArrayStore from "@/shared/hooks/useArrayStore";
import useObjectState from "@/shared/hooks/useObjectState";

const EditUserModal = () => (
  <ResponsiveModal name="editUser" title="Foydalanuvchini tahrirlash">
    <Content />
  </ResponsiveModal>
);

const Content = ({ close, isLoading, setIsLoading, ...user }) => {
  const { getCollectionData, invalidateCache } = useArrayStore("classes");
  const classes = getCollectionData();

  const { firstName, lastName, gender, state, setField } = useObjectState({
    classes: user.classes?.map((c) => c._id) || [],
    lastName: user.lastName,
    firstName: user.firstName,
    gender: user.gender || "",
  });

  const handleEditUser = (e) => {
    e.preventDefault();

    if (user.role === "student" && (!state.classes || state.classes.length === 0)) {
      return toast.warning("Kamida bitta sinf tanlanishi kerak");
    }

    setIsLoading(true);

    usersAPI
      .update(user._id, state)
      .then(() => {
        close();
        invalidateCache("users");
        toast.success("Foydalanuvchi tahrirlandi");
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || "Xatolik yuz berdi");
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <form onSubmit={handleEditUser} className="space-y-3.5">
      <Input
        required
        label="Ism"
        name="firstName"
        value={firstName}
        onChange={(v) => setField("firstName", v)}
      />

      <Input
        required
        name="lastName"
        label="Familiya"
        value={lastName}
        onChange={(v) => setField("lastName", v)}
      />

      <Select
        label="Jins"
        value={gender}
        placeholder="Jinsni tanlang"
        onChange={(v) => setField("gender", v || null)}
        options={genderOptions}
      />

      {user.role === "student" && (
        <MultiSelect
          required
          label="Sinflar"
          value={state.classes}
          placeholder="Sinflarni tanlang..."
          onChange={(v) => setField("classes", v)}
          options={classes.map((cls) => ({ label: cls.name, value: cls._id }))}
        />
      )}

      <div className="flex flex-col-reverse gap-3.5 w-full mt-5 xs:m-0 xs:flex-row xs:justify-end">
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
          Yangilash
          {isLoading && "..."}
        </Button>
      </div>
    </form>
  );
};

export default EditUserModal;
