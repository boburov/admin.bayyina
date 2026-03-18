// Toast
import { toast } from "sonner";

// API
import { topicsAPI } from "@/features/subjects/api/topics.api";

// React
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

// Components
import Card from "@/shared/components/ui/Card";
import Select from "@/shared/components/form/select";
import Button from "@/shared/components/form/button";

// Hooks
import useModal from "@/shared/hooks/useModal";
import useArrayStore from "@/shared/hooks/useArrayStore";

// Icons
import { Upload, Trash2, BookOpen, Users } from "lucide-react";

const Topics = () => {
  const navigate = useNavigate();
  const { openModal } = useModal();
  const { data: uploadTopicsData } = useModal("uploadTopics");
  const { data: subjects } = useArrayStore("subjects");

  const [selectedSubject, setSelectedSubject] = useState("");
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(false);
  const lastUploadHandledAt = useRef(null);

  useEffect(() => {
    const savedSubjectId = localStorage.getItem("topics_selectedSubject");
    if (savedSubjectId) {
      setSelectedSubject(savedSubjectId);
    }
  }, []);

  useEffect(() => {
    if (selectedSubject) {
      localStorage.setItem("topics_selectedSubject", selectedSubject);
    } else {
      localStorage.removeItem("topics_selectedSubject");
    }
  }, [selectedSubject]);

  // Load topics when subject changes
  useEffect(() => {
    if (selectedSubject) {
      fetchTopics();
    } else {
      setTopics([]);
    }
  }, [selectedSubject]);

  useEffect(() => {
    const uploadedAt = uploadTopicsData?.uploadedAt;
    if (!uploadedAt || uploadedAt === lastUploadHandledAt.current) return;
    lastUploadHandledAt.current = uploadedAt;

    if (!selectedSubject) return;

    const uploadMode = uploadTopicsData?.uploadMode;
    const uploadSubjectId = uploadTopicsData?.subjectId;

    if (uploadMode === "all" || uploadSubjectId === selectedSubject) {
      fetchTopics();
    }
  }, [uploadTopicsData, selectedSubject]);

  const fetchTopics = async () => {
    setLoading(true);
    try {
      const response = await topicsAPI.getBySubject(selectedSubject);
      setTopics(response.data.data || []);
    } catch (error) {
      toast.error("Mavzularni yuklashda xatolik");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAllTopics = async () => {
    if (!selectedSubject) return;

    const selectedSubjectName =
      subjects.find((s) => s._id === selectedSubject)?.name || "Bu fan";

    const confirmed = window.confirm(
      `${selectedSubjectName} uchun barcha mavzular o'chiriladi. Davom etishni xohlaysizmi?`,
    );

    if (!confirmed) return;

    try {
      const response = await topicsAPI.deleteBySubject(selectedSubject);
      toast.success(response.data.message);
      setTopics([]);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Mavzularni o'chirishda xatolik",
      );
    }
  };

  return (
    <div>
      {/* Filters and Actions */}
      <Card className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Select
              label="Fan"
              value={selectedSubject}
              onChange={(value) => setSelectedSubject(value)}
              options={subjects.map((subject) => ({
                label: subject.name,
                value: subject._id,
              }))}
              placeholder="Fanni tanlang"
            />
          </div>

          <div className="flex gap-3 items-end">
            <Button
              className="px-5"
              variant="primary"
              onClick={() => openModal("uploadTopics")}
            >
              <Upload className="size-4 mr-2" strokeWidth={1.5} />
              Mavzular yuklash
            </Button>

            {selectedSubject && topics.length > 0 && (
              <Button
                className="px-5"
                variant="danger"
                onClick={handleDeleteAllTopics}
              >
                <Trash2 className="size-4" strokeWidth={1.5} />
              </Button>
            )}
          </div>
        </div>
      </Card>

      {selectedSubject && (
        <Card className="flex justify-end mb-6">
          <Button
            className="px-5"
            variant="primary"
            onClick={() => navigate(`/subjects/${selectedSubject}/topics`)}
          >
            <Users className="size-4 mr-2" strokeWidth={1.5} />
            Sinflar
          </Button>
        </Card>
      )}

      {/* Topics List */}
      {selectedSubject && (
        <div>
          {loading && (
            <div className="text-center py-12">
              <p className="text-gray-500">Yuklanmoqda...</p>
            </div>
          )}

          {!loading && topics.length === 0 && (
            <div className="text-center py-12">
              <BookOpen
                className="w-16 h-16 text-gray-400 mx-auto mb-4"
                strokeWidth={1.5}
              />

              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Mavzular topilmadi
              </h3>

              <p className="text-gray-600 mb-4">
                Bu fan uchun hali mavzular yuklanmagan
              </p>
            </div>
          )}

          {!loading && topics.length > 0 && (
            <div className="rounded-lg overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th>T/R</th>
                    <th>Mavzu nomi</th>
                    <th>Tavsif</th>
                  </tr>
                </thead>

                <tbody>
                  {topics.map((topic) => (
                    <tr key={topic._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {topic.order}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {topic.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {topic.description || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Topics;
