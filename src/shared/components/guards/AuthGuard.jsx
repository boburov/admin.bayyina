// Tanstack Query
import { useQuery } from "@tanstack/react-query";

// React
import { useEffect } from "react";

// Router
import { Navigate, Outlet, useNavigate } from "react-router-dom";

// API
import { authAPI } from "@/features/auth/api/auth.api";

const AuthGuard = () => {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const { isLoading, isError } = useQuery({
    queryKey: ["auth", "profile"],
    queryFn: () => authAPI.getMe().then((res) => res.data.user ?? null),
    enabled: Boolean(token),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  // Side effect on auth failure — never in render body
  useEffect(() => {
    if (isError) {
      localStorage.removeItem("token");
      navigate("/login", { replace: true });
    }
  }, [isError, navigate]);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center fixed inset-0 z-50 bg-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-7 h-7 bg-[#7c5c3e] animate-pulse" />
        </div>
      </div>
    );
  }

  if (isError) {
    return null;
  }

  return <Outlet />;
};

export default AuthGuard;
