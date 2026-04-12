// Toast
import { toast } from "sonner";

// Helpers
import {
  getGradeColor,
  getGradeForSubject,
  calculateAverageGrade,
} from "@/shared/helpers/grade.helpers";

// React
import { useState, useEffect } from "react";

// Router
import { Link, useNavigate } from "react-router-dom";

// Icons
import { Eye, Calendar, Download } from "lucide-react";

// Hooks
import useArrayStore from "@/shared/hooks/useArrayStore";

// Components
import Card from "@/shared/components/ui/Card";
import Input from "@/shared/components/ui/input/Input";
import Select from "@/shared/components/ui/select/Select";
import Button from "@/shared/components/ui/button/Button";

// Utils
import { getDayOfWeekUZ } from "@/shared/utils/date.utils";

// API
import { gradesAPI } from "@/features/grades/api/grades.api";
import { schedulesAPI } from "@/features/schedules/api/schedules.api";

const Grades = () => {
  // Load saved filters from localStorage
  const getSavedFilters = () => {
    const savedClassId = localStorage.getItem("grades_classId");
    const savedSubjectId = localStorage.getItem("grades_subjectId");
    const savedDate = localStorage.getItem("grades_date");

    return {
      classId: savedClassId || "",
      subjectId: savedSubjectId || "all",
      date: savedDate || new Date().toISOString().split("T")[0],
    };
  };

  const {
    initialize,
    hasCollection,
    setCollection,
    getCollectionData,
    isCollectionLoading,
    setCollectionLoadingState,
  } = useArrayStore();
  const [filters, setFilters] = useState(getSavedFilters());

  // Classes and subjects data
  const classes = getCollectionData("classes");
  const subjects = getCollectionData("subjects");
  // Students data
  const studentsCollectionName = `students-${filters.classId}-${filters.date}`;
  const students = getCollectionData(studentsCollectionName);
  const isLoading = isCollectionLoading(studentsCollectionName);
  // Today's subjects data
  const todaySubjectsCollectionName = `subjects-${filters.classId}-${filters.date}`;
  const todaySubjects = getCollectionData(todaySubjectsCollectionName);

  // Save filters to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("grades_classId", filters.classId);
    localStorage.setItem("grades_subjectId", filters.subjectId);
    localStorage.setItem("grades_date", filters.date);
  }, [filters]);

  const navigate = useNavigate();

  useEffect(() => {
    // Initialize collections (pagination = false)
    if (!hasCollection(studentsCollectionName))
      initialize(false, studentsCollectionName);
    if (!hasCollection(todaySubjectsCollectionName))
      initialize(false, todaySubjectsCollectionName);

    // Fetch grades and today's subjects
    if (
      filters.classId &&
      filters.date &&
      !students?.length &&
      !todaySubjects?.length
    ) {
      fetchGradesByClass();
      fetchTodaySubjects();
    }
  }, [filters.classId, filters.date]);

  const fetchTodaySubjects = () => {
    const dayName = getDayOfWeekUZ(filters.date);
    if (dayName === "yakshanba") {
      return setCollection([], null, todaySubjectsCollectionName);
    }

    schedulesAPI
      .getByDay(filters.classId, dayName)
      .then((response) => {
        if (response.data.data && response.data.data.subjects) {
          // Include all subjects with their order (even if fan bir necha marta bo'lsa)
          const scheduleSubjects = response.data.data.subjects
            .filter((s) => s.subject)
            .map((s) => ({ ...s.subject, lessonOrder: s.order }))
            .sort((a, b) => a.lessonOrder - b.lessonOrder);

          setCollection(scheduleSubjects, null, todaySubjectsCollectionName);
        } else {
          setCollection([], null, todaySubjectsCollectionName);
        }
      })
      .catch(() => setCollection([], true, todaySubjectsCollectionName));
  };

  const fetchGradesByClass = () => {
    setCollectionLoadingState(true, studentsCollectionName);

    gradesAPI
      .getByClassAndDate(filters.classId, filters.date)
      .then((response) => {
        const studentsWithGrades = response.data.data || [];
        setCollection(studentsWithGrades, null, studentsCollectionName);
      })
      .catch(() => {
        toast.error("Baholarni yuklashda xatolik");
        setCollection([], true, studentsCollectionName);
      });
  };

  const handleExport = async () => {
    try {
      const response = await gradesAPI.exportGrades(
        filters.classId,
        filters.date,
        filters.subjectId,
      );
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      const className =
        classes.find((c) => c._id === filters.classId)?.name || "Sinf";
      link.download = `${className}_baholar_${filters.date}.xlsx`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Fayl muvaffaqiyatli yuklandi");
    } catch (error) {
      toast.error(error.message || "Eksport qilishda xatolik yuz berdi");
    }
  };

  if (isLoading && !filters.classId) {
    return <div className="text-center py-8">Yuklanmoqda...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Top */}
      <div className="flex items-center justify-between">
        {/* Title */}
        <h1 className="page-title">Baholar jurnali</h1>

        {students.length > 0 && (
          <div className="flex justify-end gap-4 mt-4">
            {/* Export Button */}
            <Button
              onClick={handleExport}
              disabled={!filters.classId || !filters.date}
            >
              <Download className="size-4" strokeWidth={1.5} />
              Baholarni yuklash
            </Button>

            {/* Missing Grades Link */}
            <Button variant="danger" asChild>
              <Link to="/grades/missing">
                <Eye className="size-4" strokeWidth={1.5} />
                Qo'yilmagan baholar
              </Link>
            </Button>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Select
          required
          value={filters.classId}
          onChange={(value) => setFilters({ ...filters, classId: value })}
          options={classes.map((cls) => ({ label: cls.name, value: cls._id }))}
        />

        <Select
          required
          value={filters.subjectId}
          onChange={(v) => setFilters({ ...filters, subjectId: v })}
          options={[
            { label: "Barcha fanlar", value: "all" },
            ...subjects.map((s) => ({ label: s?.name, value: s?._id })),
          ]}
        />

        <Input
          required
          type="date"
          name="date"
          value={filters.date}
          onChange={(e) => setFilters({ ...filters, date: e.target.value })}
        />
      </div>

      {/* Grades View */}
      {!filters.classId && !isLoading && (
        <Card className="text-center">
          <Calendar
            className="w-12 h-12 text-blue-600 mx-auto mb-3"
            strokeWidth={1.5}
          />
          <p className="text-blue-800 text-lg">
            Baholarni ko'rish uchun kerakli maydonlarni tanlang
          </p>
        </Card>
      )}

      {/* Loading */}
      {isLoading && filters.classId && (
        <Card className="text-center">
          <p className="text-gray-500">Yuklanmoqda...</p>
        </Card>
      )}

      {/* No data */}
      {students.length === 0 && !isLoading && filters.classId && (
        <Card className="text-center">
          <Eye
            className="w-12 h-12 text-gray-400 mx-auto mb-3"
            strokeWidth={1.5}
          />
          <p className="text-gray-500">Tanlangan kun uchun baholar topilmadi</p>
        </Card>
      )}

      {/* Grades */}
      {students.length > 0 && (
        <div>
          <div className="rounded-lg overflow-x-auto border border-border bg-white">
            <table>
              {/* Thead */}
              <thead>
                <tr>
                  <th>#</th>
                  <th>O'quvchi</th>

                  {/* Subject */}
                  {filters.subjectId !== "all" && (
                    <>
                      <th>Baho</th>
                      <th>O'qituvchi</th>
                    </>
                  )}

                  {/* All subjects */}
                  {filters.subjectId === "all" && (
                    <>
                      {todaySubjects.map((subject, index) => (
                        <th key={`${subject.lessonOrder}-${subject._id}`}>
                          {index + 1}. {subject.name}
                        </th>
                      ))}

                      <th>O'rtacha</th>
                    </>
                  )}
                </tr>
              </thead>

              {/* Tbody */}
              <tbody>
                {students.map((studentData, index) => {
                  const relevantGrades =
                    filters.subjectId !== "all"
                      ? studentData.grades.filter(
                          (g) => g.subject._id === filters.subjectId,
                        )
                      : studentData.grades;

                  return (
                    <tr key={studentData.student._id}>
                      {/* Index */}
                      <td className="text-center text-sm text-gray-500">
                        {index + 1}
                      </td>

                      {/* Student */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {studentData.student.firstName}{" "}
                          {studentData.student.lastName}
                        </div>
                      </td>

                      {/* Single subject */}
                      {filters.subjectId !== "all" && (
                        <>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            {relevantGrades.length > 0 ? (
                              <span
                                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${getGradeColor(
                                  relevantGrades[0].grade,
                                )}`}
                              >
                                {relevantGrades[0].grade}
                              </span>
                            ) : (
                              <span className="text-gray-400 text-sm">-</span>
                            )}
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap">
                            {relevantGrades.length > 0 ? (
                              <span className="text-sm text-gray-600">
                                {relevantGrades[0].teacher.firstName}{" "}
                                {relevantGrades[0].teacher.lastName}
                              </span>
                            ) : (
                              <span className="text-gray-400 text-sm">-</span>
                            )}
                          </td>
                        </>
                      )}

                      {/* All subjects */}
                      {filters.subjectId == "all" && (
                        <>
                          {(() => {
                            // Fan takrorlanish indekslarini hisoblash
                            const subjectOccurrences = {};

                            return todaySubjects.map((subject) => {
                              const subjectIdStr = subject._id.toString();

                              // Bu fanning nechanchi marta takrorlanishini hisoblash
                              if (!subjectOccurrences[subjectIdStr]) {
                                subjectOccurrences[subjectIdStr] = 0;
                              }
                              const occurrenceIndex =
                                subjectOccurrences[subjectIdStr];
                              subjectOccurrences[subjectIdStr]++;

                              const grade = getGradeForSubject(
                                studentData.grades,
                                subject._id,
                                occurrenceIndex,
                              );

                              return (
                                <td
                                  key={`${subject.lessonOrder}-${subject._id}`}
                                  className="px-4 py-4 whitespace-nowrap text-center"
                                >
                                  {grade ? (
                                    <span
                                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-sm font-semibold border ${getGradeColor(
                                        grade.grade,
                                      )}`}
                                      title={
                                        grade.comment
                                          ? `Izoh: ${grade.comment}`
                                          : ""
                                      }
                                    >
                                      {grade.grade}
                                    </span>
                                  ) : (
                                    <span className="text-gray-400 text-sm">
                                      -
                                    </span>
                                  )}
                                </td>
                              );
                            });
                          })()}

                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            {studentData.grades.length > 0 ? (
                              <span className="text-sm font-semibold text-blue-900">
                                {calculateAverageGrade(studentData.grades)}
                              </span>
                            ) : (
                              <span className="text-gray-400 text-sm">-</span>
                            )}
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Grades;
