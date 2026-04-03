// Components
import SelectField from "./SelectField";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// API
import { usersAPI } from "@/features/users/api/users.api";

const defaultFormatUserFunc = (user) => ({
  value: user._id,
  label: `${user.firstName} ${user.lastName || ""} (${user.role})`,
});

const SelectAllUsers = ({
  label = "Foydalanuvchi",
  formatUsers = defaultFormatUserFunc,
  ...props
}) => {
  const { data: users = [] } = useQuery({
    queryKey: ["users", "all-users-short"],
    queryFn: () => usersAPI.getAllShort().then((res) => res.data.data),
  });

  return (
    <SelectField
      required
      searchable
      label={label}
      options={users.map(formatUsers)}
      emptyText="Foydalanuvchi topilmadi"
      placeholder="Foydalanuvchini tanlang"
      {...props}
    />
  );
};

export default SelectAllUsers;
