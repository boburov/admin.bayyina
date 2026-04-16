// Toast
import { toast } from "sonner";

// API
import { classesAPI } from "@/features/classes/api/classes.api";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Router
import { Link } from "react-router-dom";

// Hooks
import useModal from "@/shared/hooks/useModal";

// Data
import { daysOptions } from "../data/classes.data";

// Components
import Button from "@/shared/components/ui/button/Button";
import Card from "@/shared/components/ui/Card";

// Icons
import {
  Plus,
  Edit,
  Trash2,
  ChevronRight,
  Download,
  Clock,
  User,
  School,
} from "lucide-react";

const Classes = () => {
  const { openModal } = useModal();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-groups"],
    queryFn: () => classesAPI.getAll().then((res) => res.data),
    onError: () => toast.error("Guruhlar yuklanmadi"),
  });

  const groups = data?.groups ?? [];

  const getDayLabel = (value) =>
    daysOptions.find((d) => d.value === value)?.label ?? value;

  const handleExport = async () => {
    try {
      const response = await classesAPI.exportAll();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `guruhlar_${new Date().toISOString().split("T")[0]}.xlsx`,
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error("Eksport xatosi yuz berdi");
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Yuklanmoqda...</div>;
  }

  return (
    <div>
      {/* Page header */}
      <div className="mb-5 pb-4 border-b border-border">
        <h1 className="page-title">Guruhlar</h1>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <Button onClick={() => openModal("createClass")} className="px-3.5">
          <Plus strokeWidth={1.5} />
          Yangi guruh
        </Button>

        <Button variant="neutral" onClick={handleExport} className="px-3.5" title="Excel yuklash">
          <Download strokeWidth={1.5} />
        </Button>
      </div>

      {/* Empty state */}
      {groups.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-16 text-gray-400">
          <School className="size-10 opacity-30" strokeWidth={1.5} />
          <p className="text-sm">Hozircha guruhlar yo'q</p>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {groups.map((group) => (
          <Card key={group._id}>
            {/* Top row — name + actions */}
            <div className="flex justify-between items-start mb-3">
              <Link
                to={`/classes/${group._id}`}
                className="flex items-center gap-1 text-sm font-semibold text-gray-900 hover:text-[#7c5c3e] transition-colors"
              >
                {group.name}
                <ChevronRight className="size-4 shrink-0" strokeWidth={1.5} />
              </Link>

              <div className="flex gap-3 shrink-0">
                <button
                  onClick={() => openModal("editClass", group)}
                  className="text-gray-400 hover:text-[#7c5c3e] transition-colors"
                >
                  <Edit className="size-4" strokeWidth={1.5} />
                </button>
                <button
                  onClick={() => openModal("deleteClass", group)}
                  className="text-gray-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="size-4" strokeWidth={1.5} />
                </button>
              </div>
            </div>

            {/* Teacher */}
            {group.teacher && (
              <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-2">
                <User className="size-4 shrink-0" strokeWidth={1.5} />
                <span>
                  {group.teacher.firstName} {group.teacher.lastName}
                </span>
              </div>
            )}

            {/* Schedule */}
            {group.schedule && (
              <div className="flex items-center gap-1.5 mb-3">
                <Clock
                  className="size-4 shrink-0 text-gray-400"
                  strokeWidth={1.5}
                />
                <div className="flex items-center gap-1.5 flex-wrap">
                  <div className="flex gap-1">
                    {group.schedule.days.map((day) => (
                      <span
                        key={day}
                        className="px-1.5 py-0.5 text-xs font-medium border border-stone-200 text-stone-500 bg-stone-50"
                      >
                        {getDayLabel(day)}
                      </span>
                    ))}
                  </div>
                  <span className="text-xs text-gray-500">
                    {group.schedule.time}
                  </span>
                </div>
              </div>
            )}

            {/* Price */}
            <div className="pt-3 border-t">
              <span className="text-sm font-semibold text-gray-900">
                {Number(group.price).toLocaleString("uz-UZ")} so'm
              </span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Classes;
