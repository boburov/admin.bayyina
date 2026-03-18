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
  const { data: stats, isLoading } = useQuery({
    queryKey: ["users", "stats"],
    queryFn: () => usersAPI.getStats().then((res) => res.data.data),
  });

  const statItems = [
    {
      label: "O'quvchilar",
      value: stats?.students || 0,
      icon: GraduationCap,
    },
    {
      label: "O'qituvchilar",
      value: stats?.teachers || 0,
      icon: Briefcase,
    },
    {
      label: "Bot foydalanuvchilar",
      value: stats?.telegramUsers || 0,
      icon: Bot,
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
              <item.icon className="size-5 text-blue-700" strokeWidth={1.5} />
            </div>
          }
        >
          {isLoading ? (
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
