// Icons
import { Calendar } from "lucide-react";

// Components
import Card from "@/shared/components/ui/Card";

const toMinutes = (time) => {
  if (!time) return null;
  const [hours, minutes] = time.split(":").map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
  return hours * 60 + minutes;
};

const ScheduleItem = ({ schedule }) => {
  const today = new Date();
  const currentMinutes = today.getHours() * 60 + today.getMinutes();

  return (
    <Card
      className="space-y-3"
      title={schedule.class?.name}
      icon={<Calendar strokeWidth={1.5} className="size-5 text-blue-500" />}
    >
      {schedule.subjects?.map((subj, index) => {
        const displayOrder =
          (schedule.startingOrder || 1) + (subj.order || index + 1) - 1;

        const endMinutes = toMinutes(subj.endTime);
        const startMinutes = toMinutes(subj.startTime);

        const isActive =
          startMinutes !== null &&
          endMinutes !== null &&
          currentMinutes >= startMinutes &&
          currentMinutes <= endMinutes;

        return (
          <div
            key={index}
            className={`p-3 rounded-lg ${
              isActive ? "bg-blue-50" : "bg-gray-50"
            }`}
          >
            <div className="flex items-start justify-between mb-1">
              {/* Title */}
              <b className="text-sm font-medium text-gray-900">
                {displayOrder}. {subj.subject?.name}
              </b>

              {/* Teacher */}
              <div className="flex items-center gap-2">
                {isActive && (
                  <span className="text-[10px] font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                    Aktiv
                  </span>
                )}
                <p className="text-xs text-gray-600">
                  {subj.teacher?.fullName}
                </p>
              </div>
            </div>

            {/* Time */}
            {subj.startTime && subj.endTime && (
              <p className="text-xs text-gray-500">
                {subj.startTime} - {subj.endTime}
              </p>
            )}
          </div>
        );
      })}
    </Card>
  );
};

export default ScheduleItem;
