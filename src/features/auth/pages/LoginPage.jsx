// Toast
import { toast } from "sonner";

// Lottie
import Lottie from "lottie-react";

// Utils
import { cn } from "@/shared/utils/cn";

// Router
import { useNavigate } from "react-router-dom";

// Data
import platforms from "../data/platforms.data";

// Icons
import { Check } from "lucide-react";
import { logoIcon } from "@/shared/assets/icons";

// API
import { authAPI } from "@/features/auth/api/auth.api";

// Hooks
import useObjectState from "@/shared/hooks/useObjectState";

// Animations
import { lockWithKeyEmojiAnimation } from "@/shared/assets/animations";

// Components
import Button from "@/shared/components/ui/button/Button";
import InputGroup from "@/shared/components/ui/input/InputGroup";
import InputField from "@/shared/components/ui/input/InputField";
import MainBackgroundPatterns from "@/shared/components/bg/MainBackgroundPatterns";

const LoginPage = () => {
  const { setField, showLoginForm, currentPlatform } = useObjectState({
    showLoginForm: false,
    currentPlatform: platforms.find((platform) => platform.isCurrent),
  });

  return (
    <div className="flex w-full h-svh">
      {/* Form */}
      <div
        className={cn(
          "flex items-center justify-center size-full relative z-10 bg-white/50 backdrop-blur px-5 transition-transform duration-500 md:w-1/2",
          showLoginForm ? "translate-x-0 md:translate-x-full" : "translate-x-0",
        )}
      >
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

      {/* Animation Data */}
      <div
        className={cn(
          "hidden items-center justify-center w-1/2 h-full transition-transform duration-500 md:flex",
          showLoginForm ? "-translate-x-full" : "translate-x-0",
        )}
      >
        <Lottie
          className="size-64 animate__animated animate__fadeIn"
          key={showLoginForm ? "loginForm" : currentPlatform.name}
          animationData={
            showLoginForm
              ? lockWithKeyEmojiAnimation
              : currentPlatform.animationData
          }
        />
      </div>

      {/* Background Patterns */}
      <MainBackgroundPatterns />
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
    <div className="max-w-md w-full space-y-5 animate__animated animate__fadeIn">
      {/* Title */}
      <h2 className="text-lg font-medium text-center md:text-xl">
        Assalomu alaykum, hurmatli foydalanuvchi! Siz platformaga kim bo'lib
        kirmoqchisiz?
      </h2>

      {/* Platforms select */}
      {platforms.map((platform) => {
        const isCurrent = currentPlatform.name === platform.name;
        return (
          <Button
            variant="outline"
            key={platform.name}
            onClick={() => onPlatformChange(platform)}
            className={cn(
              "relative w-full border-2",
              isCurrent && "border-primary text-primary hover:text-primary",
            )}
          >
            {platform.name}
            <Check
              strokeWidth={2.5}
              className={cn(
                "absolute right-3.5 transition-colors duration-300",
                isCurrent ? "stroke-primary" : "stroke-transparent",
              )}
            />
          </Button>
        );
      })}

      {/* Submit button */}
      <Button onClick={handleShowLoginForm} className="w-full">
        Keyingi
      </Button>
    </div>
  );
};

const LoginForm = ({ onShowLoginForm }) => {
  const navigate = useNavigate();

  const { username, password, setField, isLoading, step } = useObjectState({
    step: 1,
    username: "",
    password: "",
    isLoading: false,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setField("isLoading", true);

    const data = { username, password: password?.trim() };

    authAPI
      .login(data)
      .then((response) => {
        // Save token to localStorage
        const { token } = response.data.data;
        localStorage.setItem("authToken", token);

        // Navigate to dashboard
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
    <div className="max-w-md w-full animate__animated animate__fadeIn">
      {/* Header */}
      <div className="text-center mb-8 space-y-3.5">
        {/* Title */}
        <h2 className="flex items-center justify-center gap-3.5 text-lg font-medium text-center md:gap-5 md:text-xl">
          <img
            width={32}
            height={32}
            src={logoIcon}
            className="size-8"
            alt="MBSI Logo icon"
          />

          <span>Qaytganingiz bilan!</span>
        </h2>

        {/* Description */}
        <p className="text-gray-600 mt-2">
          Tizimga kirish uchun ma'lumotlaringizni kiriting.
        </p>
      </div>

      {/* Form */}
      <InputGroup as="form" onSubmit={handleSubmit}>
        <InputField
          required
          id="username"
          name="username"
          value={username}
          autoComplete="username"
          label="Foydalanuvchi nomi"
          placeholder="Faqat raqamlar va harflar"
          onChange={(e) =>
            setField("username", e.target.value.trim().toLowerCase())
          }
        />

        <InputField
          required
          id="password"
          label="Parol"
          type="password"
          name="password"
          value={password}
          autoComplete="current-password"
          onChange={(e) => setField("password", e.target.value.trim())}
        />

        {/* Action buttons */}
        <div className="flex flex-col gap-4">
          <Button disabled={isLoading}>
            Tizimga kirish{isLoading && "..."}
          </Button>

          <Button
            variant="outline"
            disabled={isLoading}
            onClick={onShowLoginForm}
            className="max-md:bg-white max-md:hover:bg-white/70"
          >
            Ortga qaytish
          </Button>
        </div>
      </InputGroup>
    </div>
  );
};

export default LoginPage;
