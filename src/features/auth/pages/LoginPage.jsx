// Toast
import { toast } from "sonner";

// Utils
import { cn } from "@/shared/utils/cn";

// Router
import { useNavigate } from "react-router-dom";

// Data
import platforms from "../data/platforms.data";

// Icons
import { Check, ChevronLeft } from "lucide-react";

// API
import { authAPI } from "@/features/auth/api/auth.api";

// Hooks
import useObjectState from "@/shared/hooks/useObjectState";

// Shared UI components
import InputTel from "@/shared/components/ui/input/InputTel";
import InputPwd from "@/shared/components/ui/input/InputPwd";
import { logoIcon } from "@/shared/assets/icons";

const LoginPage = () => {
  const { setField, showLoginForm, currentPlatform } = useObjectState({
    showLoginForm: false,
    currentPlatform: platforms.find((platform) => platform.isCurrent),
  });

  return (
    <div className="min-h-svh flex items-center justify-center bg-white px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <img
            src={logoIcon}
            alt="Bayyina logo svg"
            className="w-12 h-12 object-contain"
          />
          <div className="text-center">
            <h1 className="text-lg font-semibold text-gray-900">Bayyina</h1>
            <p className="text-sm text-gray-400 mt-0.5">Boshqaruv paneli</p>
          </div>
        </div>

        {/* Form area */}
        <div className="border border-gray-200 bg-white px-6 py-7">
          {showLoginForm ? (
            <LoginForm
              onShowLoginForm={() => setField("showLoginForm", false)}
            />
          ) : (
            <PlatformSelectForm
              currentPlatform={currentPlatform}
              onShowLoginForm={() => setField("showLoginForm", true)}
              onPlatformChange={(p) => setField("currentPlatform", p)}
            />
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mt-5">
          © {new Date().getFullYear()} Bayyina Ta'lim Markazi
        </p>
      </div>
    </div>
  );
};

const PlatformSelectForm = ({
  onShowLoginForm,
  currentPlatform,
  onPlatformChange,
}) => {
  const handleShowLoginForm = () => {
    if (currentPlatform.isCurrent) onShowLoginForm();
    else window.location.href = currentPlatform.href;
  };

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold text-gray-700 mb-5">
        Kim sifatida kirasiz?
      </h2>

      {platforms.map((platform) => {
        const isCurrent = currentPlatform.name === platform.name;
        return (
          <button
            key={platform.name}
            type="button"
            onClick={() => onPlatformChange(platform)}
            className={cn(
              "relative w-full flex items-center justify-between px-4 py-3 text-sm font-medium border transition-colors",
              isCurrent
                ? "border-brown-800 text-brown-800 bg-brown-50"
                : "border-gray-200 text-gray-600 bg-white hover:bg-gray-50",
            )}
          >
            {platform.name}
            {isCurrent && <Check size={14} className="text-brown-800" />}
          </button>
        );
      })}

      <button
        type="button"
        onClick={handleShowLoginForm}
        className="w-full h-10 bg-brown-800 text-white text-sm font-medium hover:bg-brown-800 transition-colors mt-2"
      >
        Keyingi
      </button>
    </div>
  );
};

const LoginForm = ({ onShowLoginForm }) => {
  const navigate = useNavigate();

  const { phone, password, setField, isLoading } = useObjectState({
    phone: "",
    password: "",
    isLoading: false,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setField("isLoading", true);

    // Strip formatting — send only digits as a number (e.g. 998901234567)
    const phoneNumber = Number(phone.replace(/\D/g, ""));

    authAPI
      .login({ phone: phoneNumber, password: password?.trim() })
      .then((response) => {
        const token = response.data?.token ?? response.data?.accessToken;
        localStorage.setItem("token", token);
        navigate("/dashboard");
      })
      .catch((error) => {
        toast.error(
          error.response?.data?.message || "Tizimga kirishda xatolik",
        );
      })
      .finally(() => setField("isLoading", false));
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          type="button"
          onClick={onShowLoginForm}
          className="flex items-center justify-center w-7 h-7 border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors shrink-0"
        >
          <ChevronLeft size={14} />
        </button>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Xush kelibsiz!</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Admin sifatida tizimga kiring
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Phone */}
        <div className="space-y-1.5">
          <label htmlFor="phone" className="text-sm font-medium text-gray-700">
            Telefon raqam
          </label>
          <InputTel
            id="phone"
            name="phone"
            value={phone}
            autoFocus
            required
            onChange={(e) => setField("phone", e.target.value)}
          />
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label
            htmlFor="login-password"
            className="text-sm font-medium text-gray-700"
          >
            Parol
          </label>
          <InputPwd
            id="login-password"
            name="password"
            value={password}
            required
            onChange={(e) => setField("password", e.target.value)}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-10 bg-brown-800 text-white text-sm font-medium hover:bg-brown-900 transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-1"
        >
          {isLoading ? "Kirish..." : "Kirish"}
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
