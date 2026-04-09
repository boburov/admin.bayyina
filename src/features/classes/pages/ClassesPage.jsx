// Components
import Card from "@/shared/components/ui/Card";
import Button from "@/shared/components/ui/button/Button";

// API
import { classesAPI } from "@/features/classes/api/classes.api";

// Icons
import { Plus, Edit, Trash2, ChevronRight, Download } from "lucide-react";

// Hooks
import useModal from "@/shared/hooks/useModal";
import useArrayStore from "@/shared/hooks/useArrayStore";
import { Link } from "react-router-dom";

const Classes = () => {
  const { openModal } = useModal();
  const { data: classes, isLoading } = useArrayStore("classes");

  // Excel yuklab olish
  const handleExport = async () => {
    try {
      const response = await classesAPI.exportAll();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `sinflar_${new Date().toISOString().split("T")[0]}.xlsx`,
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export xatosi:", error);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Yuklanmoqda...</div>;
  }

  return (
    <div>
      {/* Action Buttons */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <Button onClick={() => openModal("createClass")} className="px-3.5">
          <Plus strokeWidth={1.5} />
          Yangi Guruh
        </Button>

        <Button onClick={handleExport} className="px-3.5">
          <Download strokeWidth={1.5} />
        </Button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {classes.map((classItem) => (
          <Card key={classItem._id}>
            {/* Top */}
            <div className="flex justify-between items-start mb-4">
              <h3>
                <Link
                  to={`/classes/${classItem._id}`}
                  className="flex items-center gap-1.5 text-lg font-semibold text-gray-900 transition-colors duration-200 hover:text-blue-600"
                >
                  {classItem.name}
                  <ChevronRight className="size-5" strokeWidth={1.5} />
                </Link>
              </h3>

              {/* Action buttons */}
              <div className="flex gap-3.5">
                {/* Edit */}
                <button
                  onClick={() => openModal("editClass", classItem)}
                  className="text-blue-600 hover:text-blue-900"
                >
                  <Edit className="size-5" strokeWidth={1.5} />
                </button>

                {/* Delete */}
                <button
                  className="text-red-600 hover:text-red-900"
                  onClick={() => openModal("deleteClass", classItem)}
                >
                  <Trash2 className="size-5" strokeWidth={1.5} />
                </button>
              </div>
            </div>

            {/* Bottom */}
            <div className="flex items-center justify-between pt-4 border-t space-y-3">
              <span className="bg-green-100 text-green-800 px-2 py-1 text-xs font-semibold rounded-full">
                {classItem.isActive ? "Faol" : "Faol emas"}
              </span>
            </div>
          </Card>
        ))}
      </div>

      {classes.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">Hozircha sinflar yo'q</p>
        </div>
      )}
    </div>
  );
};

export default Classes;
