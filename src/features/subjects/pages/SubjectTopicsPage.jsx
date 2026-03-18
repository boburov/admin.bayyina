import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";

// API
import { schedulesAPI } from "@/features/schedules/api/schedules.api";
import { topicsAPI } from "@/features/subjects/api/topics.api";

// Components
import Card from "@/shared/components/ui/Card";

// Icons
import { ArrowLeft, Edit2, Check, X } from "lucide-react";

const SubjectTopics = () => {
  const { subjectId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState(null);
  const [classesData, setClassesData] = useState([]);
  const [topics, setTopics] = useState([]);

  // Edit state
  const [editingClassId, setEditingClassId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, [subjectId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch classes by subject and topics in parallel
      const [schedulesRes, topicsRes] = await Promise.all([
        schedulesAPI.getBySubject(subjectId),
        topicsAPI.getBySubject(subjectId),
      ]);

      setSubject(schedulesRes.data.subject);
      setClassesData(schedulesRes.data.data);
      setTopics(topicsRes.data.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Ma'lumotlarni yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  const getTopicName = (topicNumber) => {
    const topic = topics.find((t) => t.order === topicNumber);
    return topic?.name || `${topicNumber}-mavzu`;
  };

  const handleEditClick = (item) => {
    setEditingClassId(item.class._id);
    setEditValue(String(item.currentTopicNumber));
  };

  const handleCancel = () => {
    setEditingClassId(null);
    setEditValue("");
  };

  const handleSave = async (item) => {
    const newNumber = parseInt(editValue, 10);

    if (isNaN(newNumber) || newNumber < 1) {
      toast.error("Mavzu raqami kamida 1 bo'lishi kerak");
      return;
    }

    if (newNumber > topics.length) {
      toast.error(`Mavzu raqami ${topics.length} dan oshmasligi kerak`);
      return;
    }

    setSaving(true);
    try {
      await schedulesAPI.updateCurrentTopic(
        item.class._id,
        subjectId,
        newNumber,
      );

      // Update local state
      setClassesData((prev) =>
        prev.map((c) =>
          c.class._id === item.class._id
            ? { ...c, currentTopicNumber: newNumber }
            : c,
        ),
      );

      toast.success("Mavzu raqami yangilandi");
      setEditingClassId(null);
    } catch (error) {
      console.error("Error updating topic:", error);
      toast.error(error.response?.data?.message || "Xatolik yuz berdi");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Yuklanmoqda...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="size-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          {subject?.name || "Fan"}
        </h1>
      </div>

      {/* Classes List */}
      {classesData.length === 0 ? (
        <Card>
          <p className="text-center text-gray-500 py-8">
            Bu fan hech qaysi sinf jadvalida yo'q
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {classesData.map((item) => {
            const isEditing = editingClassId === item.class._id;

            return (
              <Card key={item.class._id}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Class Name */}
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {item.class.name}
                    </h3>

                    {/* Current Topic */}
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="1"
                          max={topics.length || 999}
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="w-20 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSave(item);
                            if (e.key === "Escape") handleCancel();
                          }}
                        />
                        <span className="text-sm text-gray-500">
                          / {topics.length}
                        </span>
                        <button
                          onClick={() => handleSave(item)}
                          disabled={saving}
                          className="p-1 text-green-600 hover:bg-green-50 rounded"
                        >
                          <Check className="size-4" />
                        </button>
                        <button
                          onClick={handleCancel}
                          disabled={saving}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          <X className="size-4" />
                        </button>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-2xl font-bold text-blue-600">
                            {item.currentTopicNumber}
                          </span>
                          <span className="text-gray-400">
                            / {topics.length}
                          </span>
                          <button
                            onClick={() => handleEditClick(item)}
                            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                          >
                            <Edit2 className="size-4" />
                          </button>
                        </div>
                        <p className="text-sm text-gray-600">
                          {getTopicName(item.currentTopicNumber)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{
                        width: `${topics.length > 0 ? (item.currentTopicNumber / topics.length) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1 text-right">
                    {topics.length > 0
                      ? Math.round(
                          (item.currentTopicNumber / topics.length) * 100,
                        )
                      : 0}
                    % tugallangan
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SubjectTopics;
