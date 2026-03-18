// UI
import { toast } from "sonner";

// API
import { usersAPI } from "@/features/users/api/users.api";

// React
import { useEffect, useState } from "react";

// Icons
import { Eye, EyeOff, Copy } from "lucide-react";

// Components
import Button from "@/shared/components/form/button";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

const ViewUserPasswordModal = () => (
  <ResponsiveModal
    name="viewUserPassword"
    title="Foydalanuvchining parolini ko'rish"
  >
    <Content />
  </ResponsiveModal>
);

const Content = ({ close, isLoading, setIsLoading, ...modalData }) => {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const fetchPassword = () => {
    setIsLoading(true);

    usersAPI
      .getPassword(modalData._id)
      .then((res) => {
        setPassword(res.data.data.password);
      })
      .catch(({ message }) => {
        close();
        toast.error(message || "Parolni yuklashda xatolik yuz berdi");
      })
      .finally(() => setIsLoading(false));
  };

  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(password)
      .then(() => {
        toast.success("Parol nusxalandi");
      })
      .catch(() => {
        toast.error("Parol nusxalashda xatolik yuz berdi");
      });
  };

  useEffect(() => {
    fetchPassword();
  }, []);

  return (
    <div className="space-y-4">
      {/* Loading state */}
      {isLoading && <div className="text-center py-4">Yuklanmoqda...</div>}

      {/* Password display */}
      {!isLoading && (
        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
          {/* Password */}
          <code className="flex-1 text-sm font-mono break-all">
            {showPassword ? password : "••••••••••••••••"}
          </code>

          {/* Toggle Password Visibility */}
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="p-1 hover:bg-gray-200 rounded"
          >
            {showPassword ? (
              <EyeOff className="size-5 text-gray-600" />
            ) : (
              <Eye className="size-5 text-gray-600" />
            )}
          </button>

          {/* Copy */}
          <button
            type="button"
            onClick={copyToClipboard}
            className="p-1 hover:bg-gray-200 rounded"
          >
            <Copy className="size-5 text-gray-600" />
          </button>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <Button
          type="button"
          onClick={close}
          variant="neutral"
          className="w-full xs:w-32"
        >
          Yopish
        </Button>
      </div>
    </div>
  );
};

export default ViewUserPasswordModal;
