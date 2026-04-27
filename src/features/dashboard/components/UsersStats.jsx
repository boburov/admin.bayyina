// TanStack Query
import { useQuery } from "@tanstack/react-query";
import { useAppQuery } from "@/shared/lib/query/query-hooks";

// API
import { usersAPI } from "@/features/users/api/users.api";
import { classesAPI } from "@/features/classes/api/classes.api";
import { statisticsAPI } from "@/features/statistics/api/statistics.api";

// Icons
import { GraduationCap, Briefcase, School, TrendingUp, Activity, CreditCard } from "lucide-react";

// Components
import Card from "@/shared/components/ui/Card";
import Counter from "@/shared/components/ui/Counter";
import { Skeleton } from "@/shared/components/shadcn/skeleton";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const colorMap = {
  brown:  "bg-brown-50 border-brown-200 text-brown-800",
  blue:   "bg-blue-50   border-blue-200   text-blue-600",
  green:  "bg-green-50  border-green-200  text-green-600",
  purple: "bg-purple-50 border-purple-200 text-purple-600",
  orange: "bg-orange-50 border-orange-200 text-orange-600",
};

const fmtMoney = (v) => {
  if (!v) return "0";
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000)     return `${Math.round(v / 1_000)}K`;
  return String(v);
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
    queryFn:  () => classesAPI.getAll({ limit: 200 }).then((res) => res.data),
  });

  const { data: overview, isLoading: overviewLoading } = useAppQuery({
    queryKey: ["statistics", "overview"],
    queryFn:  () => statisticsAPI.getOverview(),
    select:   (r) => r.data,
    staleTime: 60_000,
  });

  const { data: revenue, isLoading: revenueLoading } = useAppQuery({
    queryKey: ["statistics", "revenue"],
    queryFn:  () => statisticsAPI.getRevenue(),
    select:   (r) => r.data,
    staleTime: 60_000,
  });

  const now = new Date();
  const paymentsThisMonth = (revenue?.monthlyRevenue ?? []).find(
    (d) => d.year === now.getFullYear() && d.month === now.getMonth() + 1,
  )?.payments ?? 0;

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
      label:     "Faol o'quvchilar",
      value:     overview?.totalActiveStudents ?? 0,
      icon:      Activity,
      color:     "purple",
      isLoading: overviewLoading,
    },
    {
      label:     "Bu oy daromad",
      text:      `${fmtMoney(overview?.revenueThisMonth)} so'm`,
      icon:      TrendingUp,
      color:     "orange",
      isLoading: overviewLoading,
      isText:    true,
    },
    {
      label:     "Bu oy to'lovlar",
      value:     paymentsThisMonth,
      icon:      CreditCard,
      color:     "brown",
      isLoading: revenueLoading,
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
      {items.map((item) => {
        const c = colorMap[item.color];
        return (
          <Card key={item.label} className="flex items-center gap-3 !py-3">
            <div className={`flex items-center justify-center size-9 border shrink-0 ${c}`}>
              <item.icon className="size-4" strokeWidth={1.5} />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-400 truncate">{item.label}</p>
              {item.isLoading ? (
                <Skeleton className="w-12 h-6 mt-0.5" />
              ) : item.isText ? (
                <p className="text-lg font-bold text-gray-900 truncate">{item.text}</p>
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
