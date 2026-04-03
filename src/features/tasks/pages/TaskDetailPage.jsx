// Toast
import { toast } from "sonner";

// Router
import { useParams, useNavigate } from "react-router-dom";

// Icons
import { ArrowLeft, ClipboardList } from "lucide-react";

// Tanstack Query
import { useQuery, useQueryClient } from "@tanstack/react-query";

// API
import { tasksAPI } from "@/features/tasks/api/tasks.api";

// Data
import {
  taskStatusLabels,
  taskStatusColors,
  ACTIVE_TASK_STATUSES,
} from "../data/tasks.data";

// Helpers
import { getRoleLabel } from "@/shared/helpers/role.helpers";
import { formatDateUZ } from "@/shared/utils/date.utils";

// Hooks
import useArrayStore from "@/shared/hooks/useArrayStore";
import useModal from "@/shared/hooks/useModal";

// Components
import Card from "@/shared/components/ui/Card";
import Button from "@/shared/components/ui/button/Button";

// Modals
import ReviewTaskModal from "../components/ReviewTaskModal";
import ExtendDeadlineModal from "../components/ExtendDeadlineModal";
import StopTaskModal from "../components/StopTaskModal";

const TaskDetailPage = () => {
  const { getCollectionData: getRolesData } = useArrayStore("roles");
  const roles = getRolesData();
  const { taskId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { openModal } = useModal();

  const { data: task, isLoading } = useQuery({
    queryKey: ["tasks", "detail", taskId],
    queryFn: () => tasksAPI.getById(taskId).then((res) => res.data.data),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
      </div>
    );
  }

  if (!task) return null;

  const isOverdue = new Date(task.dueDate) < new Date();
  const isActive = ACTIVE_TASK_STATUSES.includes(task.status);

  /**
   * Foydalanuvchi to'liq ismini qaytaradi
   * @param {object} user
   * @returns {string}
   */
  const formatUserName = (user) => {
    if (!user) return "—";
    return user.lastName
      ? `${user.firstName} ${user.lastName}`
      : user.firstName;
  };

  return (
    <div>
      {/* Header */}
      <Card className="mb-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
            >
              <ArrowLeft className="size-4" />
            </button>
            <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <ClipboardList className="size-5 text-indigo-500" />
              Topshiriq tafsilotlari
            </h2>
          </div>
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${taskStatusColors[task.status]}`}
          >
            {taskStatusLabels[task.status]}
          </span>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main — left (2/3) */}
        <div className="lg:col-span-2 space-y-4">
          {/* Basic info */}
          <Card>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Asosiy ma'lumotlar
            </h3>
            <div className="space-y-2.5 text-sm">
              <InfoRow label="Sarlavha">
                <span className="font-medium">{task.title}</span>
              </InfoRow>
              <InfoRow label="Ijrochi">
                <span className="font-medium">
                  {formatUserName(task.assignee)}
                </span>
                <span className="text-gray-400 ml-1 text-xs">
                  ({getRoleLabel(task.assignee?.role, roles)})
                </span>
              </InfoRow>
              <InfoRow label="Yaratuvchi">
                {formatUserName(task.createdBy)}
              </InfoRow>
              <InfoRow label="Ijro muddati">
                <span
                  className={
                    isOverdue && !["completed", "stopped"].includes(task.status)
                      ? "text-red-600 font-semibold"
                      : ""
                  }
                >
                  {formatDateUZ(task.dueDate)}
                  {isOverdue &&
                    !["completed", "stopped"].includes(task.status) && (
                      <span className="ml-1 text-xs text-red-500">
                        (Muddati o'tgan)
                      </span>
                    )}
                </span>
              </InfoRow>
              <InfoRow label="Jarima bali">
                <span className="font-semibold text-red-600">
                  {task.penaltyPoints} ball
                </span>
              </InfoRow>
              <InfoRow label="Yaratilgan">
                {formatDateUZ(task.createdAt)}
              </InfoRow>
            </div>

            {task.description && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-500 mb-1">Tavsif</p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {task.description}
                </p>
              </div>
            )}
          </Card>

          {/* Owner attachments */}
          {task.attachments?.length > 0 && (
            <Card>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Topshiriq fayllari
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {task.attachments.map((att, idx) => (
                  <AttachmentItem key={idx} attachment={att} />
                ))}
              </div>
            </Card>
          )}

          {/* Completion info */}
          {(task.completionNote || task.completionAttachments?.length > 0) && (
            <Card>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Yakunlash ma'lumotlari
              </h3>
              {task.completionNote && (
                <div className="mb-3">
                  <p className="text-xs text-gray-500 mb-1">Ijrochi izohi</p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {task.completionNote}
                  </p>
                </div>
              )}
              {task.completionAttachments?.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {task.completionAttachments.map((att, idx) => (
                    <AttachmentItem key={idx} attachment={att} />
                  ))}
                </div>
              )}
            </Card>
          )}

          {/* Status history (chat-like) */}
          {task.statusHistory?.length > 0 && (
            <Card>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Status tarixi
              </h3>
              <div className="space-y-3">
                {task.statusHistory.map((entry, idx) => {
                  const isSystem = !entry.changedBy;
                  const authorName = isSystem
                    ? "Tizim"
                    : entry.changedBy?.lastName
                      ? `${entry.changedBy.firstName} ${entry.changedBy.lastName}`
                      : entry.changedBy?.firstName || "—";

                  return (
                    <div key={idx} className="flex gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600">
                        {isSystem ? "T" : authorName.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                          <span className="text-xs font-medium text-gray-700">
                            {authorName}
                          </span>
                          <span
                            className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${taskStatusColors[entry.status]}`}
                          >
                            {taskStatusLabels[entry.status]}
                          </span>
                          <span className="text-[11px] text-gray-400">
                            {formatDateUZ(entry.changedAt)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2">
                          {entry.reason}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar — right (1/3) */}
        <div className="space-y-4">
          {/* Deadline history */}
          {task.deadlineHistory?.length > 0 && (
            <Card>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Muddat tarixi
              </h3>
              <div className="space-y-3">
                {task.deadlineHistory.map((entry, idx) => (
                  <div
                    key={idx}
                    className="text-xs border-b border-gray-50 pb-3 last:border-0 last:pb-0"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-gray-500 line-through">
                        {formatDateUZ(entry.oldDueDate)}
                      </span>
                      <span className="text-gray-400 mx-1">→</span>
                      <span className="font-medium text-gray-800">
                        {formatDateUZ(entry.newDueDate)}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-1">{entry.reason}</p>
                    <div className="flex items-center justify-between text-gray-400">
                      <span>
                        {entry.changedBy?.lastName
                          ? `${entry.changedBy.firstName} ${entry.changedBy.lastName}`
                          : entry.changedBy?.firstName}
                      </span>
                      {entry.withPenalty && (
                        <span className="text-red-500">
                          +{entry.penaltyPoints} ball jarima
                        </span>
                      )}
                    </div>
                    <p className="text-gray-400 mt-0.5">
                      {formatDateUZ(entry.changedAt)}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Penalty info */}
          {task.penaltyRef && (
            <Card>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Jarima ma'lumotlari
              </h3>
              <div className="space-y-2 text-sm">
                <InfoRow label="Jarima bali">
                  <span className="font-semibold text-red-600">
                    {task.penaltyRef.points} ball
                  </span>
                </InfoRow>
                <InfoRow label="Sana">
                  {formatDateUZ(task.penaltyRef.createdAt)}
                </InfoRow>
              </div>
            </Card>
          )}

          {/* Actions */}
          {isActive && (
            <Card>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Amallar
              </h3>
              <div className="space-y-2">
                {task.status === "pending_review" && (
                  <Button
                    variant="outline"
                    className="w-full text-sm"
                    onClick={() =>
                      openModal("reviewTask", {
                        taskId: task._id,
                        dueDate: task.dueDate,
                      })
                    }
                  >
                    Ko'rib chiqish
                  </Button>
                )}

                {task.status !== "pending_review" && (
                  <Button
                    variant="outline"
                    className="w-full text-sm"
                    onClick={() =>
                      openModal("extendDeadline", {
                        taskId: task._id,
                        currentDueDate: task.dueDate,
                      })
                    }
                  >
                    Muddatni uzaytirish
                  </Button>
                )}

                <Button
                  variant="danger"
                  className="w-full text-sm"
                  onClick={() =>
                    openModal("stopTask", {
                      taskId: task._id,
                      defaultPenaltyPoints: task.penaltyPoints,
                    })
                  }
                >
                  To'xtatish
                </Button>
              </div>
            </Card>
          )}

          {/* User stats */}
          <Card>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Ijrochi holati
            </h3>
            <div className="space-y-2 text-sm">
              <InfoRow label="Jami jarima bali">
                <span className="font-semibold text-red-600">
                  {task.assignee?.penaltyPoints ?? "—"}
                </span>
              </InfoRow>
            </div>
          </Card>
        </div>
      </div>

      {/* Modals */}
      <ReviewTaskModal />
      <ExtendDeadlineModal />
      <StopTaskModal />
    </div>
  );
};

/**
 * Ma'lumot qatori komponenti
 * @param {Object} props
 * @param {string} props.label - Maydon nomi
 * @param {React.ReactNode} props.children - Maydon qiymati
 */
const InfoRow = ({ label, children }) => (
  <p>
    <span className="text-gray-500">{label}:</span> <span>{children}</span>
  </p>
);

/**
 * Biriktirma elementi komponenti
 * @param {Object} props
 * @param {Object} props.attachment - Biriktirma (url, type, originalName)
 */
const AttachmentItem = ({ attachment }) => {
  const { url, type, originalName } = attachment;

  if (type === "image") {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer">
        <img
          src={url}
          alt={originalName}
          className="w-full h-auto max-h-64 object-cover rounded-lg border"
        />
      </a>
    );
  }

  if (type === "video") {
    return (
      <video
        src={url}
        controls
        className="w-full h-auto max-h-64 rounded-lg border"
      />
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 p-3 rounded-lg border hover:bg-gray-50 text-sm"
    >
      <span className="truncate">{originalName || "Fayl"}</span>
    </a>
  );
};

export default TaskDetailPage;
