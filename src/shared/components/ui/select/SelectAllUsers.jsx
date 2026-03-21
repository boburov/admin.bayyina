// Components
import SelectField from "./SelectField";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// API
import { usersAPI } from "@/features/users/api/users.api";

const SelectAllUsers = ({ value, onChange }) => {
  const { data: users = [] } = useQuery({
    queryKey: ["users", "all-users-short"],
    queryFn: () => usersAPI.getAllShort().then((res) => res.data.data),
  });

  return (
    <SelectField
      required
      searchable
      value={value}
      onChange={onChange}
      label="Foydalanuvchi"
      emptyText="Foydalanuvchi topilmadi"
      placeholder="Foydalanuvchini tanlang"
      options={users.map((user) => ({
        value: user._id,
        label: `${user.firstName} ${user.lastName || ""} (${user.role})`,
      }))}
    />
  );
};

export default SelectAllUsers;
