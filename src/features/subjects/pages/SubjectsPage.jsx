// Components
import Card from "@/shared/components/ui/Card";
import Button from "@/shared/components/form/button";

// API
import { subjectsAPI } from "@/features/subjects/api/subjects.api";

// Icons
import { Plus, Edit, Trash2, Download, ChevronRight } from "lucide-react";

// Hooks
import useModal from "@/shared/hooks/useModal";
import useArrayStore from "@/shared/hooks/useArrayStore";
import { Link } from "react-router-dom";

const Subjects = () => {
  const { openModal } = useModal();
  const { data: subjects, isLoading } = useArrayStore("subjects");

  // Excel yuklab olish
  const handleExport = async () => {
    try {
      const response = await subjectsAPI.export();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `fanlar_${new Date().toISOString().split("T")[0]}.xlsx`,
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
      <div className="flex items-center justify-between gap-3 mb-6">
        <Button onClick={() => openModal("createSubject")} className="px-3.5">
          <Plus className="size-5 mr-2" strokeWidth={1.5} />
          Yangi fan
        </Button>

        <Button onClick={handleExport} variant="primary" className="px-3.5">
          <Download className="size-5" strokeWidth={1.5} />
        </Button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects.map((subject) => (
          <Card key={subject._id}>
            {/* Top */}
            <div className="flex justify-between items-start mb-4">
              <h3>
                <Link
                  to={`/subjects/${subject._id}/topics`}
                  className="flex items-center gap-1.5 text-lg font-semibold text-gray-900 transition-colors duration-200 hover:text-blue-600"
                >
                  {subject.name}
                  <ChevronRight className="size-5" strokeWidth={1.5} />
                </Link>
              </h3>

              {/* Action buttons */}
              <div className="flex gap-3.5">
                {/* Edit */}
                <button
                  onClick={() => openModal("editSubject", subject)}
                  className="text-blue-600 hover:text-blue-900"
                >
                  <Edit className="size-5" strokeWidth={1.5} />
                </button>

                {/* Delete */}
                <button
                  className="text-red-600 hover:text-red-900"
                  onClick={() => openModal("deleteSubject", subject)}
                >
                  <Trash2 className="size-5" strokeWidth={1.5} />
                </button>
              </div>
            </div>

            {/* Description */}
            {subject.description && (
              <p className="text-sm text-gray-600 mb-4">
                {subject.description}
              </p>
            )}

            {/* Bottom */}
            <div className="flex items-center justify-between pt-4 border-t space-y-3">
              <span className="bg-green-100 text-green-800 px-2 py-1 text-xs font-semibold rounded-full">
                {subject.isActive ? "Faol" : "Faol emas"}
              </span>
            </div>
          </Card>
        ))}
      </div>

      {subjects.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">Hozircha fanlar yo'q</p>
        </div>
      )}
    </div>
  );
};

export default Subjects;
