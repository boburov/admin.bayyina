// Toast
import { toast } from "sonner";

// API
import { usersAPI } from "@/features/users/api/users.api";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Store
import useAuth from "@/shared/hooks/useAuth";

// Router
import { useSearchParams } from "react-router-dom";

// Helpers
import { formatUzDate } from "@/shared/utils/formatDate";

// Data
import { genderOptions } from "../../users/data/users.data";

// Hooks
import useModal from "@/shared/hooks/useModal";

// Components
import Button from "@/shared/components/ui/button/Button";
import Pagination from "@/shared/components/ui/Pagination";

// React
import { useCallback } from "react";

// Icons
import { Plus, Edit, Trash2, Key, Eye, Users } from "lucide-react";

const Teachers = () => {
  const { user: currentUser } = useAuth();
  const { openModal } = useModal();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get("page") || "1", 10);

  const goToPage = useCallback(
    (page) => {
      if (page < 1) return;
      const params = new URLSearchParams(searchParams);
      params.set("page", page.toString());
      setSearchParams(params);
    },
    [searchParams, setSearchParams],
  );

  const { data, isLoading } = useQuery({
    queryKey: ["users", "teachers", { page: currentPage }],
    queryFn: () =>
      usersAPI
        .getTeachers({ page: currentPage, limit: 20 })
        .then((res) => res.data),
    keepPreviousData: true,
    onError: ({ message }) => toast.error(message || "Nimadir xato ketdi"),
  });

  const users = data?.users ?? [];

  const getGenderLabel = (gender) =>
    genderOptions.find((g) => g.value === gender)?.label ?? "-";

  if (isLoading) {
    return <div className="text-center py-8">Yuklanmoqda...</div>;
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <Button onClick={() => openModal("createUser")} className="px-3.5">
          <Plus strokeWidth={1.5} />
          Yangi foydalanuvchi
        </Button>

      </div>

      {/* Table Wrapper */}
      <div>
        <div className="rounded-lg overflow-x-auto border border-border bg-white">
          <table>
            <thead>
              <tr>
                <th>F.I.O</th>
                <th>Telefon</th>
                <th>Jins</th>
                <th>Yosh</th>
                <th>Manba</th>
                <th>Sana</th>
                <th>Harakatlar</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-2 text-gray-400">
                      <Users className="size-10 opacity-30" strokeWidth={1.5} />
                      <p className="text-sm">O'qituvchilar topilmadi</p>
                    </div>
                  </td>
                </tr>
              )}
              {users.map((user) => (
                <tr key={user._id}>
                  {/* Full Name */}
                  <td className="py-4 text-center text-sm font-medium text-gray-900">
                    {user.firstName} {user.lastName}
                  </td>

                  {/* Phone */}
                  <td className="text-center text-sm text-gray-500">
                    {user.phone}
                  </td>

                  {/* Gender */}
                  <td className="text-center text-sm text-gray-500">
                    {getGenderLabel(user.gender)}
                  </td>

                  {/* Age */}
                  <td className="text-center text-sm text-gray-500">
                    {user.age ?? "-"}
                  </td>

                  {/* Source */}
                  <td className="text-center text-sm text-gray-500">
                    {user.source ?? "-"}
                  </td>

                  {/* Created At */}
                  <td className="text-center text-sm text-gray-500">
                    {formatUzDate(user.createdAt)}
                  </td>

                  {/* Actions */}
                  <td className="text-center text-sm font-medium">
                    <div className="flex justify-center space-x-2">
                      {/* Edit */}
                      <button
                        onClick={() => openModal("editUser", user)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="size-5" strokeWidth={1.5} />
                      </button>

                      {/* View Password (Owner only) */}
                      {currentUser?.role === "owner" && (
                        <button
                          onClick={() => openModal("viewUserPassword", user)}
                          className="text-purple-600 hover:text-purple-900"
                          title="Parolni ko'rish"
                        >
                          <Eye className="size-5" strokeWidth={1.5} />
                        </button>
                      )}

                      {/* Reset Password */}
                      <button
                        onClick={() => openModal("resetUserPassword", user)}
                        className="text-orange-600 hover:text-orange-900"
                      >
                        <Key className="size-5" strokeWidth={1.5} />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => openModal("deleteUser", user)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="size-5" strokeWidth={1.5} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Desktop Pagination */}
        {users.length > 0 && (
          <Pagination
            maxPageButtons={5}
            showPageNumbers={true}
            onPageChange={goToPage}
            currentPage={currentPage}
            hasNextPage={data?.hasNextPage}
            hasPrevPage={data?.hasPrevPage}
            className="pt-6 max-md:hidden"
            totalPages={data?.totalPages || 1}
          />
        )}
      </div>

      {/* Mobile Pagination */}
      {users.length > 0 && (
        <div className="overflow-x-auto pb-1.5">
          <Pagination
            maxPageButtons={5}
            showPageNumbers={true}
            onPageChange={goToPage}
            currentPage={currentPage}
            hasNextPage={data?.hasNextPage}
            hasPrevPage={data?.hasPrevPage}
            className="pt-6 min-w-max md:hidden"
            totalPages={data?.totalPages || 1}
          />
        </div>
      )}
    </div>
  );
};

export default Teachers;
