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
import { useSearchParams, useNavigate } from "react-router-dom";

// Helpers
import { formatUzDate } from "@/shared/utils/formatDate";
import { formatPhone } from "@/shared/utils/formatPhone";

// Data
import { genderOptions } from "../../users/data/users.data";

// Hooks
import useModal from "@/shared/hooks/useModal";
import { useSelectOptions } from "@/shared/hooks/useSelectOptions";

// Components
import Button from "@/shared/components/ui/button/Button";
import Pagination from "@/shared/components/ui/Pagination";
import DynamicSelect from "@/shared/components/ui/DynamicSelect";
import InputField from "@/shared/components/ui/input/InputField";
import InputGroup from "@/shared/components/ui/input/InputGroup";
import SelectField from "@/shared/components/ui/select/SelectField";

// Icons
import {
  Plus,
  Edit,
  Trash2,
  Key,
  Eye,
  Users,
  Search,
  X,
  Banknote,
} from "lucide-react";

const Teachers = () => {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const { openModal } = useModal();
  const [searchParams, setSearchParams] = useSearchParams();

  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  const qParam = searchParams.get("q") || "";
  const genderParam = searchParams.get("gender") || "";
  const sourceParam = searchParams.get("source") || "";
  const minAgeParam = searchParams.get("minAge") || "";
  const maxAgeParam = searchParams.get("maxAge") || "";

  const [inputQ, setInputQ] = useState(qParam);

  // keep a ref to always get latest searchParams inside the debounce callback
  const searchParamsRef = useRef(searchParams);
  useEffect(() => {
    searchParamsRef.current = searchParams;
  }, [searchParams]);

  // skip the very first render so we don't push a redundant history entry on mount
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

  const hasFilters =
    qParam || genderParam || sourceParam || minAgeParam || maxAgeParam;

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
    ...(qParam && { q: qParam }),
    ...(genderParam && { gender: genderParam }),
    ...(sourceParam && { source: sourceParam }),
    ...(minAgeParam && { minAge: minAgeParam }),
    ...(maxAgeParam && { maxAge: maxAgeParam }),
  };

  const { data, isLoading, isFetching } = useQuery({
    queryKey: hasFilters
      ? ["users", "teachers", "search", queryParams]
      : ["users", "teachers", { page: currentPage }],
    queryFn: () =>
      hasFilters
        ? usersAPI.searchTeachers(queryParams).then((res) => res.data)
        : usersAPI
            .getTeachers({ page: currentPage, limit: 20 })
            .then((res) => res.data),
    keepPreviousData: true,
    onError: ({ message }) => toast.error(message || "Nimadir xato ketdi"),
  });

  const users = data?.users ?? [];

  const { options: sourceOptions } = useSelectOptions("lead_source");
  const getSourceLabel = (id) =>
    sourceOptions.find((o) => o.value === id || String(o._id) === id)?.label ?? id ?? "-";

  const getGenderLabel = (gender) =>
    genderOptions.find((g) => g.value === gender)?.label ?? "-";

  return (
    <div>
      {/* Header */}
      <div className="mb-5 pb-4 border-b border-border">
        <h1 className="page-title">O'qituvchilar</h1>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <Button
          onClick={() => openModal("createUser", { defaultRole: "teacher" })}
          className="px-3.5"
        >
          <Plus size={14} strokeWidth={1.5} />
          Yangi o'qituvchi
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row flex-wrap items-center gap-3 mb-5">
        <InputField
          name="search"
          value={inputQ}
          className="flex-1"
          placeholder="Qidirish..."
          onChange={(e) => setInputQ(e.target.value)}
        />

        <InputGroup className="grid-cols-2 w-full sm:w-auto">
          <InputField
            name="minAge"
            type="number"
            value={minAgeParam}
            onChange={(e) => setFilter("minAge", e.target.value)}
            placeholder="Min yosh"
            className="w-full sm:w-28"
          />
          <InputField
            name="maxAge"
            type="number"
            value={maxAgeParam}
            onChange={(e) => setFilter("maxAge", e.target.value)}
            placeholder="Max yosh"
            className="w-full sm:w-28"
          />
        </InputGroup>

        <SelectField
          name="gender"
          options={genderOptions}
          value={genderParam}
          onChange={(val) => setFilter("gender", val)}
          placeholder="Barcha jins"
          className="w-full sm:w-auto"
        />

        <DynamicSelect
          type="lead_source"
          value={sourceParam}
          onChange={(v) => setFilter("source", v)}
          allLabel="Barcha manba"
          className="w-full sm:w-auto"
        />

        {hasFilters && (
          <Button
            variant="outline"
            onClick={resetFilters}
            className="w-full sm:w-auto"
          >
            <X />
            Tozalash
          </Button>
        )}
      </div>

      {/* Table */}
      <div
        className={`rounded-lg overflow-x-auto border border-border bg-white transition-opacity ${isFetching ? "opacity-60" : "opacity-100"}`}
      >
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
                <td
                  colSpan={7}
                  className="py-12 text-center text-sm text-gray-400"
                >
                  Yuklanmoqda...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-2 text-gray-400">
                    <Users className="size-10 opacity-30" strokeWidth={1.5} />
                    <p className="text-sm">O'qituvchilar topilmadi</p>
                  </div>
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user._id}>
                  <td className="py-4 text-center text-sm font-medium text-gray-900">
                    {user.firstName} {user.lastName}
                  </td>
                  <td className="text-center text-sm text-gray-500">
                    {formatPhone(String(user.phone))}
                  </td>
                  <td className="text-center text-sm text-gray-500">
                    {getGenderLabel(user.gender)}
                  </td>
                  <td className="text-center text-sm text-gray-500">
                    {user.age ?? "-"}
                  </td>
                  <td className="text-center text-sm text-gray-500">
                    {user.source ? getSourceLabel(user.source) : "-"}
                  </td>
                  <td className="text-center text-sm text-gray-500">
                    {formatUzDate(user.createdAt)}
                  </td>
                  <td className="text-center text-sm font-medium">
                    <div className="flex justify-center space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openModal("editUser", user)}
                        className="text-gray-500 hover:text-blue-600"
                        title="Tahrirlash"
                      >
                        <Edit className="size-4" strokeWidth={1.5} />
                      </Button>
                      {currentUser?.role === "owner" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openModal("viewUserPassword", user)}
                          className="text-gray-500 hover:text-purple-600"
                          title="Parolni ko'rish"
                        >
                          <Eye className="size-4" strokeWidth={1.5} />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openModal("resetUserPassword", user)}
                        className="text-gray-500 hover:text-orange-600"
                        title="Parolni yangilash"
                      >
                        <Key className="size-4" strokeWidth={1.5} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(`/teachers/${user._id}`)}
                        className="text-gray-500 hover:text-green-600"
                        title="Oylik tarixi"
                      >
                        <Banknote className="size-4" strokeWidth={1.5} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openModal("deleteUser", user)}
                        className="text-gray-500 hover:text-red-600"
                        title="O'chirish"
                      >
                        <Trash2 className="size-4" strokeWidth={1.5} />
                      </Button>
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
          className="pt-6 max-md:hidden"
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
            className="pt-6 min-w-max md:hidden"
            totalPages={data?.totalPages || 1}
          />
        </div>
      )}
    </div>
  );
};

export default Teachers;
