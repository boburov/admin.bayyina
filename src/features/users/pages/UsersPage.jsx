// Toast
import { toast } from "sonner";

// React
import { useCallback, useEffect, useRef, useState } from "react";

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
import { genderOptions, sourceOptions } from "../data/users.data";

// Hooks
import useModal from "@/shared/hooks/useModal";

// Components
import Button from "@/shared/components/ui/button/Button";
import Pagination from "@/shared/components/ui/Pagination";

// Icons
import { Plus, Edit, Trash2, Key, Eye, Users, Search, X } from "lucide-react";

const UsersPage = () => {
  const { user: currentUser } = useAuth();
  const { openModal } = useModal();
  const [searchParams, setSearchParams] = useSearchParams();

  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  const qParam      = searchParams.get("q") || "";
  const genderParam = searchParams.get("gender") || "";
  const sourceParam = searchParams.get("source") || "";
  const minAgeParam = searchParams.get("minAge") || "";
  const maxAgeParam = searchParams.get("maxAge") || "";

  const [inputQ, setInputQ] = useState(qParam);

  const searchParamsRef = useRef(searchParams);
  useEffect(() => { searchParamsRef.current = searchParams; }, [searchParams]);

  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const id = setTimeout(() => {
      const params = new URLSearchParams(searchParamsRef.current);
      if (inputQ) {
        params.set("q", inputQ);
      } else {
        params.delete("q");
      }
      params.set("page", "1");
      setSearchParams(params, { replace: true });
    }, 400);
    return () => clearTimeout(id);
  }, [inputQ, setSearchParams]);

  const hasFilters = qParam || genderParam || sourceParam || minAgeParam || maxAgeParam;

  const setFilter = useCallback(
    (key, value) => {
      const params = new URLSearchParams(searchParams);
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.set("page", "1");
      setSearchParams(params);
    },
    [searchParams, setSearchParams],
  );

  const resetFilters = useCallback(() => {
    setInputQ("");
    setSearchParams({ page: "1" });
  }, [setSearchParams]);

  const goToPage = useCallback(
    (page) => {
      if (page < 1) return;
      const params = new URLSearchParams(searchParams);
      params.set("page", page.toString());
      setSearchParams(params);
    },
    [searchParams, setSearchParams],
  );

  const queryParams = {
    page: currentPage,
    limit: 20,
    ...(qParam      && { q: qParam }),
    ...(genderParam && { gender: genderParam }),
    ...(sourceParam && { source: sourceParam }),
    ...(minAgeParam && { minAge: minAgeParam }),
    ...(maxAgeParam && { maxAge: maxAgeParam }),
  };

  const { data, isLoading, isFetching } = useQuery({
    queryKey: hasFilters
      ? ["users", "students", "search", queryParams]
      : ["users", "students", { page: currentPage }],
    queryFn: () =>
      hasFilters
        ? usersAPI.searchStudents(queryParams).then((res) => res.data)
        : usersAPI.getStudents({ page: currentPage, limit: 20 }).then((res) => res.data),
    keepPreviousData: true,
    onError: ({ message }) => toast.error(message || "Nimadir xato ketdi"),
  });

  const users = data?.users ?? [];

  const getGenderLabel = (gender) =>
    genderOptions.find((g) => g.value === gender)?.label ?? "-";

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
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={inputQ}
            onChange={(e) => setInputQ(e.target.value)}
            placeholder="Ism, telefon, manba..."
            className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-gray-300"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="number"
            value={minAgeParam}
            onChange={(e) => setFilter("minAge", e.target.value)}
            placeholder="Min yosh"
            className="w-20 py-2 px-3 text-sm border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-gray-300"
          />
          <span className="text-gray-400">-</span>
          <input
            type="number"
            value={maxAgeParam}
            onChange={(e) => setFilter("maxAge", e.target.value)}
            placeholder="Max yosh"
            className="w-20 py-2 px-3 text-sm border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-gray-300"
          />
        </div>

        <select
          value={genderParam}
          onChange={(e) => setFilter("gender", e.target.value)}
          className="py-2 px-3 text-sm border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-gray-300"
        >
          <option value="">Barcha jins</option>
          {genderOptions.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        <select
          value={sourceParam}
          onChange={(e) => setFilter("source", e.target.value)}
          className="py-2 px-3 text-sm border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-gray-300"
        >
          <option value="">Barcha manba</option>
          {sourceOptions.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        {hasFilters && (
          <button
            onClick={resetFilters}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800 border border-gray-200 rounded-md px-2 py-2"
          >
            <X size={12} />
            Tozalash
          </button>
        )}
      </div>

      {/* Table */}
      <div className={`table-wrapper transition-opacity ${isFetching ? "opacity-60 pointer-events-none" : "opacity-100"}`}>
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
            {isLoading ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-sm text-gray-400">
                  Yuklanmoqda...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-2 text-gray-400">
                    <Users className="size-8 opacity-30" strokeWidth={1.5} />
                    <p className="text-sm">O'quvchilar topilmadi</p>
                  </div>
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user._id}>
                  <td className="text-center text-sm font-medium text-gray-900">
                    {user.firstName} {user.lastName}
                  </td>
                  <td className="text-center text-sm text-gray-500">{user.phone}</td>
                  <td className="text-center text-sm text-gray-500">{getGenderLabel(user.gender)}</td>
                  <td className="text-center text-sm text-gray-500">{user.age ?? "-"}</td>
                  <td className="text-center text-sm text-gray-500">{user.source ?? "-"}</td>
                  <td className="text-center text-sm text-gray-500">{formatUzDate(user.createdAt)}</td>
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
              ))
            )}
          </tbody>
        </table>
      </div>

      {!isLoading && users.length > 0 && (
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

      {!isLoading && users.length > 0 && (
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
