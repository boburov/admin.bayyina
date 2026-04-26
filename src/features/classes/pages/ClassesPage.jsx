// Toast
import { toast } from "sonner";

// React
import { useCallback, useEffect, useRef, useState } from "react";

// API
import { classesAPI } from "@/features/classes/api/classes.api";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Router
import { Link, useSearchParams } from "react-router-dom";

// Hooks
import useModal from "@/shared/hooks/useModal";

// Data
import { daysOptions } from "../data/classes.data";

// Components
import Button from "@/shared/components/ui/button/Button";
import Card from "@/shared/components/ui/Card";
import Pagination from "@/shared/components/ui/Pagination";

// Icons
import {
  Plus,
  Edit,
  Trash2,
  ChevronRight,
  Clock,
  User,
  School,
  Search,
  X,
} from "lucide-react";

const Classes = () => {
  const { openModal } = useModal();
  const [searchParams, setSearchParams] = useSearchParams();

  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  const qParam      = searchParams.get("q") || "";
  const dayParam    = searchParams.get("day") || "";

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

  const hasFilters = qParam || dayParam;

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
    limit: 12,
    ...(qParam   && { q: qParam }),
    ...(dayParam && { day: dayParam }),
  };

  const { data, isLoading, isFetching } = useQuery({
    queryKey: hasFilters
      ? ["admin-groups", "search", queryParams]
      : ["admin-groups", { page: currentPage }],
    queryFn: () =>
      hasFilters
        ? classesAPI.search(queryParams).then((res) => res.data)
        : classesAPI.getAll({ page: currentPage, limit: 12 }).then((res) => res.data),
    keepPreviousData: true,
    onError: () => toast.error("Guruhlar yuklanmadi"),
  });

  const groups = data?.groups ?? [];

  const getDayLabel = (value) =>
    daysOptions.find((d) => d.value === value)?.label ?? value;

  return (
    <div>
      {/* Page header */}
      <div className="mb-5 pb-4 border-b border-border">
        <h1 className="page-title">Guruhlar</h1>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 mb-4">
        <Button onClick={() => openModal("createClass")} className="px-3.5">
          <Plus strokeWidth={1.5} />
          Yangi guruh
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={inputQ}
            onChange={(e) => setInputQ(e.target.value)}
            placeholder="Guruh nomi, xona, narx..."
            className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-gray-300"
          />
        </div>

        <select
          value={dayParam}
          onChange={(e) => setFilter("day", e.target.value)}
          className="py-2 px-3 text-sm border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-gray-300"
        >
          <option value="">Barcha kunlar</option>
          {daysOptions.map((o) => (
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

      {/* Content */}
      {isLoading ? (
        <div className="text-center py-8 text-sm text-gray-400">Yuklanmoqda...</div>
      ) : groups.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-16 text-gray-400">
          <School className="size-10 opacity-30" strokeWidth={1.5} />
          <p className="text-sm">Guruhlar topilmadi</p>
        </div>
      ) : (
        <div className={`grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 transition-opacity ${isFetching ? "opacity-60" : "opacity-100"}`}>
          {groups.map((group) => (
            <Card key={group._id}>
              {/* Top row — name + actions */}
              <div className="flex justify-between items-start mb-3">
                <Link
                  to={`/classes/${group._id}`}
                  className="flex items-center gap-1 text-sm font-semibold text-gray-900 hover:text-brown-800 transition-colors"
                >
                  {group.name}
                  <ChevronRight className="size-4 shrink-0" strokeWidth={1.5} />
                </Link>

                <div className="flex gap-3 shrink-0">
                  <button
                    onClick={() => openModal("editClass", group)}
                    className="text-gray-400 hover:text-brown-800 transition-colors"
                  >
                    <Edit className="size-4" strokeWidth={1.5} />
                  </button>
                  <button
                    onClick={() => openModal("deleteClass", group)}
                    className="text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="size-4" strokeWidth={1.5} />
                  </button>
                </div>
              </div>

              {/* Teacher */}
              {group.teacher && (
                <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-2">
                  <User className="size-4 shrink-0" strokeWidth={1.5} />
                  <span>
                    {group.teacher.firstName} {group.teacher.lastName}
                  </span>
                </div>
              )}

              {/* Schedule */}
              {group.schedule && (
                <div className="flex items-center gap-1.5 mb-3">
                  <Clock className="size-4 shrink-0 text-gray-400" strokeWidth={1.5} />
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <div className="flex gap-1">
                      {group.schedule.days.map((day) => (
                        <span
                          key={day}
                          className="px-1.5 py-0.5 text-xs font-medium border border-stone-200 text-stone-500 bg-stone-50"
                        >
                          {getDayLabel(day)}
                        </span>
                      ))}
                    </div>
                    <span className="text-xs text-gray-500">{group.schedule.time}</span>
                  </div>
                </div>
              )}

              {/* Price */}
              <div className="pt-3 border-t">
                <span className="text-sm font-semibold text-gray-900">
                  {Number(group.price).toLocaleString("uz-UZ")} so'm
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && groups.length > 0 && (
        <>
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
        </>
      )}
    </div>
  );
};

export default Classes;
