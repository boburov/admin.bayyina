// Toast
import { toast } from "sonner";

// Images
import { logo } from "@/shared/assets/images";

// Router
import { useNavigate } from "react-router-dom";

// API
import { authAPI } from "@/features/auth/api/auth.api";

// Components
import Card from "@/shared/components/ui/Card";
import { Button } from "@/shared/components/shadcn/button";

// Hooks
import useObjectState from "@/shared/hooks/useObjectState";

const LoginPage = () => {
  const navigate = useNavigate();

  const { username, password, setField, isLoading } = useObjectState({
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
        const { token } = response.data.data;
        localStorage.setItem("authToken", token);
        toast.success("Tizimga muvaffaqiyatli kirdingiz!");
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-indigo-100 to-white px-4">
      <div className="max-w-md w-full">
        <Card className="p-8 border-none">
          {/* Header */}
          <div className="text-center mb-8">
            <img
              width={64}
              alt="Logo"
              height={64}
              src={logo}
              className="size-16 mx-auto mb-4"
            />
            <h2 className="text-3xl font-bold text-gray-900">MBSI School</h2>
            <p className="text-gray-600 mt-2">Tizimga kirish</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1.5">
              <label htmlFor="username" className="text-sm text-gray-600">
                Username
              </label>
              <input
                required
                id="username"
                name="username"
                value={username}
                autoComplete="username"
                className="w-full h-11 px-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(event) =>
                  setField("username", event.target.value.trim().toLowerCase())
                }
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="text-sm text-gray-600">
                Parol
              </label>
              <input
                required
                minLength={6}
                id="password"
                name="password"
                type="password"
                value={password}
                autoComplete="current-password"
                className="w-full h-11 px-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(event) => setField("password", event.target.value)}
              />
            </div>

            <Button type="submit" disabled={isLoading} className="w-full">
              Kirish{isLoading && "..."}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
