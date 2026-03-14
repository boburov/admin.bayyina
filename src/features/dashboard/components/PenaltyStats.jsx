// Router
import { Link } from "react-router-dom";

// Tanstack Query
import { useQuery } from "@tanstack/react-query";

// API
import { penaltiesAPI } from "@/shared/api/penalties.api";

// Utils
import { cn } from "@/shared/utils/cn";

// Components
import Card from "@/shared/components/ui/Card";
import Counter from "@/shared/components/ui/Counter";
import Button from "@/shared/components/ui/button/Button";

const PenaltyStats = () => {
  const { data: stats } = useQuery({
    queryKey: ["penalties", "stats"],
    queryFn: () => penaltiesAPI.getStats().then((res) => res.data.data),
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
      <div className="col-span-2 space-y-4">
        {/* Umumiy statistika */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card
            title="Jami jarima ballar"
            className="flex items-center justify-between"
          >
            <Counter
              value={stats?.totalApprovedPoints ?? 0}
              className="text-2xl font-bold text-red-500"
            />
          </Card>

          <Card
            title="Kamaytirilgan ballar"
            className="flex items-center justify-between"
          >
            <Counter
              value={stats?.totalReducedPoints ?? 0}
              className="text-2xl font-bold text-green-500"
            />
          </Card>

          <Card
            title="Kutilayotgan jarimalar"
            className="flex items-center justify-between"
          >
            <Counter
              value={stats?.pendingCount ?? 0}
              className="text-2xl font-bold text-yellow-500"
            />
          </Card>
        </div>

        {/* Top 10 o'quvchilar */}
        <TopTenList
          title="Top 10 jarima olgan o'quvchilar"
          data={stats?.topStudents || []}
          colorClass="text-red-600"
        />
      </div>

      {/* Top 10 o'qituvchilar */}
      <TopTenList
        title="Top 10 jarima olgan o'qituvchilar"
        data={stats?.topTeachers || []}
        colorClass="text-orange-600"
      />
    </div>
  );
};

/**
 * Top 10 ro'yxat komponenti
 * @param {Object} props
 * @param {string} props.title - Ro'yxat sarlavhasi
 * @param {Array} props.data - Foydalanuvchilar ro'yxati
 * @param {string} props.colorClass - Ball rangi uchun Tailwind klassi
 */
const TopTenList = ({ title, data, colorClass }) => {
  const getRankColor = (index) => {
    if (index === 0) return "size-10 bg-gradient-to-tr from-red-400 to-red-600";
    if (index === 1)
      return "size-9 mx-0.5 bg-gradient-to-tr from-orange-400 to-orange-600";
    if (index === 2)
      return "size-8 mx-1 bg-gradient-to-tr from-yellow-400 to-yellow-600";
    return "size-7 mx-1.5 bg-gray-100 text-gray-500";
  };

  return (
    <Card title={title} className="flex flex-col gap-1.5 xs:gap-3.5">
      <div className="max-h-72 overflow-y-auto hidden-scrollbar">
        {data.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-4">
            Ma'lumot yo'q
          </p>
        )}
        {data.map((user, index) => (
          <div
            key={user._id}
            className={cn(
              "flex items-center justify-between py-2",
              index === 0 ? "sticky top-0 bg-white" : "",
            )}
          >
            <div className="flex items-center gap-2.5">
              <div
                className={cn(
                  "flex items-center justify-center size-8 rounded-full text-sm font-bold text-white",
                  getRankColor(index),
                )}
              >
                {index + 1}
              </div>
              <p className="text-sm font-medium text-gray-800">
                {user.fullName}
              </p>
            </div>
            <Counter
              value={user?.penaltyPoints || 0}
              className={cn("text-sm font-semibold", colorClass)}
            />
          </div>
        ))}
      </div>

      <Button
        asChild
        variant="link"
        className="inline-block py-0 size-auto mx-auto text-sm"
      >
        <Link to="/penalties">Barcha jarimalar</Link>
      </Button>
    </Card>
  );
};

export default PenaltyStats;
