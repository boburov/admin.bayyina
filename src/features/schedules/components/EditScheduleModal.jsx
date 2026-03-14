// Toast
import { toast } from "sonner";

// React
import { useState } from "react";

// Icons
import { Trash2 } from "lucide-react";

// Hooks
import useArrayStore from "@/shared/hooks/useArrayStore";

// API
import { schedulesAPI } from "@/shared/api/schedules.api";

// Components
import Button from "@/shared/components/ui/button/Button";
import InputGroup from "@/shared/components/ui/input/InputGroup";
import InputField from "@/shared/components/ui/input/InputField";
import SelectField from "@/shared/components/ui/select/SelectField";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

const EditScheduleModal = () => (
  <ResponsiveModal name="editSchedule" title="Dars jadvalini tahrirlash">
    <Content />
  </ResponsiveModal>
);

const Content = ({
  day,
  close,
  classId,
  isLoading,
  setIsLoading,
  ...scheduleData
}) => {
  const { invalidateCacheByStartsName, getCollectionData } =
    useArrayStore("schedules");
  const subjects = getCollectionData("subjects");
  const teachers = getCollectionData("teachers");

  const [startingOrder, setStartingOrder] = useState(
    scheduleData.startingOrder || 1,
  );
  const [daySubjects, setDaySubjects] = useState(() => {
    if (scheduleData.subjects && scheduleData.subjects.length > 0) {
      return scheduleData.subjects.map((subj) => ({
        subject:
          typeof subj.subject === "object" ? subj.subject?._id : subj.subject,
        teacher:
          typeof subj.teacher === "object" ? subj.teacher?._id : subj.teacher,
        order: subj.order,
        startTime: subj.startTime || "",
        endTime: subj.endTime || "",
      }));
    }
    return [{ subject: "", teacher: "", order: 1, startTime: "", endTime: "" }];
  });

  const addSubjectRow = () => {
    setDaySubjects([
      ...daySubjects,
      {
        subject: "",
        teacher: "",
        order: daySubjects.length + 1,
        startTime: "",
        endTime: "",
      },
    ]);
  };

  const removeSubjectRow = (index) => {
    const newSubjects = daySubjects.filter((_, i) => i !== index);
    setDaySubjects(newSubjects.map((s, i) => ({ ...s, order: i + 1 })));
  };

  const updateSubjectRow = (index, field, value) => {
    const newSubjects = [...daySubjects];
    newSubjects[index][field] = value;
    setDaySubjects(newSubjects);
  };

  const handleEditSchedule = (e) => {
    e.preventDefault();

    const validSubjects = daySubjects.filter((s) => s.subject && s.teacher);

    if (validSubjects.length === 0) {
      return toast.error("Kamida bitta fan va o'qituvchi tanlang");
    }

    setIsLoading(true);

    schedulesAPI
      .createOrUpdate({
        day,
        classId,
        subjects: validSubjects,
        startingOrder: parseInt(startingOrder) || 1,
      })
      .then(() => {
        close();
        invalidateCacheByStartsName();
        toast.success("Dars jadvali yangilandi");
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || "Xatolik yuz berdi");
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <form onSubmit={handleEditSchedule} className="space-y-3.5">
      {/* Starting Order Input */}
      <InputField
        min={1}
        required
        type="number"
        value={startingOrder}
        placeholder="1, 2, ..."
        label="Boshlanish tartibi"
        onChange={(e) => setStartingOrder(e.target.value)}
      />

      <div className="space-y-4">
        {daySubjects.map((subj, index) => (
          <div key={index} className="border border-gray-200 rounded-xl">
            <div className="flex justify-between items-center px-4 py-2 rounded-t-lg bg-gray-100">
              <h4 className="font-medium text-gray-900">{index + 1}-dars</h4>
              {daySubjects.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeSubjectRow(index)}
                  className="text-red-600 hover:text-red-900"
                >
                  <Trash2 className="size-4" strokeWidth={1.5} />
                </button>
              )}
            </div>

            <InputGroup className="grid-cols-2 p-1.5">
              <SelectField
                required
                label="Fan"
                value={subj.subject}
                onChange={(v) => updateSubjectRow(index, "subject", v)}
                options={subjects.map((s) => ({
                  label: s?.name,
                  value: s?._id,
                }))}
              />

              <SelectField
                required
                label="O'qituvchi"
                value={subj.teacher}
                onChange={(v) => updateSubjectRow(index, "teacher", v)}
                options={teachers.map((t) => ({
                  value: t?._id,
                  label: t?.fullName,
                }))}
              />

              <InputField
                required
                type="time"
                label="Boshlanish vaqti"
                value={subj.startTime}
                onChange={(e) =>
                  updateSubjectRow(index, "startTime", e.target.value)
                }
              />

              <InputField
                required
                type="time"
                label="Tugash vaqti"
                value={subj.endTime}
                onChange={(e) =>
                  updateSubjectRow(index, "endTime", e.target.value)
                }
              />
            </InputGroup>
          </div>
        ))}
      </div>

      {/* Add subject button */}
      <Button
        type="button"
        variant="outline"
        onClick={addSubjectRow}
        className="w-full border-2 border-dashed text-gray-600 hover:border-blue-500 hover:text-blue-500"
      >
        + Dars qo'shish
      </Button>

      {/* Action buttons */}
      <div className="flex flex-col-reverse gap-3.5 w-full mt-5 xs:m-0 xs:flex-row xs:justify-end">
        <Button
          type="button"
          className="w-full xs:w-32"
          variant="secondary"
          onClick={close}
        >
          Bekor qilish
        </Button>

        <Button autoFocus className="w-full xs:w-32" disabled={isLoading}>
          Yangilash
          {isLoading && "..."}
        </Button>
      </div>
    </form>
  );
};

export default EditScheduleModal;
