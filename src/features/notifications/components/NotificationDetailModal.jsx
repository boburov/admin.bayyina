// Hooks
import useModal from "@/shared/hooks/useModal";

// Utils
import { formatUzDate } from "@/shared/utils/formatDate";

// Icons
import { MessageSquare, User } from "lucide-react";

// Shadcn
import {
  Dialog,
  DialogTitle,
  DialogHeader,
  DialogContent,
  DialogDescription,
} from "@/shared/components/shadcn/dialog";

// Data
import { typeLabel, statusLabel } from "@/features/notifications/data/notifications.data";

const NotificationDetailModal = () => {
  const { isOpen, data: n, closeModal } = useModal("notificationDetail");

  if (!n) return null;

  const st = statusLabel[n.status] ?? statusLabel.pending;
  const feedbacks = n.feedback ?? [];

  return (
    <Dialog open={isOpen} onOpenChange={() => closeModal("notificationDetail")}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold text-gray-900 leading-snug">
            {n.title}
          </DialogTitle>
          <DialogDescription asChild>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-gray-400">
                {typeLabel[n.type] ?? n.type}
              </span>
              <span className="text-gray-300">·</span>
              <span className={`text-xs px-2 py-0.5 font-medium ${st.cls}`}>
                {st.text}
              </span>
              <span className="text-gray-300">·</span>
              <span className="text-xs text-gray-400">
                {formatUzDate(n.createdAt)}
              </span>
            </div>
          </DialogDescription>
        </DialogHeader>

        {/* Message body */}
        <div className="border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 leading-relaxed">
          {n.message}
        </div>

        {/* Feedback thread */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            <MessageSquare className="w-3.5 h-3.5" />
            Fikr-mulohazalar ({feedbacks.length})
          </div>

          {feedbacks.length === 0 ? (
            <p className="text-sm text-gray-400 py-2">
              Hali hech qanday javob yo'q
            </p>
          ) : (
            <div className="divide-y divide-gray-100 border border-gray-200">
              {feedbacks.map((fb) => (
                <div key={fb._id} className="px-4 py-3">
                  <div className="flex items-center gap-2 mb-1">
                    <User className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-xs font-medium text-gray-600 capitalize">
                      {fb.role}
                    </span>
                    <span className="text-xs text-gray-400 ml-auto">
                      {formatUzDate(fb.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{fb.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NotificationDetailModal;
