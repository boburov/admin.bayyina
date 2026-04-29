// Toast
import { toast } from "sonner";

// API
import { usersAPI } from "@/features/users/api/users.api";

// Components
import Input from "@/shared/components/form/input";
import Button from "@/shared/components/form/button";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

// Hooks
import useObjectState from "@/shared/hooks/useObjectState";

// React
import { useEffect, useState } from "react";

// Icons
import { Eye, EyeOff, Copy, KeyRound } from "lucide-react";

const ResetUserPasswordModal = () => (
  <ResponsiveModal
    name="resetUserPassword"
    title="Parol"
  >
    <Content />
  </ResponsiveModal>
);

const Content = ({ close, isLoading, setIsLoading, ...user }) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [fetchingPassword, setFetchingPassword] = useState(true);
  const [changeMode, setChangeMode] = useState(false);

  const { password, setField } = useObjectState({ password: "" });

  // Fetch current password on mount
  useEffect(() => {
    usersAPI
      .getPassword(user._id)
      .then((res) => setCurrentPassword(res.data.user.password))
      .catch(() => toast.error("Parolni yuklashda xatolik"))
      .finally(() => setFetchingPassword(false));
  }, []);

  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(currentPassword)
      .then(() => toast.success("Parol nusxalandi"))
      .catch(() => toast.error("Nusxalashda xatolik"));
  };

  const handleReset = (e) => {
    e.preventDefault();
    setIsLoading(true);

    usersAPI
      .resetPassword(user._id, password.trim())
      .then(() => {
        close();
        toast.success("Parol yangilandi");
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || "Xatolik yuz berdi");
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <div className="space-y-4">
      {/* Current password */}
      <div className="flex flex-col gap-1.5">
        <label className="ml-1 text-sm font-medium text-gray-700">
          Mavjud parol
        </label>

        {fetchingPassword ? (
          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
            <span className="text-sm text-gray-400">Yuklanmoqda...</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <code className="flex-1 text-sm font-mono break-all text-gray-800">
              {showCurrent ? currentPassword : "••••••••••••"}
            </code>

            <button
              type="button"
              onClick={() => setShowCurrent((v) => !v)}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
            >
              {showCurrent ? (
                <EyeOff className="size-4 text-gray-500" strokeWidth={1.5} />
              ) : (
                <Eye className="size-4 text-gray-500" strokeWidth={1.5} />
              )}
            </button>

            <button
              type="button"
              onClick={copyToClipboard}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
            >
              <Copy className="size-4 text-gray-500" strokeWidth={1.5} />
            </button>
          </div>
        )}
      </div>

      {/* Toggle change mode */}
      {!changeMode ? (
        <button
          type="button"
          onClick={() => setChangeMode(true)}
          className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
        >
          <KeyRound className="size-4" strokeWidth={1.5} />
          Parolni o'zgartirish
        </button>
      ) : (
        <form onSubmit={handleReset} className="space-y-3.5">
          <Input
            required
            autoFocus
            minLength={6}
            type="password"
            name="password"
            value={password}
            label="Yangi parol"
            onChange={(v) => setField("password", v)}
          />

          <div className="flex flex-col-reverse gap-3 xs:flex-row xs:justify-end">
            <Button
              type="button"
              variant="neutral"
              className="w-full xs:w-32"
              onClick={() => setChangeMode(false)}
            >
              Bekor qilish
            </Button>
            <Button
              className="w-full xs:w-32"
              variant="primary"
              disabled={isLoading}
            >
              Saqlash{isLoading && "..."}
            </Button>
          </div>
        </form>
      )}

      {/* Close — only when not in change mode */}
      {!changeMode && (
        <div className="flex justify-end">
          <Button
            type="button"
            variant="neutral"
            className="w-full xs:w-32"
            onClick={() => close()}
          >
            Yopish
          </Button>
        </div>
      )}
    </div>
  );
};

export default ResetUserPasswordModal;
