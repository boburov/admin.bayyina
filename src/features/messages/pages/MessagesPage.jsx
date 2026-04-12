// Toast
import { toast } from "sonner";

// API
import { messagesAPI } from "@/features/messages/api/messages.api";
import { usersAPI } from "@/features/users/api/users.api";
import { classesAPI } from "@/features/classes/api/classes.api";

// Router
import { useSearchParams } from "react-router-dom";

// Helpers
import { getRoleLabel } from "@/shared/helpers/role.helpers";

// Hooks
import useModal from "@/shared/hooks/useModal";
import useArrayStore from "@/shared/hooks/useArrayStore";

// Components
import Button from "@/shared/components/ui/button/Button";
import Select from "@/shared/components/ui/select/Select";
import Pagination from "@/shared/components/ui/Pagination";

// React
import { useEffect, useCallback, useState } from "react";

// Icons
import { Plus, Eye } from "lucide-react";

// Recipient type options
const recipientTypeOptions = [
  { value: "all_type", label: "Barchasi" },
  { value: "all", label: "Maktab" },
  { value: "class", label: "Sinf" },
  { value: "student", label: "O'quvchi" },
];

const Messages = () => {
  const { openModal } = useModal();

  // Search params
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  const recipientTypeFilter = searchParams.get("recipientType") || "";
  const sentByFilter = searchParams.get("sentBy") || "";
  const classIdFilter = searchParams.get("classId") || "";

  // State for filters
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);

  // Handle recipient type filter change
  const handleRecipientTypeChange = useCallback(
    (value) => {
      const params = new URLSearchParams(searchParams);
      if (value && value !== "all_type") {
        params.set("recipientType", value);
      } else {
        params.delete("recipientType");
      }
      params.set("page", "1");
      setSearchParams(params);
    },
    [searchParams, setSearchParams],
  );

  // Handle sent by filter change
  const handleSentByChange = useCallback(
    (value) => {
      const params = new URLSearchParams(searchParams);
      if (value && value !== "all") {
        params.set("sentBy", value);
      } else {
        params.delete("sentBy");
      }
      params.set("page", "1");
      setSearchParams(params);
    },
    [searchParams, setSearchParams],
  );

  // Handle class filter change
  const handleClassChange = useCallback(
    (value) => {
      const params = new URLSearchParams(searchParams);
      if (value && value !== "all") {
        params.set("classId", value);
      } else {
        params.delete("classId");
      }
      params.set("page", "1");
      setSearchParams(params);
    },
    [searchParams, setSearchParams],
  );

  const {
    setPage,
    initialize,
    getMetadata,
    getPageData,
    hasCollection,
    setPageErrorState,
    setPageLoadingState,
  } = useArrayStore("messages");

  const { getCollectionData: getRolesData } = useArrayStore("roles");
  const roles = getRolesData();

  // Initialize collection on mount
  useEffect(() => {
    if (!hasCollection()) initialize(true); // pagination = true
  }, [hasCollection, initialize]);

  const metadata = getMetadata();
  const pageData = getPageData(currentPage);

  const messages = pageData?.data || [];
  const hasError = pageData?.error || null;
  const isLoading = pageData?.isLoading || false;
  const hasNextPage = pageData?.hasNextPage ?? false;
  const hasPrevPage = pageData?.hasPrevPage ?? false;

  // Load messages for current page
  const fetchMessages = useCallback(
    (page, recipientType, sentBy, classId) => {
      setPageLoadingState(page, true);
      const params = { page, limit: 20 };
      if (recipientType) params.recipientType = recipientType;
      if (sentBy) params.sentBy = sentBy;
      if (classId) params.classId = classId;

      messagesAPI
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

  // Load messages when page or filters change
  useEffect(() => {
    fetchMessages(
      currentPage,
      recipientTypeFilter,
      sentByFilter,
      classIdFilter,
    );
  }, [
    currentPage,
    recipientTypeFilter,
    sentByFilter,
    classIdFilter,
    messages?.length,
  ]);

  useEffect(() => {
    // Load teachers
    usersAPI
      .getAll({ role: "teacher", limit: 200 })
      .then((res) => {
        setTeachers(res.data.data || []);
      })
      .catch(() => {
        toast.error("O'qituvchilarni yuklashda xato");
      });

    // Load classes
    classesAPI
      .getAll()
      .then((res) => {
        setClasses(res.data.data || []);
      })
      .catch(() => {
        toast.error("Sinflarni yuklashda xato");
      });
  }, []);

  // Get recipient type label
  const getRecipientTypeLabel = (type) => {
    const labels = {
      all: "Barchaga",
      class: "Sinfga",
      student: "O'quvchiga",
    };
    return labels[type] || type;
  };

  // Get status badge color
  const getStatusColor = (stats) => {
    if (stats.totalPending > 0) {
      return "bg-yellow-100 text-yellow-800";
    } else if (stats.totalFailed > 0) {
      return "bg-red-100 text-red-800";
    } else {
      return "bg-green-100 text-green-800";
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Yuklanmoqda...</div>;
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between gap-4 mb-4">
        {/* Title */}
        <h1 className="page-title">Xabalar</h1>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Recipient Type Filter */}
          <Select
            placeholder="Qabul qiluvchi"
            options={recipientTypeOptions}
            onChange={handleRecipientTypeChange}
            value={recipientTypeFilter || "all_type"}
          />

          {/* Sent By Filter */}
          <Select
            placeholder="Yuboruvchi"
            onChange={handleSentByChange}
            value={sentByFilter || "all"}
            options={[
              { value: "all", label: "Barcha yuboruvchilar" },
              ...teachers.map((t) => ({
                value: t._id,
                label: t.fullName,
              })),
            ]}
          />

          {/* Class Filter */}
          <Select
            placeholder="Sinf"
            onChange={handleClassChange}
            value={classIdFilter || "all"}
            options={[
              { value: "all", label: "Barcha sinflar" },
              ...classes.map((c) => ({
                value: c._id,
                label: c.name,
              })),
            ]}
          />

          {/* Create New Btn */}
          <Button onClick={() => openModal("sendMessage")}>
            <Plus strokeWidth={1.5} />
            Yangi xabar
          </Button>
        </div>
      </div>

      {/* Table */}
      <div>
        <div className="rounded-lg overflow-x-auto border border-border bg-white">
          <table>
            {/* Thead */}
            <thead>
              <tr>
                <th>Xabar</th>
                <th>Yuboruvchi</th>
                <th>Kimga</th>
                <th>Status</th>
                <th>Sana</th>
                <th>Harakatlar</th>
              </tr>
            </thead>

            {/* Tbody */}
            <tbody>
              {messages.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    Xabarlar topilmadi
                  </td>
                </tr>
              ) : (
                messages.map((message) => (
                  <tr key={message._id} className="hover:bg-gray-50">
                    {/* Message Text */}
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {message.messageText}
                      </div>
                    </td>

                    {/* Sent By */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {message.sentBy?.fullName}
                      </div>
                      <div className="text-xs text-gray-500">
                        {getRoleLabel(message.sentBy?.role, roles)}
                      </div>
                    </td>

                    {/* Recipient Type */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {getRecipientTypeLabel(message.recipientType)}
                      </div>
                      {message.classId && (
                        <div className="text-xs text-gray-500">
                          {message.classId.name}
                        </div>
                      )}
                      {message.studentId && (
                        <div className="text-xs text-gray-500">
                          {message.studentId.fullName}
                        </div>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`${getStatusColor(
                          message.stats,
                        )} px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full`}
                      >
                        {message.stats.totalSent}/{message.totalRecipients}
                      </span>
                      {message.stats.totalFailed > 0 && (
                        <div className="text-xs text-red-600 mt-1">
                          {message.stats.totalFailed} xato
                        </div>
                      )}
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(message.createdAt).toLocaleDateString(
                          "uz-UZ",
                        )}
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(message.createdAt).toLocaleTimeString(
                          "uz-UZ",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => openModal("messageDetails", message)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Batafsil"
                      >
                        <Eye className="size-5" strokeWidth={1.5} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Desktop Pagination Controls */}
        {!isLoading && !hasError && messages.length > 0 && (
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
      {!isLoading && !hasError && messages.length > 0 && (
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

export default Messages;
