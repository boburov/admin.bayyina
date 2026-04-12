// Toast
import { toast } from "sonner";

// Utils
import { cn } from "@/shared/utils/cn";

// Hooks
import useModal from "@/shared/hooks/useModal";

// Router
import { useSearchParams } from "react-router-dom";

// API
import { statisticsAPI } from "@/features/statistics/api/statistics.api";
import { classesAPI } from "@/features/classes/api/classes.api";

// Components
import Card from "@/shared/components/ui/Card";
import Select from "@/shared/components/form/select";
import Button from "@/shared/components/ui/button/Button";
import Pagination from "@/shared/components/ui/Pagination";

// React
import { useState, useEffect, useCallback, useRef } from "react";

// Icons
import { Users, GraduationCap, Eye, School, Download } from "lucide-react";

const Statistics = () => {
  const { openModal } = useModal();
  const contentRef = useRef(null);

  // Search params
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get("page") || "1", 10);

  // States
  const [classes, setClasses] = useState([]);
  const [rankings, setRankings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState("school");
  const [selectedClass, setSelectedClass] = useState(null);

  // Pagination states
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPrevPage, setHasPrevPage] = useState(false);
  const [totalPages, setTotalPages] = useState(1);

  // Sinflarni yuklash
  useEffect(() => {
    classesAPI
      .getAll()
      .then((res) => {
        if (res.data.success) {
          setClasses(res.data.data || []);
          if (res.data.data && res.data.data.length > 0) {
            setSelectedClass(res.data.data[0]._id);
          }
        }
      })
      .catch(() => {
        toast.error("Sinflarni yuklashda xatolik");
      });
  }, []);

  // Reytinglarni yuklash
  const fetchRankings = useCallback(() => {
    setIsLoading(true);

    const params = { page: currentPage, limit: 50 };

    const apiCall =
      viewMode === "school"
        ? statisticsAPI.getSchoolRankings(params)
        : statisticsAPI.getClassRankings(selectedClass, params);

    apiCall
      .then((res) => {
        if (!res.data.success) return;
        setRankings(res.data.data.rankings || []);

        // Set pagination data
        if (res.data.pagination) {
          setHasNextPage(res.data.pagination.hasNextPage);
          setHasPrevPage(res.data.pagination.hasPrevPage);
          setTotalPages(res.data.pagination.totalPages);
        }
      })
      .catch((err) => {
        toast.error(
          err.response?.data?.message || "Reytinglarni yuklashda xatolik",
        );
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [viewMode, selectedClass, currentPage]);

  // Navigate to page
  const goToPage = useCallback(
    (page) => {
      if (page < 1) return;
      const params = new URLSearchParams(searchParams);
      params.set("page", page.toString());
      setSearchParams(params);
    },
    [searchParams, setSearchParams],
  );

  // View mode yoki sinf o'zgarganda page'ni 1 ga reset qilish
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    params.set("page", "1");
    setSearchParams(params);
  }, [viewMode, selectedClass]);

  // View mode o'zgarganda reytinglarni yangilash
  useEffect(() => {
    if (viewMode === "school" || (viewMode === "class" && selectedClass)) {
      fetchRankings();
    }
  }, [viewMode, selectedClass, fetchRankings]);

  // O'quvchi statistikasini ko'rsatish
  const handleViewStudent = useCallback(
    (studentId) => openModal("studentStats", { studentId }),
    [openModal],
  );

  // Sinf tanlash uchun options
  const classOptions = classes.map((c) => ({
    value: c._id,
    label: c.name,
  }));

  // Excel yuklab olish
  const handleExport = async () => {
    try {
      const params =
        viewMode === "class"
          ? { type: "class", classId: selectedClass }
          : { type: "school" };

      const response = await statisticsAPI.export(params);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;

      const fileName =
        viewMode === "class"
          ? `haftalik_reyting_sinf_${new Date().toISOString().split("T")[0]}.xlsx`
          : `haftalik_reyting_maktab_${new Date().toISOString().split("T")[0]}.xlsx`;

      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error("Excel yuklab olishda xatolik");
      console.error("Export xatosi:", error);
    }
  };

  // Badge color (rank bo'yicha)
  const getRankBadgeColor = (rank) => {
    if (rank === 1) return "bg-yellow-100 text-yellow-800 border-yellow-300";
    if (rank === 2) return "bg-gray-100 text-gray-800 border-gray-300";
    if (rank === 3) return "bg-orange-100 text-orange-800 border-orange-300";
    return "bg-blue-50 text-blue-700 border-blue-200";
  };

  return (
    <div>
      {/* Controls */}
      <Card className="mb-6">
        <div className="flex flex-col gap-4 md:flex-row">
          {/* View Mode Toggle */}
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ko'rinish
            </label>

            <div className="flex gap-4">
              <Button
                className="w-full"
                onClick={() => setViewMode("school")}
                variant={viewMode === "school" ? "default" : "secondary"}
              >
                <School />
                Maktab bo'yicha
              </Button>

              <Button
                className="w-full"
                onClick={() => setViewMode("class")}
                variant={viewMode === "class" ? "default" : "secondary"}
              >
                <Users />
                Sinf bo'yicha
              </Button>
            </div>
          </div>

          {/* Class Select (faqat sinf ko'rinishida) */}
          {viewMode === "class" && (
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sinf tanlang
              </label>
              <Select
                value={selectedClass}
                onChange={setSelectedClass}
                options={classOptions}
                placeholder="Sinfni tanlang"
              />
            </div>
          )}
        </div>
      </Card>

      {/* Rankings Table */}
      <div ref={contentRef}>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : rankings.length === 0 ? (
          <div className="text-center py-12">
            <GraduationCap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              Joriy haftada hech qanday natija topilmadi
            </p>
          </div>
        ) : (
          <div className="rounded-lg overflow-x-auto border border-border bg-white">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th>O'rin</th>
                  <th>O'quvchi</th>
                  {viewMode === "school" && <th>Sinflar</th>}
                  <th>Umumiy Ball</th>
                  <th>Baholar soni</th>
                  <th>Harakatlar</th>
                </tr>
              </thead>

              <tbody>
                {rankings.map((item) => (
                  <tr
                    key={item.student._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    {/* Rank */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div
                        className={cn(
                          "flex items-center justify-center min-h-8 px-1.5 rounded-full border",
                          getRankBadgeColor(item.rank),
                        )}
                      >
                        <span className="font-semibold">{item.rank}</span>
                      </div>
                    </td>

                    {/* Student Name */}
                    <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                      {item.student.fullName}
                    </td>

                    {/* Classes (faqat maktab ko'rinishida) */}
                    {viewMode === "school" && (
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {item.classes && item.classes.length > 0
                          ? item.classes.map((c) => c.name).join(", ")
                          : "-"}
                      </td>
                    )}

                    {/* Total Sum */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`font-semibold ${
                          item.totalSum >= 45
                            ? "text-green-600"
                            : item.totalSum >= 35
                              ? "text-blue-600"
                              : "text-orange-600"
                        }`}
                      >
                        {item.totalSum}
                      </span>
                    </td>

                    {/* Total Grades */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-gray-700">{item.totalGrades}</span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleViewStudent(item.student._id)}
                        className="flex items-center gap-2"
                      >
                        <Eye className="size-5" strokeWidth={1.5} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        {!isLoading && rankings.length > 0 && (
          <Pagination
            contentRef={contentRef}
            maxPageButtons={5}
            showPageNumbers={true}
            onPageChange={goToPage}
            currentPage={currentPage}
            hasNextPage={hasNextPage}
            hasPrevPage={hasPrevPage}
            className="pt-6"
            totalPages={totalPages}
          />
        )}
      </div>

      {/* Legend */}
      <Card className="flex flex-wrap gap-6 text-sm mt-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-gray-700">
            <strong>45+</strong> - A'lo natija
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span className="text-gray-700">
            <strong>35-44</strong> - Yaxshi natija
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
          <span className="text-gray-700">
            <strong>35 dan past</strong> - Qoniqarli natija
          </span>
        </div>

        {/* Export Button */}
        <Button
          className="ml-auto"
          onClick={handleExport}
          disabled={isLoading || (viewMode === "class" && !selectedClass)}
        >
          <Download />
          Yuklab olish
        </Button>
      </Card>
    </div>
  );
};

export default Statistics;
