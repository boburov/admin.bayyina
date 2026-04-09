// Tanstack Query
import { useQuery } from "@tanstack/react-query";

// API
import { usersAPI } from "@/features/users/api/users.api";

// Icons
import { Bot, Briefcase, GraduationCap } from "lucide-react";

// Components
import Card from "@/shared/components/ui/Card";
import Counter from "@/shared/components/ui/Counter";
import { Skeleton } from "@/shared/components/shadcn/skeleton";

const UsersStats = () => {
  const { data: studentsData, isLoading: studentsLoading } = useQuery({
    queryKey: ["users", "stats", "students"],
    queryFn: () => usersAPI.getStudents({ limit: 1 }).then((res) => res.data),
  });

  const { data: teachersData, isLoading: teachersLoading } = useQuery({
    queryKey: ["users", "stats", "teachers"],
    queryFn: () => usersAPI.getTeachers({ limit: 1 }).then((res) => res.data),
  });

  const studentsCount = studentsData?.total ?? 0;
  const teachersCount = teachersData?.total ?? 0;

  const statItems = [
    {
      label: "O'quvchilar",
      value: studentsCount,
      icon: GraduationCap,
      isLoading: studentsLoading,
    },
    {
      label: "O'qituvchilar",
      value: teachersCount,
      icon: Briefcase,
      isLoading: teachersLoading,
    },
    {
      label: "Bot foydalanuvchilar",
      value: 0,
      icon: Bot,
      isLoading: false,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
      {statItems.map((item, idx) => (
        <Card
          key={idx}
          title={item.label}
          className="flex flex-col items-center justify-between sm:flex-row"
          icon={
            <div className="flex items-center justify-center size-10 bg-blue-50 rounded-full">
              <item.icon className="size-5 text-yellow-700" strokeWidth={1.5} />
            </div>
          }
        >
          {item.isLoading ? (
            <Skeleton className="w-16 h-7" />
          ) : (
            <Counter
              value={item.value}
              className="text-2xl font-bold text-gray-900"
            />
          )}
        </Card>
      ))}
    </div>
  );
};

export default UsersStats;
