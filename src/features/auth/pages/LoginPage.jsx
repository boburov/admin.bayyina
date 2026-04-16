// Toast
import { toast } from "sonner";

// Utils
import { cn } from "@/shared/utils/cn";

// Router
import { useNavigate } from "react-router-dom";

// Data
import platforms from "../data/platforms.data";

// Icons
import { Check, GraduationCap, Phone, Lock, Eye, EyeOff, ChevronLeft } from "lucide-react";

// API
import { authAPI } from "@/features/auth/api/auth.api";

// Hooks
import useObjectState from "@/shared/hooks/useObjectState";

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
          <div className="flex items-center justify-center w-10 h-10 bg-[#7c5c3e]">
            <GraduationCap size={20} className="text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-lg font-semibold text-gray-900">Bayyina</h1>
            <p className="text-sm text-gray-400 mt-0.5">Boshqaruv paneli</p>
          </div>
        </div>

        {/* Form area */}
        <div className="border border-gray-200 bg-white px-6 py-7">
          {showLoginForm ? (
            <LoginForm onShowLoginForm={() => setField("showLoginForm", false)} />
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
                ? "border-[#7c5c3e] text-[#7c5c3e] bg-[#fdf8f5]"
                : "border-gray-200 text-gray-600 bg-white hover:bg-gray-50",
            )}
          >
            {platform.name}
            {isCurrent && <Check size={14} className="text-[#7c5c3e]" />}
          </button>
        );
      })}

      <button
        type="button"
        onClick={handleShowLoginForm}
        className="w-full h-10 bg-[#7c5c3e] text-white text-sm font-medium hover:bg-[#6b4f34] transition-colors mt-2"
      >
        Keyingi
      </button>
    </div>
  );
};

const LoginForm = ({ onShowLoginForm }) => {
  const navigate = useNavigate();

  const { phone, password, setField, isLoading, showPassword } = useObjectState({
    phone: "",
    password: "",
    isLoading: false,
    showPassword: false,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setField("isLoading", true);

    const data = {
      phone: Number(phone),
      password: password?.trim(),
    };

    authAPI
      .login(data)
      .then((response) => {
        const { token } = response.data;
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
      <div className="flex items-center gap-2 mb-5">
        <button
          type="button"
          onClick={onShowLoginForm}
          className="flex items-center justify-center w-7 h-7 border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
        >
          <ChevronLeft size={14} />
        </button>
        <h2 className="text-sm font-semibold text-gray-700">Tizimga kirish</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Phone */}
        <div className="space-y-1.5">
          <label htmlFor="phone" className="text-sm font-medium text-gray-700">
            Telefon raqam
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              <Phone size={14} />
            </span>
            <input
              id="phone"
              type="text"
              inputMode="numeric"
              autoComplete="tel"
              required
              value={phone}
              placeholder="Faqat raqamlar"
              onChange={(e) => setField("phone", e.target.value.trim())}
              className="w-full h-10 pl-9 pr-3 rounded-sm border border-gray-300 bg-white text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#7c5c3e] transition-colors"
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label htmlFor="login-password" className="text-sm font-medium text-gray-700">
            Parol
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              <Lock size={14} />
            </span>
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setField("password", e.target.value.trim())}
              className="w-full h-10 pl-9 pr-10 rounded-sm border border-gray-300 bg-white text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#7c5c3e] transition-colors"
            />
            <button
              type="button"
              onClick={() => setField("showPassword", !showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-10 bg-[#7c5c3e] text-white text-sm font-medium hover:bg-[#6b4f34] transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-1"
        >
          {isLoading ? "Kirish..." : "Kirish"}
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
