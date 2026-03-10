// Tanstack Query
import { useQuery } from "@tanstack/react-query";

// Router
import { Navigate, Outlet } from "react-router-dom";

// Icons
import logoIcon from "@/shared/assets/icons/logo.svg";

// API
import { authAPI } from "@/features/auth/api/auth.api";

const AuthGuard = () => {
  const token = localStorage.getItem("authToken");

  const { isLoading, isError } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: () => authAPI.getMe().then((res) => res.data.data),
    enabled: Boolean(token),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center fixed inset-0 z-50 size-full bg-gray-100">
        <img
          width={64}
          height={64}
          src={logoIcon}
          className="size-16"
          alt="MBSI logo icon svg"
        />
      </div>
    );
  }

  if (isError) {
    localStorage.removeItem("authToken");
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default AuthGuard;
