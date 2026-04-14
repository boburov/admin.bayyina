import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { authAPI } from "@/features/auth/api/auth.api";

const useAuth = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: user, isLoading } = useQuery({
    queryKey: ["auth", "profile"],
    queryFn: () => authAPI.getMe().then((res) => res.data.user ?? null),
    enabled: Boolean(localStorage.getItem("token")),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const isAuthenticated = Boolean(localStorage.getItem("token")) && Boolean(user);

  const logout = () => {
    localStorage.removeItem("token");
    queryClient.clear();
    navigate("/login");
  };

  return { user, isAuthenticated, loading: isLoading, logout };
};

export default useAuth;
