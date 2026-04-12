// Tanstack Query
import { useQuery } from "@tanstack/react-query";

// Router
import { useSearchParams, Link } from "react-router-dom";

// Icons
import { Plus, Minus } from "lucide-react";

// API
import { penaltiesAPI } from "@/features/penalties/api/penalties.api";

// Data
import {
  penaltyStatusOptions,
  penaltyStatusLabels,
  penaltyStatusColors,
} from "../data/penalties.data";

// Helpers
import { getRoleLabel } from "@/shared/helpers/role.helpers";
import { formatDateUZ } from "@/shared/utils/date.utils";

// Components
import Card from "@/shared/components/ui/Card";
import Select from "@/shared/components/ui/select/Select";
import Button from "@/shared/components/ui/button/Button";
import Pagination from "@/shared/components/ui/Pagination";

// Hooks
import useModal from "@/shared/hooks/useModal";
import useArrayStore from "@/shared/hooks/useArrayStore";

// Modals
import CreatePenaltyModal from "../components/CreatePenaltyModal";
import ReducePenaltyModal from "../components/ReducePenaltyModal";

const PenaltiesPage = () => {
  const { openModal } = useModal();
  const { getCollectionData: getRolesData } = useArrayStore("roles");
  const roles = getRolesData();
  const [searchParams, setSearchParams] = useSearchParams();

  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  const statusFilter = searchParams.get("status") || "all";

  const { data, isLoading } = useQuery({
    queryKey: ["penalties", "list", currentPage, statusFilter],
    queryFn: () => {
      const params = { page: currentPage, limit: 20 };
      if (statusFilter && statusFilter !== "all") params.status = statusFilter;
      return penaltiesAPI.getAll(params).then((res) => res.data);
    },
  });

  const penalties = data?.data || [];
  const pagination = data?.pagination;

  const handleStatusChange = (value) => {
    const params = new URLSearchParams(searchParams);
    if (value && value !== "all") {
      params.set("status", value);
    } else {
      params.delete("status");
    }
    params.set("page", "1");
    setSearchParams(params);
  };

  const handlePageChange = (page) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(page));
    setSearchParams(params);
  };

  /**
   * Foydalanuvchi ismini formatlash
   * @param {object} user - Foydalanuvchi ob'yekti
   * @returns {string} Formatlangan ism
   */
  const formatUserName = (user) => {
    if (!user) return "—";
    return user.lastName
      ? `${user.firstName} ${user.lastName}`
      : user.firstName;
  };

  return (
    <div>
      {/* Top */}
      <div className="flex items-center justify-between mb-4">
        {/* Title */}
        <h1 className="page-title">Jarimalar</h1>

        {/* Buttons */}
        <div className="flex items-center gap-4 flex-wrap">
          <Select
            label="Status"
            value={statusFilter}
            onChange={handleStatusChange}
            options={penaltyStatusOptions}
          />

          <Button onClick={() => openModal("reducePenalty")}>
            <Minus />
            Kamaytirish
          </Button>

          <Button variant="danger" onClick={() => openModal("createPenalty")}>
            <Plus />
            Jarima yozish
          </Button>
        </div>
      </div>

      {/* Penalties Table */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
        </div>
      ) : penalties.length === 0 ? (
        <Card className="text-center py-8">
          <p className="text-sm text-gray-500">Jarimalar topilmadi</p>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto rounded-lg border border-border bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2.5 px-3">Foydalanuvchi</th>
                  <th className="text-left py-2.5 px-3">Rol</th>
                  <th className="text-left py-2.5 px-3">Sabab</th>
                  <th className="text-center py-2.5 px-3">Ball</th>
                  <th className="text-center py-2.5 px-3">Status</th>
                  <th className="text-left py-2.5 px-3">Sana</th>
                  <th className="text-center py-2.5 px-3">Harakatlar</th>
                </tr>
              </thead>
              <tbody>
                {penalties.map((penalty) => (
                  <tr
                    key={penalty._id}
                    className="border-b border-gray-50 hover:bg-gray-50/50"
                  >
                    <td className="py-2.5 px-3">
                      {formatUserName(penalty.user)}
                    </td>
                    <td className="py-2.5 px-3 text-xs text-gray-600">
                      {getRoleLabel(penalty.user?.role, roles)}
                    </td>
                    <td className="py-2.5 px-3">
                      <p className="text-xs text-gray-800 max-w-48 truncate">
                        {penalty.title || penalty.description || "—"}
                      </p>
                      {penalty.isCustom && (
                        <span className="text-[10px] text-blue-500">
                          Kategoriyasiz
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {penalty.type === "reduction" ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-green-100 text-green-700">
                          -{penalty.points}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-red-100 text-red-700">
                          +{penalty.points}
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium ${
                          penaltyStatusColors[penalty.status]
                        }`}
                      >
                        {penaltyStatusLabels[penalty.status]}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-xs text-gray-500">
                      {formatDateUZ(penalty.createdAt)}
                    </td>
                    <td className="py-2.5 px-3">
                      <Link
                        to={`/penalties/${penalty._id}`}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Ba'tafsil
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="mt-4">
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {/* Modals */}
      <CreatePenaltyModal />
      <ReducePenaltyModal />
    </div>
  );
};

export default PenaltiesPage;
