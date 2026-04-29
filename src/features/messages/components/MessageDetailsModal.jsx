// Toast
import { toast } from "sonner";

// API
import { messagesAPI } from "@/features/messages/api/messages.api";

// Components
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

// React
import { useEffect, useState } from "react";

// Icons
import { CheckCircle, XCircle, Clock } from "lucide-react";
import Button from "@/shared/components/ui/button/Button";

const MessageDetailsModal = () => (
  <ResponsiveModal name="messageDetails" title="Xabar tafsilotlari">
    <Content />
  </ResponsiveModal>
);

const Content = ({ close, ...data }) => {
  const [messageDetails, setMessageDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (data?._id) {
      setIsLoading(true);
      messagesAPI
        .getOne(data._id)
        .then((res) => {
          setMessageDetails(res.data.data);
        })
        .catch(() => {
          toast.error("Xabar tafsilotlarini yuklashda xato");
          close();
        })
        .finally(() => setIsLoading(false));
    }
  }, [data?._id]);

  if (isLoading || !messageDetails) {
    return <div className="text-center py-8">Yuklanmoqda...</div>;
  }

  // Get status icon and color
  const getStatusIcon = (status) => {
    switch (status) {
      case "sent":
        return <CheckCircle className="size-5 text-green-600" />;
      case "failed":
        return <XCircle className="size-5 text-red-600" />;
      case "pending":
        return <Clock className="size-5 text-yellow-600" />;
      default:
        return <Clock className="size-5 text-gray-600" />;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "sent":
        return "Yuborildi";
      case "failed":
        return "Xato";
      case "pending":
        return "Kutilmoqda";
      default:
        return status;
    }
  };

  const getRecipientTypeLabel = (type) => {
    const labels = {
      all: "Barchaga",
      class: "Sinfga",
      student: "O'quvchiga",
    };
    return labels[type] || type;
  };

  return (
    <div className="space-y-6">
      {/* Message Info */}
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Xabar matni
          </label>
          <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-900 whitespace-pre-wrap">
            {messageDetails.messageText}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Yuboruvchi
            </label>
            <div className="text-sm text-gray-900">
              {messageDetails.sentBy?.fullName}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Qabul qiluvchi turi
            </label>
            <div className="text-sm text-gray-900">
              {getRecipientTypeLabel(messageDetails.recipientType)}
            </div>
          </div>

          {messageDetails.classId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sinf
              </label>
              <div className="text-sm text-gray-900">
                {messageDetails.classId.name}
              </div>
            </div>
          )}

          {messageDetails.studentId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                O'quvchi
              </label>
              <div className="text-sm text-gray-900">
                {messageDetails.studentId.fullName}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Yuborilgan sana
            </label>
            <div className="text-sm text-gray-900">
              {new Date(messageDetails.createdAt).toLocaleDateString("uz-UZ")}
            </div>
            <div className="text-xs text-gray-500">
              {new Date(messageDetails.createdAt).toLocaleTimeString("uz-UZ", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Statistika
        </label>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-green-50 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-600">
              {messageDetails.stats.totalSent}
            </div>
            <div className="text-xs text-green-600 mt-1">Yuborildi</div>
          </div>
          <div className="bg-yellow-50 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {messageDetails.stats.totalPending}
            </div>
            <div className="text-xs text-yellow-600 mt-1">Kutilmoqda</div>
          </div>
          <div className="bg-red-50 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-red-600">
              {messageDetails.stats.totalFailed}
            </div>
            <div className="text-xs text-red-600 mt-1">Xato</div>
          </div>
        </div>
      </div>

      {/* Delivery Status */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Yuborish holati ({messageDetails.deliveryStatus.length})
        </label>
        <div className="max-h-80 overflow-y-auto border border-gray-200 rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                  O'quvchi
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                  Telegram ID
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                  Holat
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                  Sana
                </th>
              </tr>
            </thead>
            <tbody>
              {messageDetails.deliveryStatus.map((delivery, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-2 text-sm text-gray-900">
                    {delivery.userId?.fullName || "-"}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-500">
                    {delivery.telegramId}
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(delivery.status)}
                      <span className="text-sm text-gray-900">
                        {getStatusLabel(delivery.status)}
                      </span>
                    </div>
                    {delivery.errorMessage && (
                      <div className="text-xs text-red-600 mt-1">
                        {delivery.errorMessage}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-500">
                    {delivery.sentAt
                      ? new Date(delivery.sentAt).toLocaleTimeString("uz-UZ", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Close Button */}
      <div className="flex justify-end pt-2">
        <Button
          type="button"
          className="w-full xs:w-32"
          variant="secondary"
          onClick={() => close()}
        >
          Yopish
        </Button>
      </div>
    </div>
  );
};

export default MessageDetailsModal;
