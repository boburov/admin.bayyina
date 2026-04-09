// React
import { useEffect, useState } from "react";

// Router
import { useNavigate } from "react-router-dom";

// API
import { authAPI } from "@/features/auth/api/auth.api";
import { usersAPI } from "@/features/profile/api/users.api";

// Components
import Card from "@/shared/components/ui/Card";
import { Button } from "@/shared/components/shadcn/button";
import BackHeader from "@/shared/components/layout/BackHeader";

// Tanstack Query
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const ProfileEditPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ firstName: "", lastName: "" });

  const {
    data: profile,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["auth", "profile"],
    queryFn: () => authAPI.getMe().then((res) => res.data.data),
  });

  useEffect(() => {
    if (!profile) return;
    setForm({
      firstName: profile.firstName || "",
      lastName: profile.lastName || "",
    });
  }, [profile]);

  const updateMutation = useMutation({
    mutationFn: (payload) => usersAPI.updateProfile(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth", "profile"] });
      navigate("/profile");
    },
  });

  const handleChange = (field) => (event) => {
    const { value } = event.target;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    updateMutation.mutate({
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
    });
  };

  return (
    <div className="min-h-screen pb-20 space-y-5 animate__animated animate__fadeIn">
      <BackHeader href="/profile" title="Profilni tahrirlash" />

      <div className="container space-y-4">
        {isLoading && (
          <div className="text-center py-12 text-gray-500">Yuklanmoqda...</div>
        )}

        {isError && !isLoading && (
          <div className="text-center py-12 text-gray-500">
            Profil ma'lumotlarini yuklab bo'lmadi
          </div>
        )}

        {!isLoading && !isError && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Card title="Umumiy ma'lumotlar" className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm text-gray-500">Ism</label>
                <input
                  type="text"
                  value={form.firstName}
                  onChange={handleChange("firstName")}
                  placeholder="Ism"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm text-gray-500">Familiya</label>
                <input
                  type="text"
                  value={form.lastName}
                  onChange={handleChange("lastName")}
                  placeholder="Familiya"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </Card>

            {/* Submit button */}
            <Button type="submit" className="w-full">
              Saqlash
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ProfileEditPage;
