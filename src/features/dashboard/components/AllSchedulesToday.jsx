// React
import { useEffect } from "react";

// Icons
import { BookOpen } from "lucide-react";

// Router
import { Link } from "react-router-dom";

// Store
import useAuth from "@/shared/hooks/useAuth";

// Hooks
import useArrayStore from "@/shared/hooks/useArrayStore";

// API
import { schedulesAPI } from "@/shared/api/schedules.api";

// Utils
import { getDayOfWeekUZ } from "@/shared/utils/date.utils";

// Components
import Card from "@/shared/components/ui/Card";
import Button from "@/shared/components/ui/button/Button";
import ScheduleItem from "@/features/dashboard/components/ScheduleItem";

const AllSchedulesToday = () => {
  const today = new Date();
  const { user } = useAuth();
  const dayName = getDayOfWeekUZ(today);

  const {
    initialize,
    hasCollection,
    setCollection,
    getCollectionData,
    isCollectionLoading,
    setCollectionErrorState,
    setCollectionLoadingState,
  } = useArrayStore("schedules-all-today");

  const schedules = getCollectionData() || [];
  const loading = isCollectionLoading();

  function fetchAllTodaySchedules() {
    setCollectionLoadingState(true);

    schedulesAPI
      .getAllToday()
      .then((res) => setCollection(res.data.data, null))
      .catch(() => setCollectionErrorState(true));
  }

  useEffect(() => {
    if (!hasCollection()) initialize(false);
  }, [initialize, hasCollection]);

  useEffect(() => {
    if (user?.role === "owner" && !schedules.length) {
      fetchAllTodaySchedules();
    }
  }, [user, schedules.length]);

  if (user?.role !== "owner" || dayName === "yakshanba") {
    return null;
  }

  if (loading) {
    return (
      <Card className="mt-6">
        <div className="flex items-center justify-center p-8">
          <div className="animate-pulse text-gray-500">Yuklanmoqda...</div>
        </div>
      </Card>
    );
  }

  return (
    <div className="relative mt-4">
      {/* Top */}
      <div className="flex items-center justify-between mb-4">
        {/* Title */}
        <h2 className="section-title">Bugungi barcha sinf dars jadvallari</h2>

        {/* Schedules page link */}
        <Button asChild className="" variant="link">
          <Link to="/schedules">Barcha dars jadvali</Link>
        </Button>
      </div>

      {/* No data */}
      {schedules.length === 0 && (
        <Card>
          <div className="text-center py-8">
            <BookOpen
              className="size-12 text-gray-300 mx-auto mb-3"
              strokeWidth={1.5}
            />
            <p className="text-gray-500">Bugun darslar yo'q</p>
          </div>
        </Card>
      )}

      {/* Schedule Grid */}
      {schedules.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {schedules.map((schedule, idx) => (
            <ScheduleItem key={idx} schedule={schedule} />
          ))}
        </div>
      )}
    </div>
  );
};

export default AllSchedulesToday;
