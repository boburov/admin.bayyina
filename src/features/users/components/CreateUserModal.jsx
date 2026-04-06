// Toast
import { toast } from "sonner";

// API
import { usersAPI } from "@/features/users/api/users.api";

// Tanstack Query
import { useQueryClient } from "@tanstack/react-query";

// Components
import Input from "@/shared/components/form/input";
import Select from "@/shared/components/form/select";
import Button from "@/shared/components/form/button";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

// Data
import { genderOptions, roleOptions, sourceOptions } from "../data/users.data";

// Hooks
import useObjectState from "@/shared/hooks/useObjectState";

const CreateUserModal = () => (
  <ResponsiveModal name="createUser" title="Yangi foydalanuvchi">
    <Content />
  </ResponsiveModal>
);

const Content = ({ close, isLoading, setIsLoading }) => {
  const queryClient = useQueryClient();

  const { phone, password, firstName, lastName, role, gender, source, setField } =
    useObjectState({
      phone: "",
      password: "",
      lastName: "",
      firstName: "",
      role: "student",
      gender: "",
      source: "",
    });

  const handleCreateUser = (e) => {
    e.preventDefault();
    setIsLoading(true);

    const data = {
      phone: Number(phone),
      password: password?.trim(),
      firstName: firstName?.trim(),
      lastName: lastName?.trim(),
      role,
      gender: gender || null,
      source: source || null,
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
        name="lastName"
        label="Familiya"
        value={lastName}
        autoComplete="off"
        onChange={(v) => setField("lastName", v)}
      />

      <Input
        required
        name="phone"
        label="Telefon raqam"
        value={phone}
        type="tel"
        autoComplete="off"
        placeholder="998901234567"
        onChange={(v) => setField("phone", v?.trim())}
      />

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

      <Select
        required
        label="Rol"
        value={role}
        onChange={(v) => setField("role", v)}
        options={roleOptions}
      />

      <Select
        label="Jins"
        value={gender}
        placeholder="Jinsni tanlang"
        onChange={(v) => setField("gender", v)}
        options={genderOptions}
      />

      <Select
        label="Qayerdan eshitdi"
        value={source}
        placeholder="Manbani tanlang"
        onChange={(v) => setField("source", v)}
        options={sourceOptions}
      />

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
          Yaratish
          {isLoading && "..."}
        </Button>
      </div>
    </form>
  );
};

export default CreateUserModal;
