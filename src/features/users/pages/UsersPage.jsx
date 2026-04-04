// Toast
import { toast } from "sonner";

// API
import { usersAPI } from "@/features/users/api/users.api";

// Store
import useAuth from "@/shared/hooks/useAuth";

// Router
import { useSearchParams } from "react-router-dom";

// Helpers
import { getRoleLabel } from "@/shared/helpers/role.helpers";

// Hooks
import useModal from "@/shared/hooks/useModal";
import useArrayStore from "@/shared/hooks/useArrayStore";

// Components
import Select from "@/shared/components/form/select";
import Button from "@/shared/components/ui/button/Button";
import Pagination from "@/shared/components/ui/Pagination";

// React
import { useEffect, useCallback, useState, useRef } from "react";

// Icons
import {
  Plus,
  Edit,
  Trash2,
  Key,
  Eye,
  Search,
  X,
  Download,
} from "lucide-react";

const Users = () => {
  const { user: currentUser } = useAuth();
  const { openModal } = useModal();
  const { getCollectionData: getRolesData } = useArrayStore("roles");
  const roles = getRolesData();

  // Role options for filter (dynamic, excluding owner)
  const roleOptions = [
    { value: "all", label: "Barcha rollar" },
    ...roles
      .filter((r) => r.value !== "owner")
      .map((r) => ({ value: r.value, label: r.name })),
  ];

  // Search params
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  const searchQuery = searchParams.get("search") || "";
  const roleFilter = searchParams.get("role") || "";

  // Handle role filter change
  const handleRoleChange = useCallback(
    (value) => {
      const params = new URLSearchParams(searchParams);
      if (value && value !== "all") {
        params.set("role", value);
      } else {
        params.delete("role");
      }
      params.set("page", "1");
      setSearchParams(params);
    },
    [searchParams, setSearchParams],
  );

  // Search state
  const [searchInput, setSearchInput] = useState(searchQuery);
  const debounceRef = useRef(null);

  // Debounced search handler
  const handleSearchChange = useCallback(
    (value) => {
      setSearchInput(value);

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(() => {
        const params = new URLSearchParams(searchParams);
        if (value.trim()) {
          params.set("search", value.trim());
          params.set("page", "1");
        } else {
          params.delete("search");
          params.set("page", "1");
        }
        setSearchParams(params);
      }, 1500);
    },
    [searchParams, setSearchParams],
  );

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchInput("");
    const params = new URLSearchParams(searchParams);
    params.delete("search");
    params.set("page", "1");
    setSearchParams(params);
  }, [searchParams, setSearchParams]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const {
    setPage,
    initialize,
    getMetadata,
    getPageData,
    hasCollection,
    setPageErrorState,
    setPageLoadingState,
  } = useArrayStore("users");

  // Initialize collection on mount/type change
  useEffect(() => {
    if (!hasCollection()) initialize(true); // pagination = true
  }, [hasCollection, initialize]);

  const metadata = getMetadata();
  const pageData = getPageData(currentPage);

  const users = pageData?.data || [];
  const hasError = pageData?.error || null;
  const isLoading = pageData?.isLoading || false;
  const hasNextPage = pageData?.hasNextPage ?? false;
  const hasPrevPage = pageData?.hasPrevPage ?? false;

  // Load templates for current page & type
  const fetchUsers = useCallback(
    (page, search, role) => {
      setPageLoadingState(page, true);
      const params = { page, limit: 32 };
      if (search) params.search = search;
      if (role) params.role = role;

      usersAPI
        .getAll(params)
        .then((res) => {
          const { data, pagination } = res.data;
          setPage(page, data, null, pagination);
        })
        .catch(({ message }) => {
          toast.error(message || "Nimadir xato ketdi");
          setPageErrorState(page, message || "Nimadir xato ketdi");
        });
    },
    [setPageLoadingState, setPage, setPageErrorState],
  );

  // Navigate to page
  const goToPage = useCallback(
    (page) => {
      if (page < 1) return;
      const params = new URLSearchParams(searchParams);
      params.set("page", page.toString());
      setSearchParams(params);
    },
    [searchParams, setSearchParams],
  );

  // Load users when page or search changes
  useEffect(() => {
    fetchUsers(currentPage, searchQuery, roleFilter);
  }, [currentPage, searchQuery, roleFilter, users?.length]);

  if (isLoading) {
    return <div className="text-center py-8">Yuklanmoqda...</div>;
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {/* Create New Btn */}
        <Button onClick={() => openModal("createUser")} className="px-3.5">
          <Plus strokeWidth={1.5} />
          Yangi foydalanuvchi
        </Button>

        {/* Search Input */}
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400"
            strokeWidth={1.5}
          />
          <input
            autoFocus
            type="text"
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Foydalanuvchi qidirish..."
            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
          />
          {searchInput && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="size-5" strokeWidth={1.5} />
            </button>
          )}
        </div>

        {/* Role Filter */}
        <Select
          size="lg"
          options={roleOptions}
          placeholder="Rol tanlang"
          onChange={handleRoleChange}
          value={roleFilter || "all"}
          className="w-full sm:w-44"
        />

        {/* Download Data */}
        <Button onClick={() => openModal("exportUsers")}>
          <Download strokeWidth={1.5} />
          <span className="sm:hidden">Foydalanuvchilarni yuklash</span>
        </Button>
      </div>

      {/* Table Wrapper */}
      <div>
        {/* Table */}
        <div className="rounded-lg overflow-x-auto">
          <table>
            {/* Thead */}
            <thead>
              <tr>
                <th>F.I.O</th>
                <th>Username</th>
                <th>Rol</th>
                <th>Tangalar</th>
                <th>Jarimalar</th>
                <th>Sinflar</th>
                <th>Harakatlar</th>
              </tr>
            </thead>

            {/* Tbody */}
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  {/* Full Name */}
                  <td className="py-4 text-center text-sm font-medium text-gray-900">
                    {user.fullName}
                  </td>

                  {/* Username */}
                  <td className="text-center">
                    <div className="text-sm text-gray-500">{user.username}</div>
                  </td>

                  {/* Role */}
                  <td className="text-center">
                    <span
                      className={`${
                        user.role === "teacher"
                          ? "bg-green-100 text-green-800"
                          : "bg-blue-100 text-blue-800"
                      } px-2 inline-flex text-xs leading-5 font-semibold rounded-full`}
                    >
                      {getRoleLabel(user.role, roles)}
                    </span>
                  </td>

                  {/* Coin */}
                  <td className="text-center">
                    <div className="text-sm text-gray-500">
                      {user.coinBalance}
                    </div>
                  </td>

                  {/* Penalty Points */}
                  <td className="text-center">
                    <div className="text-sm text-gray-500">
                      {user.penaltyPoints}
                    </div>
                  </td>

                  {/* Class */}
                  <td className="text-center text-sm text-gray-500">
                    {user.role === "student" && user.classes?.length > 0
                      ? user.classes.map((c) => c.name).join(", ")
                      : "-"}
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

                      {/*View Password (Owner only) */}
                      {currentUser?.role === "owner" && (
                        <button
                          onClick={() => openModal("viewUserPassword", user)}
                          className="text-purple-600 hover:text-purple-900"
                          title="Parolni ko'rish"
                        >
                          <Eye className="size-5" strokeWidth={1.5} />
                        </button>
                      )}

                      {/*
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

        {/* Desktop Pagination Controls */}
        {!isLoading && !hasError && users.length > 0 && (
          <Pagination
            maxPageButtons={5}
            showPageNumbers={true}
            onPageChange={goToPage}
            currentPage={currentPage}
            hasNextPage={hasNextPage}
            hasPrevPage={hasPrevPage}
            className="pt-6 max-md:hidden"
            totalPages={metadata?.totalPages || 1}
          />
        )}
      </div>

      {/* Mobile Pagination Controls */}
      {!isLoading && !hasError && users.length > 0 && (
        <div className="overflow-x-auto pb-1.5">
          <Pagination
            maxPageButtons={5}
            showPageNumbers={true}
            onPageChange={goToPage}
            currentPage={currentPage}
            hasNextPage={hasNextPage}
            hasPrevPage={hasPrevPage}
            className="pt-6 min-w-max md:hidden"
            totalPages={metadata?.totalPages || 1}
          />
        </div>
      )}
    </div>
  );
};

export default Users;
