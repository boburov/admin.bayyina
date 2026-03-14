// Toast
import { toast } from "sonner";

// React
import { useState } from "react";

// Router
import { useParams, useNavigate } from "react-router-dom";

// Icons
import { ArrowLeft, AlertTriangle } from "lucide-react";

// Tanstack Query
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// API
import { penaltiesAPI } from "@/shared/api/penalties.api";

// Data
import {
  penaltyStatusLabels,
  penaltyStatusColors,
  penaltyReviewOptions,
} from "../data/penalties.data";

// Helpers
import { getRoleLabel } from "@/shared/helpers/role.helpers";
import { formatDateUZ } from "@/shared/utils/date.utils";

// Components
import Card from "@/shared/components/ui/Card";
import Button from "@/shared/components/ui/button/Button";
import Select from "@/shared/components/ui/select/Select";
import Input from "@/shared/components/ui/input/Input";

const PenaltyDetailPage = () => {
  const { penaltyId } = useParams();
  const navigate = useNavigate();

  const queryClient = useQueryClient();

  const [reviewStatus, setReviewStatus] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");

  const { data: penalty, isLoading: loading } = useQuery({
    queryKey: ["penalties", "detail", penaltyId],
    queryFn: () => penaltiesAPI.getById(penaltyId).then((res) => res.data.data),
  });

  const reviewMutation = useMutation({
    mutationFn: (body) => penaltiesAPI.review(penaltyId, body),
    onSuccess: (res) => {
      queryClient.setQueryData(["penalties", "detail", penaltyId], res.data.data);
      queryClient.invalidateQueries({ queryKey: ["penalties", "list"] });
      toast.success(
        reviewStatus === "approved" ? "Jarima tasdiqlandi" : "Jarima rad etildi",
      );
      setReviewStatus("");
      setRejectionReason("");
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
  });

  const handleReview = () => {
    if (!reviewStatus) return;
    if (reviewStatus === "rejected" && !rejectionReason.trim()) {
      toast.error("Rad etish sababini kiriting");
      return;
    }
    const body = { status: reviewStatus };
    if (reviewStatus === "rejected") body.rejectionReason = rejectionReason;
    reviewMutation.mutate(body);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
      </div>
    );
  }

  if (!penalty) return null;

  const isReduction = penalty.type === "reduction";

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
              <AlertTriangle className="size-5 text-red-500" />
              Jarima tafsilotlari
            </h2>
          </div>
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${penaltyStatusColors[penalty.status]}`}
          >
            {penaltyStatusLabels[penalty.status]}
          </span>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main info */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Asosiy ma'lumotlar
            </h3>
            <div className="space-y-2.5 text-sm">
              <InfoRow label="Tur">
                {isReduction ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-green-100 text-green-700">
                    Kamaytirish
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-red-100 text-red-700">
                    Jarima
                  </span>
                )}
              </InfoRow>

              <InfoRow label="Foydalanuvchi">
                <span className="font-medium">
                  {penalty.user?.firstName} {penalty.user?.lastName}
                </span>
                {penalty.user?.username && (
                  <span className="text-gray-400 ml-1">
                    (@{penalty.user.username})
                  </span>
                )}
              </InfoRow>

              <InfoRow label="Rol">{getRoleLabel(penalty.user?.role)}</InfoRow>

              {(penalty.title || penalty.description) && (
                <InfoRow label="Sabab">
                  <span className="font-medium">
                    {penalty.title || penalty.description}
                  </span>
                </InfoRow>
              )}

              {penalty.title && penalty.description && (
                <InfoRow label="Izoh">{penalty.description}</InfoRow>
              )}

              <InfoRow label="Ball">
                {isReduction ? (
                  <span className="font-semibold text-green-600">
                    -{penalty.points}
                  </span>
                ) : (
                  <span className="font-semibold text-red-600">
                    +{penalty.points}
                  </span>
                )}
              </InfoRow>

              {penalty.fineAmount > 0 && (
                <InfoRow label="Jarima summasi">
                  {penalty.fineAmount.toLocaleString("uz-UZ")} so'm
                </InfoRow>
              )}

              {penalty.isCustom && (
                <InfoRow label="Kategoriya">
                  <span className="text-blue-500 text-xs">Kategoriyasiz</span>
                </InfoRow>
              )}

              {penalty.category && (
                <InfoRow label="Kategoriya">{penalty.category.title}</InfoRow>
              )}

              <InfoRow label="Yozgan">
                {penalty.givenBy?.firstName} {penalty.givenBy?.lastName}
                <span className="text-gray-400 ml-1 text-xs">
                  ({getRoleLabel(penalty.givenBy?.role)})
                </span>
              </InfoRow>

              <InfoRow label="Sana">{formatDateUZ(penalty.createdAt)}</InfoRow>
            </div>
          </Card>

          {/* Review info */}
          {penalty.reviewedBy && (
            <Card>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Ko'rib chiqish
              </h3>
              <div className="space-y-2.5 text-sm">
                <InfoRow label="Ko'rib chiqqan">
                  {penalty.reviewedBy?.firstName} {penalty.reviewedBy?.lastName}
                </InfoRow>
                <InfoRow label="Sana">
                  {formatDateUZ(penalty.reviewedAt)}
                </InfoRow>
                {penalty.rejectionReason && (
                  <InfoRow label="Rad etish sababi">
                    <span className="text-red-600">
                      {penalty.rejectionReason}
                    </span>
                  </InfoRow>
                )}
              </div>
            </Card>
          )}

          {/* Attachments */}
          {penalty.attachments?.length > 0 && (
            <Card>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Biriktirmalar
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {penalty.attachments.map((att, idx) => (
                  <AttachmentItem key={idx} attachment={att} />
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* User stats */}
          <Card>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Foydalanuvchi holati
            </h3>
            <div className="space-y-2 text-sm">
              <InfoRow label="Jami jarima bali">
                <span className="font-semibold text-red-600">
                  {penalty.user?.penaltyPoints ?? "—"}
                </span>
              </InfoRow>
            </div>
          </Card>

          {/* Review action */}
          {penalty.status === "pending" && (
            <Card>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Qaror qabul qilish
              </h3>
              <div className="space-y-3">
                <Select
                  label="Status"
                  value={reviewStatus}
                  onChange={setReviewStatus}
                  options={penaltyReviewOptions}
                />

                {reviewStatus === "rejected" && (
                  <Input
                    required
                    label="Rad etish sababi"
                    type="textarea"
                    value={rejectionReason}
                    onChange={setRejectionReason}
                    placeholder="Sababini kiriting..."
                  />
                )}

                {reviewStatus && (
                  <Button
                    variant={reviewStatus === "approved" ? "primary" : "danger"}
                    disabled={
                      reviewMutation.isPending ||
                      (reviewStatus === "rejected" && !rejectionReason.trim())
                    }
                    className="w-full text-sm font-medium"
                    onClick={handleReview}
                  >
                    {reviewMutation.isPending
                      ? "Saqlanmoqda..."
                      : reviewStatus === "approved"
                        ? "Tasdiqlash"
                        : "Rad etish"}
                  </Button>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>
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
 * @param {Object} props.attachment - Biriktirma ma'lumotlari (url, type, originalName)
 */
const AttachmentItem = ({ attachment }) => {
  const { url, type, originalName } = attachment;

  if (type === "image") {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer">
        <img
          src={url}
          alt={originalName}
          className="w-full h-32 object-cover rounded-lg border"
        />
      </a>
    );
  }

  if (type === "video") {
    return (
      <video
        src={url}
        controls
        className="w-full h-32 rounded-lg border object-cover"
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

export default PenaltyDetailPage;
