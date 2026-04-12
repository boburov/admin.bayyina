// Tanstack Query
import { useQuery } from "@tanstack/react-query";

// Router
import { useSearchParams, Link } from "react-router-dom";

// Icons
import { Plus } from "lucide-react";

// API
import { tasksAPI } from "@/features/tasks/api/tasks.api";

// Data
import {
  taskStatusOptions,
  taskStatusLabels,
  taskStatusColors,
} from "../data/tasks.data";

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
import CreateTaskModal from "../components/CreateTaskModal";
import SelectAllUsers from "@/shared/components/ui/select/SelectAllUsers";

const TasksPage = () => {
  const { openModal } = useModal();
  const { getCollectionData: getRolesData } = useArrayStore("roles");
  const roles = getRolesData();
  const [searchParams, setSearchParams] = useSearchParams();

  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  const statusFilter = searchParams.get("status") || "all";
  const assigneeId = searchParams.get("assigneeId") || "all";

  const { data, isLoading } = useQuery({
    queryKey: ["tasks", "list", currentPage, statusFilter, assigneeId],
    queryFn: () => {
      const params = { page: currentPage, limit: 20 };
      if (statusFilter && statusFilter !== "all") params.status = statusFilter;
      if (assigneeId && assigneeId !== "all") params.assigneeId = assigneeId;
      return tasksAPI.getAll(params).then((res) => res.data);
    },
  });

  const tasks = data?.data || [];
  const pagination = data?.pagination;

  const handleFilterChange = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value && value !== "all" && value !== "") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set("page", "1");
    setSearchParams(params);
  };

  const handlePageChange = (page) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(page));
    setSearchParams(params);
  };

  const formatUserName = (user) => {
    if (!user) return "—";
    return user.lastName
      ? `${user.firstName} ${user.lastName}`
      : user.firstName;
  };

  const isOverdue = (dueDate, status) => {
    if (["completed", "stopped"].includes(status)) return false;
    return new Date(dueDate) < new Date();
  };

  return (
    <div>
      {/* Top */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <h1 className="page-title">Topshiriqlar</h1>

        <div className="flex items-center gap-3 flex-wrap">
          <Select
            value={statusFilter}
            options={taskStatusOptions}
            onChange={(v) => handleFilterChange("status", v)}
          />

          <SelectAllUsers
            hideLabel
            label={null}
            className="w-56"
            value={assigneeId}
            onChange={(v) => handleFilterChange("assigneeId", v)}
            formatUsers={(user) => ({
              value: user._id,
              label: `${user.firstName} ${user.lastName?.[0] + "."} (${user.role})`,
            })}
          />

          <Button onClick={() => openModal("createTask")}>
            <Plus />
            Topshiriq yaratish
          </Button>
        </div>
      </div>

      {/* Tasks Table */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
        </div>
      ) : tasks.length === 0 ? (
        <Card className="text-center py-8">
          <p className="text-sm text-gray-500">Topshiriqlar topilmadi</p>
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border bg-white">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2.5 px-3">Ijrochi</th>
                <th className="text-left py-2.5 px-3">Sarlavha</th>
                <th className="text-left py-2.5 px-3">Ijro muddati</th>
                <th className="text-center py-2.5 px-3">Jarima bali</th>
                <th className="text-center py-2.5 px-3">Status</th>
                <th className="text-left py-2.5 px-3">Yaratilgan</th>
                <th className="text-center py-2.5 px-3">Harakatlar</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr
                  key={task._id}
                  className="border-b border-gray-50 hover:bg-gray-50/50"
                >
                  <td className="py-2.5 px-3">
                    <p className="font-medium text-gray-800">
                      {formatUserName(task.assignee)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {getRoleLabel(task.assignee?.role, roles)}
                    </p>
                  </td>
                  <td className="py-2.5 px-3">
                    <p className="max-w-48 truncate text-gray-800">
                      {task.title}
                    </p>
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={
                        isOverdue(task.dueDate, task.status)
                          ? "text-red-600 font-medium"
                          : "text-gray-600"
                      }
                    >
                      {formatDateUZ(task.dueDate)}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-red-50 text-red-600">
                      {task.penaltyPoints} ball
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium ${taskStatusColors[task.status]}`}
                    >
                      {taskStatusLabels[task.status]}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-xs text-gray-500">
                    {formatDateUZ(task.createdAt)}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <Link
                      to={`/tasks/${task._id}`}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Batafsil
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
      <CreateTaskModal />
    </div>
  );
};

export default TasksPage;
