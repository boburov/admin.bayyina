// TanStack Query
import { useQuery } from "@tanstack/react-query";

// API
import { usersAPI } from "@/features/users/api/users.api";
import { classesAPI } from "@/features/classes/api/classes.api";
import { leadsAPI } from "@/features/leads/api/leads.api";

// Icons
import { GraduationCap, Briefcase, School, UserPlus } from "lucide-react";

// Components
import Card from "@/shared/components/ui/Card";
import Counter from "@/shared/components/ui/Counter";
import { Skeleton } from "@/shared/components/shadcn/skeleton";

// ─── Data ─────────────────────────────────────────────────────────────────────
const colorMap = {
  brown:  "bg-[#fdf8f5] border-[#e8d0b8] text-[#7c5c3e]",
  blue:   "bg-blue-50   border-blue-200   text-blue-600",
  green:  "bg-green-50  border-green-200  text-green-600",
  purple: "bg-purple-50 border-purple-200 text-purple-600",
};

// ─── Component ────────────────────────────────────────────────────────────────
const UsersStats = () => {
  const { data: studentsData, isLoading: studentsLoading } = useQuery({
    queryKey: ["users", "stats", "students"],
    queryFn:  () => usersAPI.getStudents({ limit: 1 }).then((res) => res.data),
  });

  const { data: teachersData, isLoading: teachersLoading } = useQuery({
    queryKey: ["users", "stats", "teachers"],
    queryFn:  () => usersAPI.getTeachers({ limit: 1 }).then((res) => res.data),
  });

  const { data: groupsData, isLoading: groupsLoading } = useQuery({
    queryKey: ["admin-groups"],
    queryFn:  () => classesAPI.getAll().then((res) => res.data),
  });

  const { data: leadsData, isLoading: leadsLoading } = useQuery({
    queryKey: ["leads", "stats"],
    queryFn:  () => leadsAPI.getAll({ limit: 1 }).then((res) => res.data),
  });

  const items = [
    {
      label:     "O'quvchilar",
      value:     studentsData?.total ?? 0,
      icon:      GraduationCap,
      color:     "brown",
      isLoading: studentsLoading,
    },
    {
      label:     "O'qituvchilar",
      value:     teachersData?.total ?? 0,
      icon:      Briefcase,
      color:     "blue",
      isLoading: teachersLoading,
    },
    {
      label:     "Guruhlar",
      value:     groupsData?.groups?.length ?? 0,
      icon:      School,
      color:     "green",
      isLoading: groupsLoading,
    },
    {
      label:     "Leadlar",
      value:     leadsData?.total ?? leadsData?.leads?.length ?? 0,
      icon:      UserPlus,
      color:     "purple",
      isLoading: leadsLoading,
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
      {items.map((item) => {
        const c = colorMap[item.color];
        return (
          <Card
            key={item.label}
            className="flex items-center gap-3 !py-3"
          >
            <div className={`flex items-center justify-center size-9 border shrink-0 ${c}`}>
              <item.icon className="size-4" strokeWidth={1.5} />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-400 truncate">{item.label}</p>
              {item.isLoading ? (
                <Skeleton className="w-12 h-6 mt-0.5" />
              ) : (
                <Counter value={item.value} className="text-xl font-bold text-gray-900" />
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default UsersStats;
