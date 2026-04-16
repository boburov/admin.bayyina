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
import { genderOptions } from "../data/users.data";

// Hooks
import useModal from "@/shared/hooks/useModal";

// Components
import Button from "@/shared/components/ui/button/Button";
import Pagination from "@/shared/components/ui/Pagination";

// React
import { useCallback } from "react";

// Icons
import { Plus, Edit, Trash2, Key, Eye, Download, Users } from "lucide-react";

const UsersPage = () => {
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
    queryKey: ["users", "students", { page: currentPage }],
    queryFn: () =>
      usersAPI
        .getStudents({ page: currentPage, limit: 20 })
        .then((res) => res.data),
    keepPreviousData: true,
    onError: ({ message }) => toast.error(message || "Nimadir xato ketdi"),
  });

  const users = data?.users ?? [];

  const getGenderLabel = (gender) =>
    genderOptions.find((g) => g.value === gender)?.label ?? "-";

  if (isLoading) {
    return (
      <div className="py-12 text-center text-sm text-gray-400">
        Yuklanmoqda...
      </div>
    );
  }

  return (
    <div>
      {/* Page header */}
      <div className="mb-5 pb-4 border-b border-border">
        <h1 className="page-title">O'quvchilar</h1>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <Button onClick={() => openModal("createUser")} className="px-3.5">
          <Plus size={14} strokeWidth={1.5} />
          Yangi o'quvchi
        </Button>

        <div className="flex-1" />

        <Button variant="neutral" onClick={() => openModal("exportUsers")} className="px-3.5">
          <Download size={14} strokeWidth={1.5} />
          <span>Yuklash</span>
        </Button>
      </div>

      {/* Table */}
      <div className="table-wrapper">
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
                    <Users className="size-8 opacity-30" strokeWidth={1.5} />
                    <p className="text-sm">O'quvchilar topilmadi</p>
                  </div>
                </td>
              </tr>
            )}
            {users.map((user) => (
              <tr key={user._id}>
                <td className="text-center text-sm font-medium text-gray-900">
                  {user.firstName} {user.lastName}
                </td>
                <td className="text-center text-sm text-gray-500">
                  {user.phone}
                </td>
                <td className="text-center text-sm text-gray-500">
                  {getGenderLabel(user.gender)}
                </td>
                <td className="text-center text-sm text-gray-500">
                  {user.age ?? "-"}
                </td>
                <td className="text-center text-sm text-gray-500">
                  {user.source ?? "-"}
                </td>
                <td className="text-center text-sm text-gray-500">
                  {formatUzDate(user.createdAt)}
                </td>
                <td className="text-center">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => openModal("editUser", user)}
                      className="text-gray-500 hover:text-blue-600 transition-colors"
                      title="Tahrirlash"
                    >
                      <Edit className="size-4" strokeWidth={1.5} />
                    </button>

                    {currentUser?.role === "owner" && (
                      <button
                        onClick={() => openModal("viewUserPassword", user)}
                        className="text-gray-500 hover:text-purple-600 transition-colors"
                        title="Parolni ko'rish"
                      >
                        <Eye className="size-4" strokeWidth={1.5} />
                      </button>
                    )}

                    <button
                      onClick={() => openModal("resetUserPassword", user)}
                      className="text-gray-500 hover:text-orange-600 transition-colors"
                      title="Parolni yangilash"
                    >
                      <Key className="size-4" strokeWidth={1.5} />
                    </button>

                    <button
                      onClick={() => openModal("deleteUser", user)}
                      className="text-gray-500 hover:text-red-600 transition-colors"
                      title="O'chirish"
                    >
                      <Trash2 className="size-4" strokeWidth={1.5} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {users.length > 0 && (
        <Pagination
          maxPageButtons={5}
          showPageNumbers={true}
          onPageChange={goToPage}
          currentPage={currentPage}
          hasNextPage={data?.hasNextPage}
          hasPrevPage={data?.hasPrevPage}
          className="pt-5 max-md:hidden"
          totalPages={data?.totalPages || 1}
        />
      )}

      {users.length > 0 && (
        <div className="overflow-x-auto pb-1.5">
          <Pagination
            maxPageButtons={5}
            showPageNumbers={true}
            onPageChange={goToPage}
            currentPage={currentPage}
            hasNextPage={data?.hasNextPage}
            hasPrevPage={data?.hasPrevPage}
            className="pt-5 min-w-max md:hidden"
            totalPages={data?.totalPages || 1}
          />
        </div>
      )}
    </div>
  );
};

export default UsersPage;
