// Icons
import { LogOut } from "lucide-react";

// Router
import { Link } from "react-router-dom";

// Tanstack Query
import { useQuery } from "@tanstack/react-query";

// API
import { authAPI } from "@/features/auth/api/auth.api";

// Components
import Card from "@/shared/components/ui/Card";
import { Button } from "@/shared/components/shadcn/button";
import BottomNavbar from "@/shared/components/ui/BottomNavbar";

const ProfilePage = () => {
  const {
    isError,
    isLoading,
    data: profile,
  } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: () => authAPI.getMe().then((res) => res.data.user),
  });

  const handleLogout = () => {
    const shouldLogout = confirm("Haqiqatan ham chiqmoqchimisiz?");
    if (!shouldLogout) return;

    localStorage.removeItem("authToken");
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen pt-5 pb-20 space-y-5 animate__animated animate__fadeIn">
      <div className="container space-y-5">
        {/* Top */}
        <h1 className="text-blue-500 font-bold text-xl">Profil</h1>

        {isLoading && (
          <div className="text-center py-12 text-gray-500">Yuklanmoqda...</div>
        )}

        {isError && !isLoading && (
          <div className="text-center py-12 text-gray-500">
            Profil ma'lumotlarini yuklab bo'lmadi
          </div>
        )}

        {!isLoading && !isError && (
          <>
            <Card title="Umumiy ma'lumotlar" className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Ism</span>
                <span className="font-medium text-gray-900">
                  {profile?.firstName || "-"}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Familiya</span>
                <span className="font-medium text-gray-900">
                  {profile?.lastName || "-"}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Username</span>
                <span className="font-medium text-gray-900">
                  {profile?.username || "-"}
                </span>
              </div>
            </Card>

            <Card title="Sinflar" className="space-y-3">
              {profile?.classes?.length ? (
                <div className="flex flex-wrap gap-2">
                  {profile.classes.map((classItem) => (
                    <span
                      key={classItem._id}
                      className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700"
                    >
                      {classItem.name}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">Sinf biriktirilmagan</p>
              )}
            </Card>

            <div className="flex gap-3.5">
              <Button className="w-full" asChild>
                <Link to="/profile/edit">Tahrirlash</Link>
              </Button>

              <Button
                variant="danger"
                onClick={handleLogout}
                className="w-11 p-0 shrink-0"
              >
                <LogOut strokeWidth={1.5} className="size-6" />
              </Button>
            </div>
          </>
        )}
      </div>

      <BottomNavbar />
    </div>
  );
};

export default ProfilePage;
